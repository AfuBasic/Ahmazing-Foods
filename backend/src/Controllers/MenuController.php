<?php

namespace App\Controllers;

use App\Response;

class MenuController {
    private static function getStaticMenu(): array {
        $defaultSoupSizes = [
            ['label' => '2 Litres (Serves ~3)', 'price' => 32000],
            ['label' => '3 Litres (Serves ~5)', 'price' => 36000],
            ['label' => '5 Litres (Serves ~7)', 'price' => 43000],
        ];

        $defaultProteins = [
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
        ];

        return [
            // SOUPS
            [
                'id' => 1, 'category' => 'soups', 'name' => 'Onugbu Soup (Bitterleaf)',
                'description' => 'Rich bitterleaf soup garnished with dried fish, stockfish and cowhide.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/soups/onugbu-soup.jpg'
            ],
            [
                'id' => 2, 'category' => 'soups', 'name' => 'Oha Soup',
                'description' => 'Traditional Igbo oha leaf soup, hearty and deeply flavoured.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/soups/oha-soup.jpg'
            ],
            [
                'id' => 3, 'category' => 'soups', 'name' => 'Okro Soup',
                'description' => 'Freshly made okro soup, silky and well-seasoned.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/soups/okro-soup.jpg'
            ],
            [
                'id' => 4, 'category' => 'soups', 'name' => 'Edikang Ikong (Vegetable Soup)',
                'description' => 'Nutrient-dense ugu and waterleaf soup with assorted protein.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/soups/edikang-ikong.jpg'
            ],
            [
                'id' => 5, 'category' => 'soups', 'name' => 'Afang Soup',
                'description' => 'Efik-style afang and okazi leaf soup with rich palm oil.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/soups/afang-soup.jpg'
            ],
            [
                'id' => 6, 'category' => 'soups', 'name' => 'Egusi Soup',
                'description' => 'Classic melon seed soup with pumpkin leaves and smoked fish.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/soups/egusi-soup.jpg'
            ],

            // STEWS & MAINS
            [
                'id' => 7, 'category' => 'stews', 'name' => 'Buka Stew',
                'description' => 'Smoky palm-oil buka stew with assorted meats.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/stews/buka-stew.jpg'
            ],
            [
                'id' => 8, 'category' => 'stews', 'name' => 'Ofada Stew',
                'description' => 'Ayamase green pepper stew with bleached palm oil and boiled eggs.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/stews/ofada-stew.jpg'
            ],
            [
                'id' => 9, 'category' => 'stews', 'name' => 'Efo Riro',
                'description' => 'Rich spinach vegetable stew made with iru and dry prawns.',
                'sizes' => $defaultSoupSizes, 'proteins' => $defaultProteins, 'available' => true, 'image_url' => 'assets/stews/efo-riro.jpg'
            ],

            // BREAKFAST
            [
                'id' => 10, 'category' => 'breakfast', 'name' => 'Classic Nigerian Breakfast',
                'description' => 'Serves 2–3. Akara, pap, boiled eggs, fried plantain, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 22000]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/breakfast/classic-nigerian.png'
            ],
            [
                'id' => 11, 'category' => 'breakfast', 'name' => 'Hearty Plate',
                'description' => 'Serves 2–3. Yam, plantain, egg stew, sausages, side salad, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 22000]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/breakfast/hearty-plate.png'
            ],
            [
                'id' => 12, 'category' => 'breakfast', 'name' => 'Sweet Start',
                'description' => 'Serves 2–3. Oats, fresh fruit bowl, boiled egg, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 25000]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/breakfast/sweet-start.png'
            ],
            [
                'id' => 13, 'category' => 'breakfast', 'name' => 'Protein Power',
                'description' => 'Serves 2–3. Moin-moin, akara, pap, boiled eggs, fried plantain, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 25000]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/breakfast/protein-power.png'
            ],

            // DRINKS & WELLNESS
            [
                'id' => 14, 'category' => 'drinks', 'name' => 'Zobo Drink',
                'description' => 'Cold-pressed hibiscus tea with pineapple & cloves.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 2900]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/drinks/zobo.jpg'
            ],
            [
                'id' => 15, 'category' => 'drinks', 'name' => 'Pineapple Ginger Drink',
                'description' => 'Fresh tropical pineapple blended with fiery ginger.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 2900]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/drinks/pineapple-ginger.jpg'
            ],
            [
                'id' => 16, 'category' => 'drinks', 'name' => 'Ginger Immune Booster',
                'description' => 'Concentrated ginger & lemon shot for natural vitality.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3200]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/drinks/ginger-booster.jpg'
            ],
            [
                'id' => 17, 'category' => 'drinks', 'name' => 'Tiger Nut Milk',
                'description' => 'Creamy, naturally sweet tiger nut & date blend.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3300]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/drinks/tiger-nut.jpg'
            ],

            // PLATTERS
            [
                'id' => 18, 'category' => 'platters', 'name' => 'Small Chops Tray',
                'description' => 'Puff puff, samosa, spring rolls, spicy peppered gizzard.',
                'sizes' => [['label' => 'Medium Tray', 'price' => 35000], ['label' => 'Large Platter', 'price' => 55000]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/platters/small-chops.jpg'
            ],
            [
                'id' => 19, 'category' => 'platters', 'name' => 'Executive BBQ Platter',
                'description' => 'Grilled turkey, chicken, spicy croaker fish & fried plantain.',
                'sizes' => [['label' => 'Platter for 5', 'price' => 65000]], 'proteins' => [], 'available' => true, 'image_url' => 'assets/platters/bbq-platter.jpg'
            ],
        ];
    }

    public function list(): void {
        $category = $_GET['category'] ?? null;
        $items = self::getStaticMenu();

        if ($category) {
            $items = array_values(array_filter($items, fn($item) => $item['category'] === $category));
        }

        Response::json($items);
    }

    public function get(int $id): void {
        $items = self::getStaticMenu();
        foreach ($items as $item) {
            if ($item['id'] === $id) {
                Response::json($item);
                return;
            }
        }
        Response::error('Menu item not found', 404);
    }

    public function create(): void {
        Response::error('Admin database modification disabled in JSON storage mode', 403);
    }

    public function update(int $id): void {
        Response::error('Admin database modification disabled in JSON storage mode', 403);
    }

    public function delete(int $id): void {
        Response::error('Admin database modification disabled in JSON storage mode', 403);
    }
}
