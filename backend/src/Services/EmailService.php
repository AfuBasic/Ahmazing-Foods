<?php

namespace App\Services;

class EmailService {
    public static function sendBookingNotification(array $order): void {
        $adminEmail = getenv('ADMIN_EMAIL') ?: 'ahmazingfoodsorders@gmail.com';
        $subject = "New Booking #{$order['id']} — {$order['menu_item_name']} ({$order['selected_size']})";
        
        $body = "New Booking Order #{$order['id']}\n"
              . "Customer: {$order['customer_name']} ({$order['customer_phone']})\n"
              . "Item: {$order['menu_item_name']} ({$order['selected_size']})\n"
              . "Delivery Date: {$order['delivery_date']} ({$order['delivery_slot']})\n"
              . "Total: ₦" . number_format($order['total']);

        $headers = "From: no-reply@ahmazingfoods.com\r\n" .
                   "Reply-To: no-reply@ahmazingfoods.com\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        @mail($adminEmail, $subject, $body, $headers);
    }

    public static function sendCustomerStatusEmail(array $order): void {
        if (empty($order['customer_email'])) return;

        $subject = "Your booking update — Order #{$order['id']} | AHmazing Foods";
        $body = "Hi {$order['customer_name']},\n\n"
              . "Your order status for {$order['menu_item_name']} has been updated to: {$order['status']}.\n"
              . "Delivery Date: {$order['delivery_date']} ({$order['delivery_slot']})\n\n"
              . "Thank you for choosing AHmazing Foods!";

        $headers = "From: no-reply@ahmazingfoods.com\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        @mail($order['customer_email'], $subject, $body, $headers);
    }
}
