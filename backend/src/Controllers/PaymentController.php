<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use PDO;
use Exception;

class PaymentController {
    private string $secretKey;
    private string $publicKey;

    public function __construct() {
        $this->secretKey = getenv('PAYSTACK_SECRET_KEY') ?: 'sk_test_4c010fd7af831d05d26baacc954058118d3f9c72';
        $this->publicKey = getenv('PAYSTACK_PUBLIC_KEY') ?: 'pk_test_5ea45ba389e8fa8ee4fcf3d95cbcbef4e1d0d47f';
    }

    /**
     * POST /api/payment/initialize
     * Body: { order_id, amount, email, callback_url }
     */
    public function initialize(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        $orderId = isset($input['order_id']) ? (int)$input['order_id'] : null;
        $amount = (float)($input['amount'] ?? 0);
        $email = trim($input['email'] ?? '');
        $callbackUrl = trim($input['callback_url'] ?? '');

        if ($amount <= 0 || empty($email)) {
            Response::error('Valid amount and email are required', 400);
        }

        // Generate unique reference (Idempotency Key base)
        $reference = 'AHM-' . date('YmdHis') . '-' . strtoupper(bin2hex(random_bytes(4)));

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            // Insert initial transaction record with 'pending' status
            $stmt = $db->prepare("
                INSERT INTO transactions (reference, order_id, amount, currency, status, customer_email, metadata)
                VALUES (:reference, :order_id, :amount, 'NGN', 'pending', :email, :metadata)
            ");
            $stmt->execute([
                'reference' => $reference,
                'order_id' => $orderId,
                'amount' => $amount,
                'email' => $email,
                'metadata' => json_encode([
                    'order_id' => $orderId,
                    'initialized_at' => date('Y-m-d H:i:s'),
                ]),
            ]);

            // Call Paystack API
            $paystackPayload = [
                'email' => $email,
                'amount' => (int)round($amount * 100), // Paystack requires kobo
                'reference' => $reference,
            ];
            if (!empty($callbackUrl)) {
                $paystackPayload['callback_url'] = $callbackUrl;
            }

            $res = $this->callPaystack('/transaction/initialize', 'POST', $paystackPayload);

            if (!($res['status'] ?? false)) {
                $db->rollBack();
                Response::error($res['message'] ?? 'Failed to initialize Paystack transaction', 500);
            }

            $db->commit();

            Response::json([
                'status' => 'success',
                'reference' => $reference,
                'authorization_url' => $res['data']['authorization_url'] ?? null,
                'access_code' => $res['data']['access_code'] ?? null,
                'public_key' => $this->publicKey,
            ]);

        } catch (Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/payment/verify
     * Body: { reference }
     * Idempotent & Atomic Verification
     */
    public function verify(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $reference = trim($input['reference'] ?? $_GET['reference'] ?? '');

        if (empty($reference)) {
            Response::error('Transaction reference is required', 400);
        }

        $db = Database::getConnection();

        try {
            $db->beginTransaction();

            // Row-level lock for atomicity and idempotency
            $stmt = $db->prepare("SELECT * FROM transactions WHERE reference = :reference FOR UPDATE");
            $stmt->execute(['reference' => $reference]);
            $transaction = $stmt->fetch();

            if (!$transaction) {
                $db->rollBack();
                Response::error('Transaction reference not found', 404);
            }

            // IDEMPOTENCY CHECK: If already confirmed success, return stored result
            if ($transaction['status'] === 'success') {
                $db->commit();
                Response::json([
                    'status' => 'success',
                    'message' => 'Transaction already processed successfully',
                    'already_processed' => true,
                    'transaction' => $transaction,
                ]);
            }

            // Verify with Paystack API
            $res = $this->callPaystack('/transaction/verify/' . rawurlencode($reference), 'GET');

            if (!($res['status'] ?? false)) {
                $db->rollBack();
                Response::error($res['message'] ?? 'Payment verification failed', 400);
            }

            $paystackData = $res['data'] ?? [];
            $paymentStatus = $paystackData['status'] ?? 'failed';

            if ($paymentStatus === 'success') {
                // ATOMIC UPDATE: Update transaction status
                $updateTx = $db->prepare("
                    UPDATE transactions
                    SET status = 'success',
                        paystack_reference = :paystack_ref,
                        channel = :channel,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE reference = :reference
                ");
                $updateTx->execute([
                    'paystack_ref' => $paystackData['id'] ?? null,
                    'channel' => $paystackData['channel'] ?? 'card',
                    'reference' => $reference,
                ]);

                // ATOMIC UPDATE: If order_id exists, update order status to confirmed
                if (!empty($transaction['order_id'])) {
                    $updateOrder = $db->prepare("
                        UPDATE orders
                        SET status = 'confirmed',
                            paystack_ref = :reference
                        WHERE id = :order_id
                    ");
                    $updateOrder->execute([
                        'reference' => $reference,
                        'order_id' => $transaction['order_id'],
                    ]);
                }

                $db->commit();

                Response::json([
                    'status' => 'success',
                    'message' => 'Payment verified successfully',
                    'reference' => $reference,
                    'amount' => $transaction['amount'],
                    'order_id' => $transaction['order_id'],
                ]);
            } else {
                $updateTx = $db->prepare("UPDATE transactions SET status = 'failed' WHERE reference = :reference");
                $updateTx->execute(['reference' => $reference]);

                $db->commit();
                Response::error('Payment was not successful. Status: ' . $paymentStatus, 400);
            }

        } catch (Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * POST /api/payment/webhook
     * Paystack Webhook Event Handler (Idempotent & Signature Verified)
     */
    public function webhook(): void {
        $input = file_get_contents('php://input');
        $signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';

        // Verify Paystack signature
        $expectedSignature = hash_hmac('sha512', $input, $this->secretKey);
        if ($signature !== $expectedSignature) {
            Response::error('Invalid signature', 401);
        }

        $event = json_decode($input, true);
        if (!isset($event['event']) || $event['event'] !== 'charge.success') {
            Response::json(['status' => 'ignored']);
        }

        $data = $event['data'] ?? [];
        $reference = $data['reference'] ?? '';

        if (empty($reference)) {
            Response::json(['status' => 'ignored']);
        }

        $db = Database::getConnection();

        try {
            $db->beginTransaction();

            $stmt = $db->prepare("SELECT * FROM transactions WHERE reference = :reference FOR UPDATE");
            $stmt->execute(['reference' => $reference]);
            $transaction = $stmt->fetch();

            if ($transaction && $transaction['status'] !== 'success') {
                $updateTx = $db->prepare("
                    UPDATE transactions
                    SET status = 'success',
                        paystack_reference = :paystack_ref,
                        channel = :channel,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE reference = :reference
                ");
                $updateTx->execute([
                    'paystack_ref' => $data['id'] ?? null,
                    'channel' => $data['channel'] ?? 'card',
                    'reference' => $reference,
                ]);

                if (!empty($transaction['order_id'])) {
                    $updateOrder = $db->prepare("
                        UPDATE orders
                        SET status = 'confirmed',
                            paystack_ref = :reference
                        WHERE id = :order_id
                    ");
                    $updateOrder->execute([
                        'reference' => $reference,
                        'order_id' => $transaction['order_id'],
                    ]);
                }
            }

            $db->commit();
            Response::json(['status' => 'success']);

        } catch (Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::error($e->getMessage(), 500);
        }
    }

    private function callPaystack(string $endpoint, string $method = 'GET', ?array $data = null): array {
        $url = 'https://api.paystack.co' . $endpoint;
        $ch = curl_init($url);

        $headers = [
            'Authorization: Bearer ' . $this->secretKey,
            'Content-Type: application/json',
            'Cache-Control: no-cache',
        ];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            return ['status' => false, 'message' => 'Curl error: ' . $err];
        }

        return json_decode($response, true) ?? ['status' => false, 'message' => 'Invalid JSON from Paystack'];
    }
}
