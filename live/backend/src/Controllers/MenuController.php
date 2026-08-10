<?php

namespace App\Controllers;

use App\Response;

class MenuController
{
    private static function getStaticMenu(): array
    {
        $standardSoupSizes = [
            ['label' => '2 Litres (Serves ~3)', 'price' => 32000],
            ['label' => '3 Litres (Serves ~5)', 'price' => 36000],
            ['label' => '5 Litres (Serves ~7)', 'price' => 43000],
            ['label' => 'Cooler — Small', 'price' => 0],
            ['label' => 'Cooler — Medium', 'price' => 0],
        ];

        $seafoodOkroSizes = [
            ['label' => '5 Litres', 'price' => 56000],
            ['label' => 'Cooler — Small', 'price' => 0],
            ['label' => 'Cooler — Medium', 'price' => 0],
        ];

        $defaultSoupSizes = $standardSoupSizes;

        $stewSizes37_45 = [
            ['label' => '3 Litres (Serves ~5)', 'price' => 37000],
            ['label' => '5 Litres (Serves ~8)', 'price' => 45000],
        ];

        $stewSizes40_49 = [
            ['label' => '3 Litres (Serves ~5)', 'price' => 40000],
            ['label' => '5 Litres (Serves ~8)', 'price' => 49000],
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
            // ── SOUPS ────────────────────────────────────────────────────────
            [
                'id' => 20, 'category' => 'soups', 'name' => 'Banga Soup (Ofe Akwu)',
                'description' => 'Aromatic palm nut soup cooked the Delta way with native spices.',
                'sizes' => $standardSoupSizes, 'proteins' => $defaultProteins, 'available' => true,
                'image_url' => '/assets/soups/banga-soup.jpg', 'imageUrl' => '/assets/soups/banga-soup.jpg'
            ],
            [
                'id' => 4, 'category' => 'soups', 'name' => 'Edikang Ikong (Vegetable Soup)',
                'description' => 'A rich, nutritious Cross River vegetable soup made with ugu and waterleaf.',
                'sizes' => $standardSoupSizes, 'proteins' => $defaultProteins, 'available' => true,
                'image_url' => '/assets/soups/edikang-ikong.jpg', 'imageUrl' => '/assets/soups/edikang-ikong.jpg'
            ],
            [
                'id' => 9, 'category' => 'soups', 'name' => 'Efo-Riro',
                'description' => 'Yoruba spinach stew cooked with peppers, assorted meats and a rich base.',
                'sizes' => $standardSoupSizes, 'proteins' => $defaultProteins, 'available' => true,
                'image_url' => '/assets/soups/efo-riro.jpg', 'imageUrl' => '/assets/soups/efo-riro.jpg'
            ],
            [
                'id' => 6, 'category' => 'soups', 'name' => 'Egusi Soup',
                'description' => 'Thick, golden egusi soup cooked low and slow with ground melon seeds.',
                'sizes' => $standardSoupSizes, 'proteins' => $defaultProteins, 'available' => true,
                'image_url' => '/assets/soups/egusi-soup.jpg', 'imageUrl' => '/assets/soups/egusi-soup.jpg'
            ],
            [
                'id' => 2, 'category' => 'soups', 'name' => 'Oha Soup',
                'description' => 'Traditional Igbo oha leaf soup, hearty and deeply flavoured.',
                'sizes' => $standardSoupSizes, 'proteins' => $defaultProteins, 'available' => true,
                'image_url' => '/assets/soups/oha-soup.jpg', 'imageUrl' => '/assets/soups/oha-soup.jpg'
            ],
            [
                'id' => 3, 'category' => 'soups', 'name' => 'Okro Soup',
                'description' => 'Freshly made okro soup, silky and well-seasoned with your choice of protein.',
                'sizes' => $standardSoupSizes, 'proteins' => $defaultProteins, 'available' => true,
                'image_url' => '/assets/soups/okro-soup.jpg', 'imageUrl' => '/assets/soups/okro-soup.jpg'
            ],
            [
                'id' => 1, 'category' => 'soups', 'name' => 'Onugbu Soup (Bitterleaf)',
                'description' => 'Rich bitterleaf soup garnished with dried fish, stockfish and cowhide.',
                'sizes' => $standardSoupSizes, 'proteins' => $defaultProteins, 'available' => true,
                'image_url' => '/assets/soups/onugbu-soup.jpg', 'imageUrl' => '/assets/soups/onugbu-soup.jpg'
            ],
            [
                'id' => 21, 'category' => 'soups', 'name' => 'Seafood Okro',
                'description' => 'Luscious okro soup loaded with fresh mixed seafood. 5L and Cooler only.',
                'sizes' => $seafoodOkroSizes, 'proteins' => [], 'available' => true,
                'image_url' => '/assets/soups/seafood-okro.jpg', 'imageUrl' => '/assets/soups/seafood-okro.jpg'
            ],

            // ── STEWS & MAINS (5 items) ──────────────────────────────────────
            [
                'id' => 25,
                'category' => 'stews',
                'name' => 'Classic Tomato Stew',
                'description' => 'A rich, slow-cooked tomato base stew — the backbone of Nigerian cooking.',
                'sizes' => $stewSizes37_45,
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/stews/classic-tomato-stew.webp',
                'imageUrl' => '/assets/stews/classic-tomato-stew.webp'
            ],
            [
                'id' => 8,
                'category' => 'stews',
                'name' => 'Ayamase (Ofada Stew)',
                'description' => 'Spicy green pepper stew with assorted offals — pairs perfectly with ofada rice.',
                'sizes' => $stewSizes40_49,
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/stews/ayamase-stew.jpg',
                'imageUrl' => '/assets/stews/ayamase-stew.jpg'
            ],
            [
                'id' => 24,
                'category' => 'stews',
                'name' => 'Peppered Beef Stew',
                'description' => 'Tender chunks of beef in a bold pepper stew with caramelised onions.',
                'sizes' => $stewSizes37_45,
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/stews/peppered-beef-stew.jpg',
                'imageUrl' => '/assets/stews/peppered-beef-stew.jpg'
            ],
            [
                'id' => 22,
                'category' => 'stews',
                'name' => 'Peppered Chicken Stew',
                'description' => 'Succulent chicken pieces simmered in a spiced tomato and pepper stew.',
                'sizes' => $stewSizes37_45,
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/stews/peppered-chicken-stew.jpg',
                'imageUrl' => '/assets/stews/peppered-chicken-stew.jpg'
            ],
            [
                'id' => 23,
                'category' => 'stews',
                'name' => 'Peppered Turkey Stew',
                'description' => 'Juicy turkey pieces slow-cooked in a bold, well-spiced pepper stew.',
                'sizes' => $stewSizes40_49,
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/stews/peppered-turkey-stew.jpg',
                'imageUrl' => '/assets/stews/peppered-turkey-stew.jpg'
            ],

            // ── BREAKFAST ───────────────────────────────────────────────────
            [
                'id' => 10,
                'category' => 'breakfast',
                'name' => 'Classic Nigerian Breakfast',
                'description' => 'Serves 2–3. Akara, pap, boiled eggs, fried plantain, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 27000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/breakfast/classic-nigerian.png',
                'imageUrl' => '/assets/breakfast/classic-nigerian.png'
            ],
            [
                'id' => 11,
                'category' => 'breakfast',
                'name' => 'Hearty Plate',
                'description' => 'Serves 2–3. Yam, plantain, egg stew, sausages, side salad, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 28000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/breakfast/hearty-plate.png',
                'imageUrl' => '/assets/breakfast/hearty-plate.png'
            ],
            [
                'id' => 12,
                'category' => 'breakfast',
                'name' => 'Sweet Start',
                'description' => 'Serves 2–3. Oats, fresh fruit bowl, boiled egg, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 25000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/breakfast/sweet-start.png',
                'imageUrl' => '/assets/breakfast/sweet-start.png'
            ],
            [
                'id' => 13,
                'category' => 'breakfast',
                'name' => 'Protein Power',
                'description' => 'Serves 2–3. Moin-moin, akara, pap, boiled eggs, fried plantain, and more.',
                'sizes' => [['label' => 'Standard Portion', 'price' => 32000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/breakfast/protein-power.png',
                'imageUrl' => '/assets/breakfast/protein-power.png'
            ],

            // ── DRINKS & WELLNESS ───────────────────────────────────────────
            [
                'id' => 14,
                'category' => 'drinks',
                'name' => 'Zobo Drink',
                'description' => 'Cold-pressed hibiscus tea with pineapple & cloves. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 2900]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/zobo-drink.jpg',
                'imageUrl' => '/assets/products/zobo-drink.jpg'
            ],
            [
                'id' => 15,
                'category' => 'drinks',
                'name' => 'Pineapple Ginger Drink',
                'description' => 'Fresh tropical pineapple blended with fiery ginger. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 2900]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/pineapple-ginger-drink.jpg',
                'imageUrl' => '/assets/products/pineapple-ginger-drink.jpg'
            ],
            [
                'id' => 16,
                'category' => 'drinks',
                'name' => 'Ginger Immune Booster',
                'description' => 'Concentrated ginger & lemon shot for natural vitality. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3200]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/ginger-immune-booster.jpg',
                'imageUrl' => '/assets/products/ginger-immune-booster.jpg'
            ],
            [
                'id' => 17,
                'category' => 'drinks',
                'name' => 'Tiger Nut Milk',
                'description' => 'Creamy, naturally sweet tiger nut & date blend. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3300]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/tiger-nut-milk.jpg',
                'imageUrl' => '/assets/products/tiger-nut-milk.jpg'
            ],
            [
                'id' => 26,
                'category' => 'drinks',
                'name' => 'Yogurt Drink',
                'description' => 'Probiotic fresh cultured yogurt drink. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3300]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/yoghurt.jpg',
                'imageUrl' => '/assets/products/yoghurt.jpg'
            ],
            [
                'id' => 27,
                'category' => 'drinks',
                'name' => 'Turmeric Immune Booster',
                'description' => 'Anti-inflammatory turmeric, ginger & citrus tonic. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3200]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/Turmeric.jpg',
                'imageUrl' => '/assets/products/Turmeric.jpg'
            ],
            [
                'id' => 28,
                'category' => 'drinks',
                'name' => 'Kale Cleanser',
                'description' => 'Detoxifying kale, cucumber & green apple blend. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3700]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/kale.jpg',
                'imageUrl' => '/assets/products/kale.jpg'
            ],
            [
                'id' => 29,
                'category' => 'drinks',
                'name' => 'Lemon Honey Cleanser',
                'description' => 'Refreshing lemon, raw honey & cayenne kick. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3100]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/lemon__honey.jpg',
                'imageUrl' => '/assets/products/lemon__honey.jpg'
            ],
            [
                'id' => 30,
                'category' => 'drinks',
                'name' => 'Orange Juice',
                'description' => '100% natural freshly squeezed orange juice. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 2900]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/orange.jpg',
                'imageUrl' => '/assets/products/orange.jpg'
            ],
            [
                'id' => 31,
                'category' => 'drinks',
                'name' => 'Carrot Juice',
                'description' => 'Pure sweet carrot juice packed with vitamin A. 500ml.',
                'sizes' => [['label' => '50cl Bottle', 'price' => 3300]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/carrot.jpg',
                'imageUrl' => '/assets/products/carrot.jpg'
            ],

            // ── SNACKS ───────────────────────────────────────────────────────
            [
                'id' => 32,
                'category' => 'snacks',
                'name' => 'Cashew Nuts',
                'description' => 'Slow-roasted, lightly salted premium cashew nuts.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2800]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/cashew_nuts.jpg',
                'imageUrl' => '/assets/products/cashew_nuts.jpg'
            ],
            [
                'id' => 33,
                'category' => 'snacks',
                'name' => 'Roasted Peanuts',
                'description' => 'Classic oven-roasted crunchy groundnuts.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 1800]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/roasted_peanut.jpg',
                'imageUrl' => '/assets/products/roasted_peanut.jpg'
            ],
            [
                'id' => 34,
                'category' => 'snacks',
                'name' => 'Coated Peanuts',
                'description' => 'Crunchy golden biscuit coated peanuts.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/coated-peanuts.jpg',
                'imageUrl' => '/assets/products/coated-peanuts.jpg'
            ],
            [
                'id' => 35,
                'category' => 'snacks',
                'name' => 'Chin Chin',
                'description' => 'Crispy, sweet Nigerian pastry cubes.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2800]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/chinchin.jpg',
                'imageUrl' => '/assets/products/chinchin.jpg'
            ],
            [
                'id' => 36,
                'category' => 'snacks',
                'name' => 'Corn Sticks',
                'description' => 'Light & crunchy seasoned corn stick puffs.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 4000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/corn_sticks.jpg',
                'imageUrl' => '/assets/products/corn_sticks.jpg'
            ],
            [
                'id' => 37,
                'category' => 'snacks',
                'name' => 'Plantain Chips — Toasted & Crunchy',
                'description' => 'Crispy savory green plantain chips, lightly salted.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2200]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/plantain__chips.jpg',
                'imageUrl' => '/assets/products/plantain__chips.jpg'
            ],
            [
                'id' => 38,
                'category' => 'snacks',
                'name' => 'Plantain Chips — Ripe & Spicy',
                'description' => 'Sweet ripe plantain chips with chili spice kick.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2200]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/plantain_ripe.jpg',
                'imageUrl' => '/assets/products/plantain_ripe.jpg'
            ],
            [
                'id' => 39,
                'category' => 'snacks',
                'name' => 'Yogurt Mix — Seed & Nut Blend',
                'description' => 'Topping blend of roasted nuts and seeds for parfait or yogurt.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2800]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/yogurt-mix.jpg',
                'imageUrl' => '/assets/products/yogurt-mix.jpg'
            ],

            // ── SEEDS & SPICES ──────────────────────────────────────────────
            [
                'id' => 40,
                'category' => 'spices',
                'name' => 'Chili Pepper',
                'description' => 'Sun-dried finely ground red chili pepper.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/premium-pepper-mix.jpg',
                'imageUrl' => '/assets/products/premium-pepper-mix.jpg'
            ],
            [
                'id' => 41,
                'category' => 'spices',
                'name' => 'Cameroon Pepper',
                'description' => 'Aromatic black Cameroon pepper with intense heat.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2500]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/premium-pepper-mix.jpg',
                'imageUrl' => '/assets/products/premium-pepper-mix.jpg'
            ],
            [
                'id' => 42,
                'category' => 'spices',
                'name' => 'Soya Mix Seasoning',
                'description' => 'Authentic suya spice blend for meats and grills.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2500]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/suya-marinade.jpg',
                'imageUrl' => '/assets/products/suya-marinade.jpg'
            ],
            [
                'id' => 43,
                'category' => 'spices',
                'name' => 'Cinnamon Powder',
                'description' => 'Warm, aromatic ground cinnamon spice.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 2000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/premium-pepper-mix.jpg',
                'imageUrl' => '/assets/products/premium-pepper-mix.jpg'
            ],
            [
                'id' => 44,
                'category' => 'spices',
                'name' => 'Chia Seeds',
                'description' => 'High-fibre organic chia seeds packed with omega-3.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 3500]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/premium-pepper-mix.jpg',
                'imageUrl' => '/assets/products/premium-pepper-mix.jpg'
            ],
            [
                'id' => 45,
                'category' => 'spices',
                'name' => 'Melon Seed (Egusi)',
                'description' => 'Cleaned whole sun-dried egusi melon seeds.',
                'sizes' => [['label' => 'Standard Pack', 'price' => 3000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/products/premium-pepper-mix.jpg',
                'imageUrl' => '/assets/products/premium-pepper-mix.jpg'
            ],

            // ── PLATTERS & TRAYS (8 items) ──────────────────────────────────
            [
                'id' => 17,
                'category' => 'platters',
                'name' => 'Breakfast Platter',
                'description' => 'A full spread for 8–10: akara, moin-moin, pap, egg stew, yam, plantain, fresh juice.',
                'sizes' => [['label' => 'Standard', 'price' => 154000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/breakfast-platter.jpg',
                'imageUrl' => '/assets/platters/breakfast-platter.jpg'
            ],
            [
                'id' => 46,
                'category' => 'platters',
                'name' => 'Party Starter Platter',
                'description' => 'Small chops assortment for 15–20: puff-puff, spring rolls, samosas, chicken skewers.',
                'sizes' => [['label' => 'Standard', 'price' => 247500]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/party-starter-platter.jpg',
                'imageUrl' => '/assets/platters/party-starter-platter.jpg'
            ],
            [
                'id' => 49,
                'category' => 'platters',
                'name' => 'Classic Tray',
                'description' => 'Jollof rice (serves 10), fried chicken (10pcs) and a side salad.',
                'sizes' => [['label' => 'Standard', 'price' => 34500]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/party-starter-platter.jpg',
                'imageUrl' => '/assets/platters/party-starter-platter.jpg'
            ],
            [
                'id' => 50,
                'category' => 'platters',
                'name' => 'Deluxe Tray',
                'description' => 'Jollof + fried rice (serves 15), grilled chicken (15pcs), coleslaw and plantain.',
                'sizes' => [['label' => 'Standard', 'price' => 51750]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/birthday-platter.jpg',
                'imageUrl' => '/assets/platters/birthday-platter.jpg'
            ],
            [
                'id' => 51,
                'category' => 'platters',
                'name' => 'Grand Tray',
                'description' => 'Full spread for 30: jollof, fried rice, peppered turkey, chicken, coleslaw, salad.',
                'sizes' => [['label' => 'Standard', 'price' => 103500]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/anniversary-platter.jpg',
                'imageUrl' => '/assets/platters/anniversary-platter.jpg'
            ],
            [
                'id' => 52,
                'category' => 'platters',
                'name' => 'Ultimate Tray',
                'description' => 'The works for 40+: all three rice options, grilled and peppered meats, full accompaniments.',
                'sizes' => [['label' => 'Standard', 'price' => 132250]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/anniversary-platter.jpg',
                'imageUrl' => '/assets/platters/anniversary-platter.jpg'
            ],
            [
                'id' => 53,
                'category' => 'platters',
                'name' => 'Jollof Lunch Pack',
                'description' => 'Single-serve jollof rice with grilled chicken or beef — perfect for office delivery.',
                'sizes' => [
                    ['label' => 'Regular', 'price' => 9350],
                    ['label' => 'Large', 'price' => 9900]
                ],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/party-starter-platter.jpg',
                'imageUrl' => '/assets/platters/party-starter-platter.jpg'
            ],
            [
                'id' => 18,
                'category' => 'platters',
                'name' => 'Small Chops Box',
                'description' => 'Mixed small chops — puff-puff, spring rolls, samosas (assorted, 12pcs).',
                'sizes' => [['label' => 'Standard', 'price' => 6000]],
                'proteins' => [],
                'available' => true,
                'image_url' => '/assets/platters/party-starter-platter.jpg',
                'imageUrl' => '/assets/platters/party-starter-platter.jpg'
            ],
        ];
    }

    public function list(): void
    {
        $category = $_GET['category'] ?? null;
        $items = self::getStaticMenu();

        if ($category) {
            $items = array_values(array_filter($items, fn($item) => $item['category'] === $category));
        }

        Response::json($items);
    }

    public function get(int $id): void
    {
        $items = self::getStaticMenu();
        foreach ($items as $item) {
            if ($item['id'] === $id) {
                Response::json($item);
                return;
            }
        }
        Response::error('Menu item not found', 404);
    }

    public function create(): void
    {
        Response::error('Admin database modification disabled in JSON storage mode', 403);
    }

    public function update(int $id): void
    {
        Response::error('Admin database modification disabled in JSON storage mode', 403);
    }
}
