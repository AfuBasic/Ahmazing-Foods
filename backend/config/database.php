<?php
// Database configuration matching Docker environment or local setup

return [
    'driver'   => getenv('DB_DRIVER') ?: 'pgsql',
    'host'     => getenv('DB_HOST') ?: 'db',
    'port'     => getenv('DB_PORT') ?: '5432',
    'database' => getenv('DB_NAME') ?: 'ahmazing_db',
    'username' => getenv('DB_USER') ?: 'ahmazing_user',
    'password' => getenv('DB_PASS') ?: 'ahmazing_pass',
    'charset'  => 'utf8',
];
