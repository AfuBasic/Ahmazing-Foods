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
            $stmt = $db->prepare("SELECT * FROM menu_items WHERE category = :category ORDER BY name ASC");
            $stmt->execute(['category' => $category]);
        } else {
            $stmt = $db->query("SELECT * FROM menu_items ORDER BY name ASC");
        }

        $items = $stmt->fetchAll();
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
