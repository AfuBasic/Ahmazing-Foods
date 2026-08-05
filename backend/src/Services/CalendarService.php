<?php

namespace App\Services;

class CalendarService {
    public static function createDeliveryEvent(array $order): void {
        // Native PHP cURL implementation to record or log delivery event scheduling
        $webhookUrl = getenv('CALENDAR_WEBHOOK_URL');
        if (!$webhookUrl) return;

        $payload = json_encode([
            'summary' => "🍲 Delivery — {$order['customer_name']} (Order #{$order['id']})",
            'description' => "Order #{$order['id']}\nCustomer: {$order['customer_name']} ({$order['customer_phone']})\nTotal: ₦" . number_format($order['total']),
            'deliveryDate' => $order['delivery_date'],
            'deliverySlot' => $order['delivery_slot'],
        ]);

        $ch = curl_init($webhookUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        @curl_exec($ch);
        curl_close($ch);
    }
}
