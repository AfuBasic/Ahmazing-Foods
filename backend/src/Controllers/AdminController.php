<?php

namespace App\Controllers;

use App\Auth;
use App\Response;

class AdminController {
    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true);

        $password = trim($input['password'] ?? '');

        if (empty($password)) {
            Response::error('Password is required', 400);
            return;
        }

        $result = Auth::login('', $password);
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
