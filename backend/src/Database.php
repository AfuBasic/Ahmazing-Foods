<?php

namespace App;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $config = require __DIR__ . '/../config/database.php';
            
            try {
                if ($config['driver'] === 'pgsql') {
                    $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['database']}";
                } else {
                    $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset={$config['charset']}";
                }

                self::$instance = new PDO($dsn, $config['username'], $config['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                // If connecting inside container or locally fails, output JSON error
                http_response_code(500);
                echo json_encode([
                    'error' => 'Database connection failed: ' . $e->getMessage()
                ]);
                exit();
            }
        }

        return self::$instance;
    }
}
