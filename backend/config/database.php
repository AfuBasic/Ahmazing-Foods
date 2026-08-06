<?php
// Database configuration matching Docker environment or local MySQL setup

return [
    'driver'   => getenv('DB_DRIVER') ?: 'mysql',
    'host'     => getenv('DB_HOST') ?: 'db',
    'port'     => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_NAME') ?: 'ahmazing_db',
    'username' => getenv('DB_USER') ?: 'ahmazing_user',
    'password' => getenv('DB_PASS') ?: 'ahmazing_pass',
    'charset'  => 'utf8mb4',
];
