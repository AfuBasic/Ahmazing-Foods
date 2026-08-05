<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use App\Auth;
use App\Services\EmailService;
use App\Services\CalendarService;
use PDO;
use DateTime;

class OrderController {
    private array $rushFeeRates = [
        1 => 20000,
        2 => 15000,
        3 => 13000,
        4 => 12000,
        5 => 10000,
    ];

    private function calcRushFee(bool $isRush, int $distinctMealCount): int {
        if (!$isRush) return 0;
        $count = min(max($distinctMealCount, 1), 5);
        $rate = $this->rushFeeRates[$count] ?? 10000;
        return $rate * $count;
    }

    private function isRushOrder(string $deliveryDate): bool {
        $delivery = new DateTime($deliveryDate);
        $now = new DateTime();
        $diffHours = ($delivery->getTimestamp() - $now->getTimestamp()) / 3600;
        return $diffHours < 24;
    }

    public function list(): void {
        $db = Database::getConnection();
        $status = $_GET['status'] ?? null;

        if ($status) {
            $stmt = $db->prepare("SELECT * FROM orders WHERE status = :status ORDER BY created_at DESC");
            $stmt->execute(['status' => $status]);
        } else {
            $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
        }

        $orders = $stmt->fetchAll();
        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $order['itemPrice'] = (int)$order['item_price'];
            $order['rushFee'] = (int)$order['rush_fee'];
            $order['total'] = (int)$order['total'];
            $order['customerName'] = $order['customer_name'];
            $order['customerPhone'] = $order['customer_phone'];
            $order['customerEmail'] = $order['customer_email'];
            $order['deliveryAddress'] = $order['delivery_address'];
            $order['deliveryDate'] = $order['delivery_date'];
            $order['deliverySlot'] = $order['delivery_slot'];
            $order['menuItemName'] = $order['menu_item_name'];
            $order['selectedSize'] = $order['selected_size'];
            $order['selectedProtein'] = $order['selected_protein'];
            $order['cartItems'] = is_string($order['cart_items']) ? json_decode($order['cart_items'], true) : $order['cart_items'];
        }

        Response::json($orders);
    }

    public function create(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input['menuItemId']) || empty($input['customerName']) || empty($input['customerPhone']) || empty($input['deliveryDate']) || empty($input['deliverySlot'])) {
            Response::error('Missing required order fields');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM menu_items WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => (int)$input['menuItemId']]);
        $menuItem = $stmt->fetch();

        if (!$menuItem) {
            Response::error('Menu item not found', 404);
        }

        if (!$menuItem['available']) {
            Response::error('This item is currently unavailable', 400);
        }

        $cartItems = $input['cartItems'] ?? null;
        $itemPrice = 0;

        if (is_array($cartItems) && count($cartItems) > 0) {
            foreach ($cartItems as $ci) {
                $itemPrice += (int)($ci['price'] ?? 0);
            }
        } else {
            $sizes = is_string($menuItem['sizes']) ? json_decode($menuItem['sizes'], true) : $menuItem['sizes'];
            $selectedSize = $input['selectedSize'] ?? '';
            $sizeOption = null;

            foreach ($sizes as $s) {
                if ($s['label'] === $selectedSize) {
                    $sizeOption = $s;
                    break;
                }
            }

            if (!$sizeOption) {
                Response::error('Invalid size selected', 400);
            }

            $proteinCost = 0;
            if (!empty($input['selectedProtein'])) {
                $proteins = is_string($menuItem['proteins']) ? json_decode($menuItem['proteins'], true) : $menuItem['proteins'];
                foreach ($proteins as $p) {
                    if ($p['name'] === $input['selectedProtein']) {
                        $proteinCost = (int)$p['extraCost'];
                        break;
                    }
                }
            }

            $itemPrice = (int)$sizeOption['price'] + $proteinCost;
        }

        $isRush = $this->isRushOrder($input['deliveryDate']);
        $distinctMealCount = (is_array($cartItems) && count($cartItems) > 0)
            ? count(array_unique(array_column($cartItems, 'menuItemId')))
            : 1;

        $rushFee = $this->calcRushFee($isRush, $distinctMealCount);
        $total = $itemPrice + $rushFee;

        $insertStmt = $db->prepare("
            INSERT INTO orders (
                menu_item_id, menu_item_name, category, selected_size, selected_protein,
                customer_name, customer_phone, customer_email, delivery_address, delivery_date,
                delivery_slot, item_price, rush_fee, total, status, paystack_ref, pepper_level, cart_items, notes
            ) VALUES (
                :menu_item_id, :menu_item_name, :category, :selected_size, :selected_protein,
                :customer_name, :customer_phone, :customer_email, :delivery_address, :delivery_date,
                :delivery_slot, :item_price, :rush_fee, :total, 'pending', :paystack_ref, :pepper_level, :cart_items, :notes
            ) RETURNING *
        ");

        $insertStmt->execute([
            'menu_item_id' => $menuItem['id'],
            'menu_item_name' => $menuItem['name'],
            'category' => $menuItem['category'],
            'selected_size' => $input['selectedSize'] ?? 'Standard',
            'selected_protein' => $input['selectedProtein'] ?? null,
            'customer_name' => $input['customerName'],
            'customer_phone' => $input['customerPhone'],
            'customer_email' => $input['customerEmail'] ?? null,
            'delivery_address' => $input['deliveryAddress'] ?? null,
            'delivery_date' => substr($input['deliveryDate'], 0, 10),
            'delivery_slot' => $input['deliverySlot'],
            'item_price' => $itemPrice,
            'rush_fee' => $rushFee,
            'total' => $total,
            'paystack_ref' => $input['paystackRef'] ?? null,
            'pepper_level' => $input['pepperLevel'] ?? null,
            'cart_items' => $cartItems ? json_encode($cartItems) : null,
            'notes' => $input['notes'] ?? null,
        ]);

        $order = $insertStmt->fetch();
        $order['id'] = (int)$order['id'];
        $order['itemPrice'] = (int)$order['item_price'];
        $order['rushFee'] = (int)$order['rush_fee'];
        $order['total'] = (int)$order['total'];
        $order['customerName'] = $order['customer_name'];
        $order['customerPhone'] = $order['customer_phone'];
        $order['customerEmail'] = $order['customer_email'];
        $order['deliveryAddress'] = $order['delivery_address'];
        $order['deliveryDate'] = $order['delivery_date'];
        $order['deliverySlot'] = $order['delivery_slot'];
        $order['menuItemName'] = $order['menu_item_name'];
        $order['selectedSize'] = $order['selected_size'];
        $order['selectedProtein'] = $order['selected_protein'];

        // Trigger emails and calendar event
        EmailService::sendBookingNotification($order);
        CalendarService::createDeliveryEvent($order);

        Response::json($order, 201);
    }

    public function summary(): void {
        $db = Database::getConnection();

        $allOrdersStmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
        $allOrders = $allOrdersStmt->fetchAll();

        $todayStr = (new DateTime())->format('Y-m-d');
        $todayOrders = array_filter($allOrders, fn($o) => substr($o['created_at'], 0, 10) === $todayStr);

        $countByStatus = function(string $s) use ($allOrders) {
            return count(array_filter($allOrders, fn($o) => $o['status'] === $s));
        };

        $totalRevenue = array_reduce(
            array_filter($allOrders, fn($o) => $o['status'] !== 'cancelled'),
            fn($sum, $o) => $sum + (int)$o['total'],
            0
        );

        $todayRevenue = array_reduce(
            array_filter($todayOrders, fn($o) => $o['status'] !== 'cancelled'),
            fn($sum, $o) => $sum + (int)$o['total'],
            0
        );

        $recent = array_slice($allOrders, 0, 10);
        foreach ($recent as &$ro) {
            $ro['id'] = (int)$ro['id'];
            $ro['total'] = (int)$ro['total'];
            $ro['customerName'] = $ro['customer_name'];
            $ro['customerPhone'] = $ro['customer_phone'];
            $ro['deliveryDate'] = $ro['delivery_date'];
            $ro['deliverySlot'] = $ro['delivery_slot'];
            $ro['menuItemName'] = $ro['menu_item_name'];
            $ro['selectedSize'] = $ro['selected_size'];
        }

        Response::json([
            'totalOrders' => count($allOrders),
            'pendingOrders' => $countByStatus('pending'),
            'confirmedOrders' => $countByStatus('payment_confirmed') + $countByStatus('confirmed'),
            'cookingOrders' => $countByStatus('cooking_in_progress') + $countByStatus('cooking'),
            'deliveredOrders' => $countByStatus('delivered'),
            'cancelledOrders' => $countByStatus('cancelled'),
            'totalRevenue' => $totalRevenue,
            'todayOrders' => count($todayOrders),
            'todayRevenue' => $todayRevenue,
            'recentOrders' => $recent,
        ]);
    }

    public function get(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $order = $stmt->fetch();

        if (!$order) {
            Response::error('Order not found', 404);
        }

        $order['id'] = (int)$order['id'];
        $order['itemPrice'] = (int)$order['item_price'];
        $order['rushFee'] = (int)$order['rush_fee'];
        $order['total'] = (int)$order['total'];
        $order['customerName'] = $order['customer_name'];
        $order['customerPhone'] = $order['customer_phone'];
        $order['customerEmail'] = $order['customer_email'];
        $order['deliveryAddress'] = $order['delivery_address'];
        $order['deliveryDate'] = $order['delivery_date'];
        $order['deliverySlot'] = $order['delivery_slot'];
        $order['menuItemName'] = $order['menu_item_name'];
        $order['selectedSize'] = $order['selected_size'];

        Response::json($order);
    }

    public function updateStatus(int $id): void {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['status'])) {
            Response::error('Status is required');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE orders SET status = :status WHERE id = :id RETURNING *");
        $stmt->execute(['status' => $input['status'], 'id' => $id]);
        $order = $stmt->fetch();

        if (!$order) {
            Response::error('Order not found', 404);
        }

        $order['id'] = (int)$order['id'];
        $order['total'] = (int)$order['total'];
        $order['customerName'] = $order['customer_name'];
        $order['customerEmail'] = $order['customer_email'];
        $order['menuItemName'] = $order['menu_item_name'];
        $order['selectedSize'] = $order['selected_size'];
        $order['deliveryDate'] = $order['delivery_date'];
        $order['deliverySlot'] = $order['delivery_slot'];

        EmailService::sendCustomerStatusEmail($order);

        Response::json($order);
    }
}
