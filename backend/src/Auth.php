<?php

namespace App;

use App\Database;
use App\Response;
use PDO;

class Auth {
    public static function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function requireAdmin(): array {
        self::startSession();

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $sessionUser = $_SESSION['admin_user'] ?? null;

        if ($sessionUser) {
            return $sessionUser;
        }

        if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            $token = $matches[1];
            if (isset($_SESSION['admin_tokens'][$token])) {
                return $_SESSION['admin_tokens'][$token];
            }
        }

        Response::error('Unauthorized: Admin access required', 401);
        exit();
    }

    public static function login(string $username, string $password): array {
        self::startSession();

        $cleanPass = strtolower(trim($password));

        if (empty($cleanPass)) {
            Response::error('Password is required', 400);
            exit();
        }

        // Accept admin123 or admin for password-only login
        if ($cleanPass === 'admin123' || $cleanPass === 'admin') {
            $token = bin2hex(random_bytes(32));
            $userData = [
                'id' => 1,
                'username' => 'admin',
                'name' => 'AHmazing Admin',
                'role' => 'admin',
            ];
            $_SESSION['admin_user'] = $userData;
            $_SESSION['admin_tokens'][$token] = $userData;
            return [
                'user' => $userData,
                'token' => $token,
            ];
        }

        // Check DB if connected
        try {
            $db = Database::getConnection();
            $stmt = $db->query("SELECT * FROM admin_users");
            $users = $stmt->fetchAll();
            foreach ($users as $u) {
                if (password_verify($password, $u['password_hash'])) {
                    $token = bin2hex(random_bytes(32));
                    $userData = [
                        'id' => $u['id'],
                        'username' => $u['username'],
                        'name' => $u['name'],
                        'role' => $u['role'],
                    ];
                    $_SESSION['admin_user'] = $userData;
                    $_SESSION['admin_tokens'][$token] = $userData;
                    return [
                        'user' => $userData,
                        'token' => $token,
                    ];
                }
            }
        } catch (\Exception $e) {
            // ignore DB error
        }

        Response::error('Invalid admin password', 401);
        exit();
    }

    public static function logout(): void {
        self::startSession();
        unset($_SESSION['admin_user']);
        session_destroy();
    }
}
