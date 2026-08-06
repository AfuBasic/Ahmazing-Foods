<?php

namespace App\Controllers;

use App\Auth;
use App\Response;

class AdminController {
    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($password)) {
            Response::error('Password is required', 400);
        }

        $result = Auth::login($username, $password);
        Response::json($result);
    }

    public function logout(): void {
        Auth::logout();
        Response::json(['message' => 'Logged out successfully']);
    }

    public function me(): void {
        $user = Auth::requireAdmin();
        Response::json(['user' => $user]);
    }
}
