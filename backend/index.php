<?php

// Autoloader for App namespace
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Set CORS & Content-Type headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle trailing slashes & base prefix
$uri = rtrim($uri, '/');
if (empty($uri)) $uri = '/';

try {
    switch (true) {
        // Health check
        case ($uri === '/api/healthz' || $uri === '/healthz') && $method === 'GET':
            echo json_encode(['status' => 'ok']);
            break;

        // Menu Items
        case ($uri === '/api/menu-items' || $uri === '/menu-items') && $method === 'GET':
            (new App\Controllers\MenuController())->list();
            break;

        case preg_match('#^/(?:api/)?menu-items/(\d+)$#', $uri, $m) && $method === 'GET':
            (new App\Controllers\MenuController())->get((int)$m[1]);
            break;

        // Orders
        case ($uri === '/api/orders' || $uri === '/orders') && $method === 'POST':
            (new App\Controllers\OrderController())->create();
            break;

        case ($uri === '/api/orders' || $uri === '/orders') && $method === 'GET':
            (new App\Controllers\OrderController())->list();
            break;

        case ($uri === '/api/orders/summary' || $uri === '/orders/summary') && $method === 'GET':
            (new App\Controllers\OrderController())->summary();
            break;

        case preg_match('#^/(?:api/)?orders/(\d+)$#', $uri, $m) && $method === 'GET':
            (new App\Controllers\OrderController())->get((int)$m[1]);
            break;

        case preg_match('#^/(?:api/)?orders/(\d+)/status$#', $uri, $m) && $method === 'PATCH':
            (new App\Controllers\OrderController())->updateStatus((int)$m[1]);
            break;

        // Weekend Specials
        case ($uri === '/api/specials/votes' || $uri === '/specials/votes') && $method === 'GET':
            (new App\Controllers\SpecialController())->getVotes();
            break;

        case ($uri === '/api/specials/vote' || $uri === '/specials/vote') && $method === 'POST':
            (new App\Controllers\SpecialController())->castVote();
            break;

        // Admin Routes
        case ($uri === '/api/admin/login' || $uri === '/admin/login') && $method === 'POST':
            (new App\Controllers\AdminController())->login();
            break;

        case ($uri === '/api/admin/logout' || $uri === '/admin/logout') && $method === 'POST':
            (new App\Controllers\AdminController())->logout();
            break;

        case ($uri === '/api/admin/me' || $uri === '/admin/me') && $method === 'GET':
            (new App\Controllers\AdminController())->me();
            break;

        case ($uri === '/api/admin/menu-items' || $uri === '/admin/menu-items') && $method === 'POST':
            (new App\Controllers\MenuController())->create();
            break;

        case preg_match('#^/(?:api/)?admin/menu-items/(\d+)$#', $uri, $m) && ($method === 'PUT' || $method === 'PATCH'):
            (new App\Controllers\MenuController())->update((int)$m[1]);
            break;

        case preg_match('#^/(?:api/)?admin/menu-items/(\d+)/toggle$#', $uri, $m) && $method === 'PATCH':
            (new App\Controllers\MenuController())->toggleAvailability((int)$m[1]);
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found', 'path' => $uri]);
            break;
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server Exception: ' . $e->getMessage()]);
}
