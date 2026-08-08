<?php

namespace App\Services;

class EmailService {

    private static function loadEnv(): void {
        $envPath = __DIR__ . '/../../.env';
        if (!file_exists($envPath)) return;
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value, " \t\n\r\0\x0B\"'\r");
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }

    private static function sendSmtp(string $to, string $subject, string $htmlBody): bool {
        self::loadEnv();
        $smtpHost  = getenv('SMTP_HOST') ?: 'smtp.zeptomail.com';
        $smtpPort  = (int)(getenv('SMTP_PORT') ?: 587);
        $smtpUser  = getenv('SMTP_USER') ?: 'emailapikey';
        $smtpPass  = getenv('SMTP_PASS');
        $fromEmail = getenv('FROM_EMAIL') ?: 'noreply@templeobike.com';
        $fromName  = getenv('FROM_NAME') ?: 'AHmazing Foods Orders';

        if (empty($smtpPass)) {
            // Fallback to PHP mail()
            $headers = "From: $fromName <$fromEmail>\r\n" .
                       "MIME-Version: 1.0\r\n" .
                       "Content-Type: text/html; charset=UTF-8\r\n";
            return @mail($to, $subject, $htmlBody, $headers);
        }

        $socket = @fsockopen($smtpHost, $smtpPort, $errno, $errstr, 10);
        if (!$socket) return false;

        $read = function() use ($socket) {
            $res = "";
            while ($line = fgets($socket, 512)) {
                $res .= $line;
                if (substr($line, 3, 1) == " ") break;
            }
            return $res;
        };

        $send = function($cmd) use ($socket, $read) {
            fputs($socket, $cmd . "\r\n");
            return $read();
        };

        $read(); // Banner

        $send("EHLO " . gethostname());
        $send("STARTTLS");
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT);
        $send("EHLO " . gethostname());

        $send("AUTH LOGIN");
        $send(base64_encode($smtpUser));
        $passRes = $send(base64_encode($smtpPass));

        if (strpos($passRes, '235') === false) {
            fclose($socket);
            return false;
        }

        $send("MAIL FROM: <$fromEmail>");
        $send("RCPT TO: <$to>");
        $send("DATA");

        $headers = [
            "From: $fromName <$fromEmail>",
            "To: <$to>",
            "Subject: $subject",
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8"
        ];

        $data = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
        $res = $send($data);
        $send("QUIT");
        fclose($socket);

        return (strpos($res, '250') !== false);
    }

    public static function sendBookingNotification(array $order): void {
        self::loadEnv();
        $adminEmail = getenv('ADMIN_EMAIL') ?: 'afutunde@gmail.com';
        $orderId = str_pad($order['id'], 4, '0', STR_PAD_LEFT);
        $subject = "New Order Notification — #AHM-{$orderId} | AHmazing Foods";

        $customerName = htmlspecialchars($order['customer_name'] ?? $order['customerName'] ?? 'Customer');
        $customerPhone = htmlspecialchars($order['customer_phone'] ?? $order['customerPhone'] ?? '');
        $customerEmail = htmlspecialchars($order['customer_email'] ?? $order['customerEmail'] ?? '');
        $deliveryDate = htmlspecialchars($order['delivery_date'] ?? $order['deliveryDate'] ?? '');
        $deliverySlot = htmlspecialchars($order['delivery_slot'] ?? $order['deliverySlot'] ?? '');
        $deliveryAddress = htmlspecialchars($order['delivery_address'] ?? $order['deliveryAddress'] ?? '');
        $pepperLevel = htmlspecialchars($order['pepper_level'] ?? $order['pepperLevel'] ?? 'Standard');
        $notes = htmlspecialchars($order['notes'] ?? '');
        $total = number_format((int)($order['total'] ?? 0));
        $rushFee = (int)($order['rush_fee'] ?? $order['rushFee'] ?? 0);

        // Build cart items rows
        $cartItems = $order['cart_items'] ?? $order['cartItems'] ?? [];
        if (is_string($cartItems)) $cartItems = json_decode($cartItems, true);

        $itemsHtml = '';
        if (is_array($cartItems) && count($cartItems) > 0) {
            foreach ($cartItems as $index => $item) {
                $iName = htmlspecialchars($item['menuItemName'] ?? $item['name'] ?? 'Item');
                $iSize = htmlspecialchars($item['selectedSize'] ?? $item['size'] ?? '');
                $iPrice = number_format((int)($item['price'] ?? 0));
                
                $proteinsStr = '';
                if (!empty($item['selectedProteins']) && is_array($item['selectedProteins'])) {
                    $pList = array_map(fn($p) => htmlspecialchars($p['name'] . ' ×' . ($p['qty'] ?? 1)), $item['selectedProteins']);
                    $proteinsStr = '<br><span style="font-size: 12px; color: #6b7280;">Protein: ' . implode(', ', $pList) . '</span>';
                }

                $itemsHtml .= "
                <tr>
                  <td style=\"padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px;\">
                    <strong>{$iName}</strong> ({$iSize}){$proteinsStr}
                  </td>
                  <td style=\"padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: right; font-weight: bold; color: #111827;\">
                    ₦{$iPrice}
                  </td>
                </tr>";
            }
        } else {
            $mainName = htmlspecialchars($order['menu_item_name'] ?? $order['menuItemName'] ?? 'Order Item');
            $mainSize = htmlspecialchars($order['selected_size'] ?? $order['selectedSize'] ?? 'Standard');
            $itemsHtml = "
            <tr>
              <td style=\"padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px;\">
                <strong>{$mainName}</strong> ({$mainSize})
              </td>
              <td style=\"padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; text-align: right; font-weight: bold;\">
                ₦{$total}
              </td>
            </tr>";
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $customerPhone);
        $waLink = "https://wa.me/{$cleanPhone}";

        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset=\"utf-8\">
          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
          <title>New Order Notification</title>
        </head>
        <body style=\"margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;\">
          <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f4f6f8; padding: 30px 10px;\">
            <tr>
              <td align=\"center\">
                <table width=\"100%\" max-width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;\">
                  
                  <!-- HEADER WITH LOGO -->
                  <tr>
                    <td style=\"background-color: #0F9E0F; padding: 30px 24px; text-align: center;\">
                      <img src=\"https://ahmazingfoods.com/assets/logo.png\" alt=\"AHmazing Foods\" style=\"max-height: 55px; width: auto; margin-bottom: 12px;\">
                      <h1 style=\"color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;\">AHmazing Foods</h1>
                      <p style=\"color: rgba(255,255,255,0.9); font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; tracking: 1px; font-weight: 600;\">New Customer Order Received</p>
                    </td>
                  </tr>

                  <!-- ORDER STATUS BANNER -->
                  <tr>
                    <td style=\"background-color: #fffbebfb; border-bottom: 1px solid #fef3c7; padding: 16px 24px;\">
                      <table width=\"100%\">
                        <tr>
                          <td>
                            <span style=\"font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;\">Order Reference</span>
                            <div style=\"font-size: 18px; font-weight: 800; color: #78350f; font-family: monospace;\">#AHM-{$orderId}</div>
                          </td>
                          <td align=\"right\">
                            <span style=\"background-color: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #fde68a;\">STATUS: PENDING</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- CONTENT -->
                  <tr>
                    <td style=\"padding: 24px;\">
                      
                      <!-- CUSTOMER DETAILS CARD -->
                      <div style=\"background-color: #f9fafb; border-radius: 14px; border: 1px solid #f3f4f6; padding: 20px; margin-bottom: 24px;\">
                        <h3 style=\"margin: 0 0 14px 0; font-size: 15px; color: #111827; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;\">👤 Customer Information</h3>
                        <table width=\"100%\" style=\"font-size: 14px; color: #374151; line-height: 1.6;\">
                          <tr>
                            <td width=\"35%\" style=\"color: #6b7280;\">Customer Name:</td>
                            <td style=\"font-weight: 600; color: #111827;\">{$customerName}</td>
                          </tr>
                          <tr>
                            <td style=\"color: #6b7280;\">Phone Number:</td>
                            <td style=\"font-weight: 600; color: #111827;\">{$customerPhone}</td>
                          </tr>
                          " . ($customerEmail ? "<tr><td style=\"color: #6b7280;\">Email Address:</td><td>{$customerEmail}</td></tr>" : "") . "
                          <tr>
                            <td style=\"color: #6b7280;\">Delivery Date:</td>
                            <td style=\"font-weight: 600; color: #0F9E0F;\">{$deliveryDate} ({$deliverySlot})</td>
                          </tr>
                          <tr>
                            <td style=\"color: #6b7280;\">Delivery Address:</td>
                            <td>{$deliveryAddress}</td>
                          </tr>
                          <tr>
                            <td style=\"color: #6b7280;\">Pepper Level:</td>
                            <td><span style=\"background-color: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 12px;\">🌶️ {$pepperLevel}</span></td>
                          </tr>
                        </table>
                      </div>

                      <!-- ORDERED ITEMS TABLE -->
                      <h3 style=\"margin: 0 0 12px 0; font-size: 15px; color: #111827; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;\">📦 Items Ordered</h3>
                      <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;\">
                        <thead>
                          <tr style=\"background-color: #f9fafb; font-size: 12px; text-transform: uppercase; color: #6b7280; text-align: left;\">
                            <th style=\"padding: 10px 16px;\">Item & Description</th>
                            <th style=\"padding: 10px 16px; text-align: right;\">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {$itemsHtml}
                        </tbody>
                        <tfoot>
                          " . ($rushFee > 0 ? "
                          <tr>
                            <td style=\"padding: 10px 16px; color: #6b7280; font-size: 13px;\">Same-day Rush Fee</td>
                            <td style=\"padding: 10px 16px; text-align: right; font-weight: 600; font-size: 13px; color: #b45309;\">₦" . number_format($rushFee) . "</td>
                          </tr>" : "") . "
                          <tr style=\"background-color: #f9fafb;\">
                            <td style=\"padding: 14px 16px; font-weight: 800; font-size: 16px; color: #111827;\">Grand Total</td>
                            <td style=\"padding: 14px 16px; text-align: right; font-weight: 800; font-size: 18px; color: #0F9E0F;\">₦{$total}</td>
                          </tr>
                        </tfoot>
                      </table>

                      " . ($notes ? "
                      <div style=\"background-color: #f3f4f6; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;\">
                        <strong style=\"font-size: 12px; color: #4b5563; text-transform: uppercase;\">Order Summary Notes:</strong>
                        <pre style=\"margin: 6px 0 0 0; font-family: inherit; font-size: 13px; color: #374151; white-space: pre-wrap;\">{$notes}</pre>
                      </div>" : "") . "

                      <!-- ACTION BUTTON -->
                      <div style=\"text-align: center; margin-top: 28px; margin-bottom: 10px;\">
                        <a href=\"{$waLink}\" target=\"_blank\" style=\"background-color: #25D366; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37,211,102,0.3);\">
                          💬 Contact Customer on WhatsApp
                        </a>
                      </div>

                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style=\"background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 24px; text-align: center; font-size: 12px; color: #9ca3af;\">
                      © " . date('Y') . " AHmazing Foods. Built for seamless catering & meal deliveries.<br>
                      Order saved in <code>backend/database/orders.json</code>.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>";

        self::sendSmtp($adminEmail, $subject, $htmlBody);
    }

    public static function sendCustomerStatusEmail(array $order): void {
        self::loadEnv();
        $customerEmail = $order['customer_email'] ?? $order['customerEmail'] ?? '';
        if (empty($customerEmail)) return;

        $customerName = htmlspecialchars($order['customer_name'] ?? $order['customerName'] ?? 'Customer');
        $orderId = str_pad($order['id'], 4, '0', STR_PAD_LEFT);
        $status = strtoupper(htmlspecialchars($order['status']));

        $subject = "Order Status Update — #AHM-{$orderId} | AHmazing Foods";

        $htmlBody = "
        <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;\">
          <div style=\"background: #0F9E0F; padding: 24px; text-align: center;\">
            <img src=\"https://ahmazingfoods.com/assets/logo.png\" alt=\"AHmazing Foods\" style=\"max-height: 50px;\">
            <h2 style=\"color: #ffffff; margin: 10px 0 0 0;\">AHmazing Foods</h2>
          </div>
          <div style=\"padding: 24px;\">
            <h3>Hello {$customerName},</h3>
            <p>Your order <strong>#AHM-{$orderId}</strong> status has been updated to: <span style=\"color: #0F9E0F; font-weight: bold;\">{$status}</span>.</p>
            <p>Thank you for choosing AHmazing Foods!</p>
          </div>
        </div>";

        self::sendSmtp($customerEmail, $subject, $htmlBody);
    }
}
