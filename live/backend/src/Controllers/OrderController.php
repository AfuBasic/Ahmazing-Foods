<?php

namespace App\Controllers;

use App\Response;
use App\Services\EmailService;
use Exception;

class OrderController {
    private string $jsonFile = __DIR__ . '/../../database/orders.json';

    private function getJsonOrders(): array {
        if (!file_exists($this->jsonFile)) {
            @mkdir(dirname($this->jsonFile), 0755, true);
            file_put_contents($this->jsonFile, json_encode([], JSON_PRETTY_PRINT));
            return [];
        }
        $data = file_get_contents($this->jsonFile);
        $decoded = json_decode($data, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function saveJsonOrders(array $orders): void {
        file_put_contents($this->jsonFile, json_encode(array_values($orders), JSON_PRETTY_PRINT));
    }

    public function list(): void {
        $status = $_GET['status'] ?? null;
        $orders = $this->getJsonOrders();

        usort($orders, fn($a, $b) => ((int)$b['id'] <=> (int)$a['id']));

        if ($status && $status !== 'all') {
            $orders = array_values(array_filter($orders, function($o) use ($status) {
                if ($status === 'fulfilled') return ($o['status'] ?? '') === 'fulfilled' || ($o['status'] ?? '') === 'delivered';
                if ($status === 'pending') return ($o['status'] ?? '') === 'pending';
                return ($o['status'] ?? '') === $status;
            }));
        }

        Response::json($orders);
    }

    public function create(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['customerName']) || empty($input['customerPhone']) || empty($input['deliveryDate']) || empty($input['deliverySlot'])) {
            Response::error('Missing required order fields', 400);
            return;
        }

        $jsonOrders = $this->getJsonOrders();
        $nextId = 1000 + count($jsonOrders) + 1;

        $cartItems = $input['cartItems'] ?? [];
        $totalPrice = 0;
        if (is_array($cartItems) && count($cartItems) > 0) {
            foreach ($cartItems as $ci) {
                $totalPrice += (int)($ci['price'] ?? 0);
            }
        }

        $mainItem = $cartItems[0] ?? [];
        $menuItemName = $mainItem['menuItemName'] ?? $input['menuItemName'] ?? 'Custom Selection';
        $selectedSize = $mainItem['selectedSize'] ?? $input['selectedSize'] ?? 'Standard';
        $selectedProtein = $mainItem['selectedProteins'][0]['name'] ?? $input['selectedProtein'] ?? null;
        $nowStr = date('Y-m-d H:i:s');

        $orderData = [
            'id'              => $nextId,
            'status'          => 'pending',
            'customerName'    => $input['customerName'],
            'customerPhone'   => $input['customerPhone'],
            'customerEmail'   => $input['customerEmail'] ?? '',
            'deliveryAddress' => $input['deliveryAddress'] ?? '',
            'deliveryDate'    => substr($input['deliveryDate'], 0, 10),
            'deliverySlot'    => $input['deliverySlot'],
            'menuItemName'    => $menuItemName,
            'selectedSize'    => $selectedSize,
            'selectedProtein' => $selectedProtein,
            'itemPrice'       => $totalPrice,
            'rushFee'         => (int)($input['rushFee'] ?? 0),
            'total'           => $totalPrice + (int)($input['rushFee'] ?? 0),
            'pepperLevel'     => $input['pepperLevel'] ?? null,
            'notes'           => $input['notes'] ?? '',
            'cartItems'       => $cartItems,
            'created_at'      => $nowStr,
            'createdAt'       => $nowStr,
        ];

        // Save directly to database/orders.json
        array_unshift($jsonOrders, $orderData);
        $this->saveJsonOrders($jsonOrders);

        // Send HTML email notification to admin (afutunde@gmail.com)
        try {
            EmailService::sendBookingNotification($orderData);
        } catch (Exception $e) {
            // Email sending silent failure
        }

        Response::json($orderData, 201);
    }

    public function get(int $id): void {
        $orders = $this->getJsonOrders();
        foreach ($orders as $o) {
            if ((int)$o['id'] === $id) {
                Response::json($o);
                return;
            }
        }
        Response::error('Order not found', 404);
    }

    public function updateStatus(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $newStatus = $input['status'] ?? 'fulfilled';

        $orders = $this->getJsonOrders();
        $updatedOrder = null;

        foreach ($orders as &$o) {
            if ((int)$o['id'] === $id) {
                $o['status'] = $newStatus;
                $updatedOrder = $o;
                break;
            }
        }
        unset($o);

        if ($updatedOrder) {
            $this->saveJsonOrders($orders);
            Response::json($updatedOrder);
        } else {
            Response::error('Order not found', 404);
        }
    }

    public function summary(): void {
        $orders = $this->getJsonOrders();
        
        $todayStr = date('Y-m-d');
        $todayOrders = array_filter($orders, fn($o) => substr($o['created_at'] ?? $o['createdAt'] ?? '', 0, 10) === $todayStr || ($o['deliveryDate'] ?? '') === $todayStr);

        $countByStatus = function(string $s) use ($orders) {
            return count(array_filter($orders, fn($o) => ($o['status'] ?? '') === $s));
        };

        $totalRevenue = array_reduce(
            array_filter($orders, fn($o) => ($o['status'] ?? '') !== 'cancelled'),
            fn($sum, $o) => $sum + (int)($o['total'] ?? 0),
            0
        );

        $todayRevenue = array_reduce(
            array_filter($todayOrders, fn($o) => ($o['status'] ?? '') !== 'cancelled'),
            fn($sum, $o) => $sum + (int)($o['total'] ?? 0),
            0
        );

        usort($orders, fn($a, $b) => ((int)$b['id'] <=> (int)$a['id']));
        $recent = array_slice($orders, 0, 10);

        Response::json([
            'totalOrders' => count($orders),
            'pendingOrders' => $countByStatus('pending'),
            'confirmedOrders' => $countByStatus('fulfilled') + $countByStatus('confirmed') + $countByStatus('payment_confirmed'),
            'cookingOrders' => $countByStatus('cooking_in_progress') + $countByStatus('cooking'),
            'deliveredOrders' => $countByStatus('delivered') + $countByStatus('fulfilled'),
            'cancelledOrders' => $countByStatus('cancelled'),
            'totalRevenue' => $totalRevenue,
            'todayOrders' => count($todayOrders),
            'todayRevenue' => $todayRevenue,
            'recentOrders' => $recent,
        ]);
    }

    public function delete(int $id): void {
        $orders = $this->getJsonOrders();
        $filtered = array_values(array_filter($orders, fn($o) => (int)$o['id'] !== $id));

        if (count($filtered) === count($orders)) {
            Response::error('Order not found', 404);
            return;
        }

        $this->saveJsonOrders($filtered);
        Response::json(['success' => true, 'message' => "Order #{$id} deleted successfully"]);
    }
}
