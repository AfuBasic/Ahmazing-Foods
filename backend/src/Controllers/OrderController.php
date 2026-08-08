<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use App\Services\EmailService;
use Exception;
use DateTime;

class OrderController {
    private string $jsonFile = __DIR__ . '/../../database/orders.json';

    private function getJsonOrders(): array {
        if (!file_exists($this->jsonFile)) {
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
        $jsonOrders = $this->getJsonOrders();

        // Check if DB is available
        $dbOrders = [];
        try {
            $db = Database::getConnection();
            if ($status) {
                $stmt = $db->prepare("SELECT * FROM orders WHERE status = :status ORDER BY created_at DESC");
                $stmt->execute(['status' => $status]);
            } else {
                $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
            }
            $dbOrders = $stmt->fetchAll() ?: [];
        } catch (Exception $e) {
            $dbOrders = [];
        }

        // Merge JSON orders and DB orders
        $ordersMap = [];
        foreach ($dbOrders as $o) {
            $id = (int)$o['id'];
            $ordersMap[$id] = [
                'id' => $id,
                'status' => $o['status'] ?? 'pending',
                'itemPrice' => (int)($o['item_price'] ?? 0),
                'rushFee' => (int)($o['rush_fee'] ?? 0),
                'total' => (int)($o['total'] ?? 0),
                'customerName' => $o['customer_name'] ?? '',
                'customerPhone' => $o['customer_phone'] ?? '',
                'customerEmail' => $o['customer_email'] ?? '',
                'deliveryAddress' => $o['delivery_address'] ?? '',
                'deliveryDate' => $o['delivery_date'] ?? '',
                'deliverySlot' => $o['delivery_slot'] ?? '',
                'menuItemName' => $o['menu_item_name'] ?? '',
                'selectedSize' => $o['selected_size'] ?? '',
                'selectedProtein' => $o['selected_protein'] ?? null,
                'pepperLevel' => $o['pepper_level'] ?? null,
                'notes' => $o['notes'] ?? '',
                'cartItems' => is_string($o['cart_items'] ?? null) ? json_decode($o['cart_items'], true) : ($o['cart_items'] ?? []),
                'created_at' => $o['created_at'] ?? date('Y-m-d H:i:s'),
            ];
        }

        foreach ($jsonOrders as $jo) {
            $id = (int)$jo['id'];
            $ordersMap[$id] = array_merge($ordersMap[$id] ?? [], $jo);
        }

        $allOrders = array_values($ordersMap);
        usort($allOrders, fn($a, $b) => ($b['id'] <=> $a['id']));

        if ($status && $status !== 'all') {
            $allOrders = array_values(array_filter($allOrders, function($o) use ($status) {
                if ($status === 'fulfilled') return $o['status'] === 'fulfilled' || $o['status'] === 'delivered';
                if ($status === 'pending') return $o['status'] === 'pending';
                return $o['status'] === $status;
            }));
        }

        Response::json($allOrders);
    }

    public function create(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['customerName']) || empty($input['customerPhone']) || empty($input['deliveryDate']) || empty($input['deliverySlot'])) {
            Response::error('Missing required order fields');
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
            'created_at'      => date('Y-m-d H:i:s'),
        ];

        // Save to database/orders.json
        array_unshift($jsonOrders, $orderData);
        $this->saveJsonOrders($jsonOrders);

        // Save to MySQL DB if connection active
        try {
            $db = Database::getConnection();
            $insertStmt = $db->prepare("
                INSERT INTO orders (
                    id, menu_item_id, menu_item_name, category, selected_size, selected_protein,
                    customer_name, customer_phone, customer_email, delivery_address, delivery_date,
                    delivery_slot, item_price, rush_fee, total, status, pepper_level, cart_items, notes
                ) VALUES (
                    :id, :menu_item_id, :menu_item_name, :category, :selected_size, :selected_protein,
                    :customer_name, :customer_phone, :customer_email, :delivery_address, :delivery_date,
                    :delivery_slot, :item_price, :rush_fee, :total, 'pending', :pepper_level, :cart_items, :notes
                )
            ");
            $insertStmt->execute([
                'id' => $nextId,
                'menu_item_id' => $input['menuItemId'] ?? 1,
                'menu_item_name' => $menuItemName,
                'category' => $mainItem['category'] ?? 'soups',
                'selected_size' => $selectedSize,
                'selected_protein' => $selectedProtein,
                'customer_name' => $input['customerName'],
                'customer_phone' => $input['customerPhone'],
                'customer_email' => $input['customerEmail'] ?? null,
                'delivery_address' => $input['deliveryAddress'] ?? null,
                'delivery_date' => substr($input['deliveryDate'], 0, 10),
                'delivery_slot' => $input['deliverySlot'],
                'item_price' => $totalPrice,
                'rush_fee' => (int)($input['rushFee'] ?? 0),
                'total' => $totalPrice + (int)($input['rushFee'] ?? 0),
                'pepper_level' => $input['pepperLevel'] ?? null,
                'cart_items' => is_array($cartItems) ? json_encode($cartItems) : null,
                'notes' => $input['notes'] ?? null,
            ]);
        } catch (Exception $e) {
            // Ignore DB error if running without MySQL
        }

        // Trigger HTML Email Notification to afutunde@gmail.com
        try {
            EmailService::sendBookingNotification($orderData);
        } catch (Exception $e) {
            // Email sending silent failure
        }

        Response::json($orderData, 201);
    }

    public function get(int $id): void {
        $jsonOrders = $this->getJsonOrders();
        foreach ($jsonOrders as $jo) {
            if ((int)$jo['id'] === $id) {
                Response::json($jo);
                return;
            }
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $id]);
            $order = $stmt->fetch();
            if ($order) {
                Response::json([
                    'id' => (int)$order['id'],
                    'status' => $order['status'],
                    'customerName' => $order['customer_name'],
                    'customerPhone' => $order['customer_phone'],
                    'customerEmail' => $order['customer_email'],
                    'deliveryAddress' => $order['delivery_address'],
                    'deliveryDate' => $order['delivery_date'],
                    'deliverySlot' => $order['delivery_slot'],
                    'menuItemName' => $order['menu_item_name'],
                    'selectedSize' => $order['selected_size'],
                    'total' => (int)$order['total'],
                    'notes' => $order['notes'],
                    'cartItems' => is_string($order['cart_items'] ?? null) ? json_decode($order['cart_items'], true) : [],
                ]);
                return;
            }
        } catch (Exception $e) {
            // ignore DB error
        }

        Response::error('Order not found', 404);
    }

    public function updateStatus(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true);
        $newStatus = $input['status'] ?? 'fulfilled';

        $jsonOrders = $this->getJsonOrders();
        $updatedOrder = null;

        foreach ($jsonOrders as &$jo) {
            if ((int)$jo['id'] === $id) {
                $jo['status'] = $newStatus;
                $updatedOrder = $jo;
                break;
            }
        }
        unset($jo);

        if ($updatedOrder) {
            $this->saveJsonOrders($jsonOrders);
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("UPDATE orders SET status = :status WHERE id = :id");
            $stmt->execute(['status' => $newStatus, 'id' => $id]);
        } catch (Exception $e) {
            // ignore DB error
        }

        if ($updatedOrder) {
            Response::json($updatedOrder);
        } else {
            Response::json(['id' => $id, 'status' => $newStatus, 'message' => 'Status updated']);
        }
    }

    public function summary(): void {
        $jsonOrders = $this->getJsonOrders();
        
        $todayStr = date('Y-m-d');
        $todayOrders = array_filter($jsonOrders, fn($o) => substr($o['created_at'] ?? '', 0, 10) === $todayStr || ($o['deliveryDate'] ?? '') === $todayStr);

        $countByStatus = function(string $s) use ($jsonOrders) {
            return count(array_filter($jsonOrders, fn($o) => ($o['status'] ?? '') === $s));
        };

        $totalRevenue = array_reduce(
            array_filter($jsonOrders, fn($o) => ($o['status'] ?? '') !== 'cancelled'),
            fn($sum, $o) => $sum + (int)($o['total'] ?? 0),
            0
        );

        $todayRevenue = array_reduce(
            array_filter($todayOrders, fn($o) => ($o['status'] ?? '') !== 'cancelled'),
            fn($sum, $o) => $sum + (int)($o['total'] ?? 0),
            0
        );

        $recent = array_slice($jsonOrders, 0, 10);

        Response::json([
            'totalOrders' => count($jsonOrders),
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
}
