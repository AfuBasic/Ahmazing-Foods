<?php

namespace App;

class Response {
    public static function json($data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }

    public static function error(string $message, int $statusCode = 400): void {
        self::json(['error' => $message], $statusCode);
    }
}
