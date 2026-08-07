<?php

namespace App\Controllers;

use App\Database;
use App\Response;
use App\Auth;
use PDO;

class MenuController {
    public function list(): void {
        $db = Database::getConnection();
        $category = $_GET['category'] ?? null;

        if ($category) {
            $stmt = $db->prepare("SELECT * FROM menu_items WHERE category = :category ORDER BY id ASC");
            $stmt->execute(['category' => $category]);
            $items = $stmt->fetchAll();

            // Auto-seed 4 Breakfast Combos if breakfast items are missing or outdated
            if ($category === 'breakfast' && count($items) < 4) {
                $combos = [
                    [
                        'name' => 'Classic Nigerian',
                        'description' => 'Serves 2–3. Akara, pap, boiled eggs, fried plantain, and more.',
                        'sizes' => json_encode([['label' => 'Standard Portion', 'price' => 22000]]),
                        'proteins' => '[]',
                        'image_url' => 'assets/breakfast/classic-nigerian.png'
                    ],
                    [
                        'name' => 'Hearty Plate',
                        'description' => 'Serves 2–3. Yam, plantain, egg stew, sausages, side salad, and more.',
                        'sizes' => json_encode([['label' => 'Standard Portion', 'price' => 22000]]),
                        'proteins' => '[]',
                        'image_url' => 'assets/breakfast/hearty-plate.png'
                    ],
                    [
                        'name' => 'Sweet Start',
                        'description' => 'Serves 2–3. Oats, fresh fruit bowl, boiled egg, and more.',
                        'sizes' => json_encode([['label' => 'Standard Portion', 'price' => 25000]]),
                        'proteins' => '[]',
                        'image_url' => 'assets/breakfast/sweet-start.png'
                    ],
                    [
                        'name' => 'Protein Power',
                        'description' => 'Serves 2–3. Moin-moin, akara, pap, boiled eggs, fried plantain, and more.',
                        'sizes' => json_encode([['label' => 'Standard Portion', 'price' => 25000]]),
                        'proteins' => '[]',
                        'image_url' => 'assets/breakfast/protein-power.png'
                    ]
                ];

                foreach ($combos as $combo) {
                    $check = $db->prepare("SELECT id FROM menu_items WHERE category = 'breakfast' AND name = :name");
                    $check->execute(['name' => $combo['name']]);
                    if (!$check->fetch()) {
                        $ins = $db->prepare("INSERT INTO menu_items (category, name, description, sizes, proteins, available, image_url) VALUES ('breakfast', :name, :description, :sizes, :proteins, 1, :image_url)");
                        $ins->execute([
                            'name' => $combo['name'],
                            'description' => $combo['description'],
                            'sizes' => $combo['sizes'],
                            'proteins' => $combo['proteins'],
                            'image_url' => $combo['image_url']
                        ]);
                    }
                }

                $stmt = $db->prepare("SELECT * FROM menu_items WHERE category = :category ORDER BY id ASC");
                $stmt->execute(['category' => $category]);
                $items = $stmt->fetchAll();
            }

            // Auto-seed Soups if missing or updated
            if ($category === 'soups') {
                $defaultSizes = json_encode([
                    ['label' => '2 Litres (Serves ~3)', 'price' => 32000],
                    ['label' => '3 Litres (Serves ~5)', 'price' => 36000],
                    ['label' => '5 Litres (Serves ~7)', 'price' => 43000],
                    ['label' => 'Cooler — Small', 'price' => 0],
                    ['label' => 'Cooler — Medium', 'price' => 0],
                ]);

                $defaultProteins = json_encode([
                    ['name' => 'Beef', 'extraCost' => 4000],
                    ['name' => 'Chicken', 'extraCost' => 4700],
                    ['name' => 'Turkey', 'extraCost' => 5700],
                    ['name' => 'Croaker', 'extraCost' => 5700],
                    ['name' => 'Tilapia', 'extraCost' => 4700],
                    ['name' => 'Catfish', 'extraCost' => 5700],
                    ['name' => 'Snail', 'extraCost' => 6700],
                    ['name' => 'Mixed Seafood', 'extraCost' => 11700],
                    ['name' => 'Gizzard', 'extraCost' => 5700],
                    ['name' => 'Sausages', 'extraCost' => 4700],
                ]);

                $soups = [
                    ['name' => 'Onugbu Soup (Bitterleaf)', 'desc' => 'Rich bitterleaf soup garnished with dried fish, stockfish and cowhide.', 'img' => 'assets/soups/onugbu-soup.jpg'],
                    ['name' => 'Oha Soup', 'desc' => 'Traditional Igbo oha leaf soup, hearty and deeply flavoured.', 'img' => 'assets/soups/oha-soup.jpg'],
                    ['name' => 'Okro Soup', 'desc' => 'Freshly made okro soup, silky and well-seasoned.', 'img' => 'assets/soups/okro-soup.jpg'],
                    ['name' => 'Edikang Ikong (Vegetable Soup)', 'desc' => 'Nutrient-dense ugu and waterleaf soup with assorted protein.', 'img' => 'assets/soups/edikang-ikong.jpg'],
                    ['name' => 'Egusi Soup', 'desc' => 'Thick, golden egusi soup cooked low and slow with melon seeds.', 'img' => 'assets/soups/egusi-soup.jpg'],
                    ['name' => 'Banga Soup (Ofe Akwu)', 'desc' => 'Traditional palm fruit soup enriched with scent leaf and local spices.', 'img' => 'assets/soups/banga-soup.jpg'],
                    ['name' => 'Efo-Riro', 'desc' => 'Rich Yoruba spinach soup with locust beans and peppers.', 'img' => 'assets/soups/efo-riro.jpg'],
                    ['name' => 'Seafood Okro (Fish, Shrimp, Prawns & Calamari)', 'desc' => 'Premium seafood okro loaded with fresh fish, prawns, and calamari.', 'img' => 'assets/soups/seafood-okro.jpg', 'sizes' => json_encode([['label' => '5 Litres (Serves ~8)', 'price' => 64000], ['label' => 'Cooler — Small', 'price' => 0], ['label' => 'Cooler — Medium', 'price' => 0]])]
                ];

                foreach ($soups as $soup) {
                    $check = $db->prepare("SELECT id FROM menu_items WHERE category = 'soups' AND name = :name");
                    $check->execute(['name' => $soup['name']]);
                    $existing = $check->fetch();
                    if (!$existing) {
                        $ins = $db->prepare("INSERT INTO menu_items (category, name, description, sizes, proteins, available, image_url) VALUES ('soups', :name, :desc, :sizes, :proteins, 1, :img)");
                        $ins->execute([
                            'name' => $soup['name'],
                            'desc' => $soup['desc'],
                            'sizes' => $soup['sizes'] ?? $defaultSizes,
                            'proteins' => $defaultProteins,
                            'img' => $soup['img']
                        ]);
                    } else {
                        // Update existing soup items to make sure sizes & proteins are up to date
                        $upd = $db->prepare("UPDATE menu_items SET sizes = :sizes, proteins = :proteins, description = :desc WHERE id = :id");
                        $upd->execute([
                            'sizes' => $soup['sizes'] ?? $defaultSizes,
                            'proteins' => $defaultProteins,
                            'desc' => $soup['desc'],
                            'id' => $existing['id']
                        ]);
                    }
                }

                $stmt = $db->prepare("SELECT * FROM menu_items WHERE category = :category ORDER BY id ASC");
                $stmt->execute(['category' => $category]);
                $items = $stmt->fetchAll();
            }
        } else {
            $stmt = $db->query("SELECT * FROM menu_items ORDER BY id ASC");
            $items = $stmt->fetchAll();
        }

        foreach ($items as &$item) {
            $item['id'] = (int)$item['id'];
            $item['available'] = (bool)$item['available'];
            $item['sizes'] = is_string($item['sizes']) ? json_decode($item['sizes'], true) : $item['sizes'];
            $item['proteins'] = is_string($item['proteins']) ? json_decode($item['proteins'], true) : $item['proteins'];
        }

        Response::json($items);
    }

    public function get(int $id): void {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM menu_items WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $item = $stmt->fetch();

        if (!$item) {
            Response::error('Menu item not found', 404);
        }

        $item['id'] = (int)$item['id'];
        $item['available'] = (bool)$item['available'];
        $item['sizes'] = is_string($item['sizes']) ? json_decode($item['sizes'], true) : $item['sizes'];
        $item['proteins'] = is_string($item['proteins']) ? json_decode($item['proteins'], true) : $item['proteins'];

        Response::json($item);
    }

    public function create(): void {
        Auth::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        if (empty($input['name']) || empty($input['category']) || empty($input['description'])) {
            Response::error('Name, category, and description are required');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO menu_items (category, name, description, sizes, proteins, available, image_url)
            VALUES (:category, :name, :description, :sizes, :proteins, :available, :image_url)
        ");

        $stmt->execute([
            'category' => $input['category'],
            'name' => $input['name'],
            'description' => $input['description'],
            'sizes' => json_encode($input['sizes'] ?? []),
            'proteins' => json_encode($input['proteins'] ?? []),
            'available' => isset($input['available']) ? (int)(bool)$input['available'] : 1,
            'image_url' => $input['image_url'] ?? null,
        ]);

        $newId = (int)$db->lastInsertId();
        $fetchStmt = $db->prepare("SELECT * FROM menu_items WHERE id = :id LIMIT 1");
        $fetchStmt->execute(['id' => $newId]);
        $newItem = $fetchStmt->fetch();

        $newItem['id'] = (int)$newItem['id'];
        $newItem['available'] = (bool)$newItem['available'];
        $newItem['sizes'] = json_decode($newItem['sizes'], true);
        $newItem['proteins'] = json_decode($newItem['proteins'], true);

        Response::json($newItem, 201);
    }

    public function update(int $id): void {
        Auth::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true);

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM menu_items WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $item = $stmt->fetch();

        if (!$item) {
            Response::error('Menu item not found', 404);
        }

        $updateStmt = $db->prepare("
            UPDATE menu_items SET 
                category = :category,
                name = :name,
                description = :description,
                sizes = :sizes,
                proteins = :proteins,
                available = :available,
                image_url = :image_url
            WHERE id = :id
        ");

        $updateStmt->execute([
            'id' => $id,
            'category' => $input['category'] ?? $item['category'],
            'name' => $input['name'] ?? $item['name'],
            'description' => $input['description'] ?? $item['description'],
            'sizes' => isset($input['sizes']) ? json_encode($input['sizes']) : $item['sizes'],
            'proteins' => isset($input['proteins']) ? json_encode($input['proteins']) : $item['proteins'],
            'available' => isset($input['available']) ? (int)(bool)$input['available'] : (int)$item['available'],
            'image_url' => $input['image_url'] ?? $item['image_url'],
        ]);

        $fetchStmt = $db->prepare("SELECT * FROM menu_items WHERE id = :id LIMIT 1");
        $fetchStmt->execute(['id' => $id]);
        $updated = $fetchStmt->fetch();

        $updated['id'] = (int)$updated['id'];
        $updated['available'] = (bool)$updated['available'];
        $updated['sizes'] = json_decode($updated['sizes'], true);
        $updated['proteins'] = json_decode($updated['proteins'], true);

        Response::json($updated);
    }

    public function toggleAvailability(int $id): void {
        Auth::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->prepare("UPDATE menu_items SET available = NOT available WHERE id = :id");
        $stmt->execute(['id' => $id]);

        $fetchStmt = $db->prepare("SELECT * FROM menu_items WHERE id = :id LIMIT 1");
        $fetchStmt->execute(['id' => $id]);
        $item = $fetchStmt->fetch();

        if (!$item) {
            Response::error('Menu item not found', 404);
        }

        Response::json([
            'id' => (int)$item['id'],
            'name' => $item['name'],
            'available' => (bool)$item['available']
        ]);
    }
}
