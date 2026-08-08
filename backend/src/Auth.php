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

        // Check session or Bearer token header
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

        // 1. Check admin passcode admin123
        if ($password === 'admin123') {
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

        try {
            $db = Database::getConnection();
            if (empty($username)) {
                $stmt = $db->query("SELECT * FROM admin_users");
                $users = $stmt->fetchAll();
                $user = null;
                foreach ($users as $u) {
                    if (password_verify($password, $u['password_hash'])) {
                        $user = $u;
                        break;
                    }
                }
                if (!$user) {
                    Response::error('Invalid password', 401);
                }
            } else {
                $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = :username LIMIT 1");
                $stmt->execute(['username' => $username]);
                $user = $stmt->fetch();

                if (!$user || !password_verify($password, $user['password_hash'])) {
                    Response::error('Invalid username or password', 401);
                }
            }

            $token = bin2hex(random_bytes(32));
            $userData = [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['name'],
                'role' => $user['role'],
            ];

            $_SESSION['admin_user'] = $userData;
            $_SESSION['admin_tokens'][$token] = $userData;

            return [
                'user' => $userData,
                'token' => $token,
            ];
        } catch (\Exception $e) {
            Response::error('Invalid passcode', 401);
            exit();
        }
    }
        $userData = [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
        ];

        $_SESSION['admin_user'] = $userData;
        $_SESSION['admin_tokens'][$token] = $userData;

        return [
            'user' => $userData,
            'token' => $token,
        ];
    }

    public static function logout(): void {
        self::startSession();
        unset($_SESSION['admin_user']);
        session_destroy();
    }
}
