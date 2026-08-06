-- Seed Data for AHmazing Foods (MySQL)

INSERT IGNORE INTO admin_users (username, password_hash, name, role) VALUES 
('admin', '$2y$10$O6yzofIbayP6WAXmULNeHO3d1REh/0FtWQxjyWvhUDQT4VxrVID5S', 'AHmazing Admin', 'admin');

INSERT INTO menu_items (category, name, description, sizes, proteins, available, image_url) VALUES
('soups', 'Onugbu Soup (Bitterleaf)', 'Rich bitterleaf soup garnished with dried fish, stockfish and cowhide.', 
 '[{"label":"2 Litres (Serves ~3)","price":32000},{"label":"3 Litres (Serves ~5)","price":36000},{"label":"5 Litres (Serves ~7)","price":43000}]', 
 '[{"name":"Beef","extraCost":4000},{"name":"Chicken","extraCost":4700},{"name":"Turkey","extraCost":5700},{"name":"Fish","extraCost":5700}]', 1, 'assets/soups/onugbu-soup.jpg'),

('soups', 'Oha Soup', 'Traditional Igbo oha leaf soup, hearty and deeply flavoured.', 
 '[{"label":"2 Litres (Serves ~3)","price":32000},{"label":"3 Litres (Serves ~5)","price":36000},{"label":"5 Litres (Serves ~7)","price":43000}]', 
 '[{"name":"Beef","extraCost":4000},{"name":"Chicken","extraCost":4700},{"name":"Turkey","extraCost":5700}]', 1, 'assets/soups/oha-soup.jpg'),

('soups', 'Okro Soup', 'Freshly made okro soup, silky and well-seasoned with your choice of protein.', 
 '[{"label":"2 Litres (Serves ~3)","price":32000},{"label":"3 Litres (Serves ~5)","price":36000},{"label":"5 Litres (Serves ~7)","price":43000}]', 
 '[{"name":"Beef","extraCost":4000},{"name":"Chicken","extraCost":4700},{"name":"Seafood","extraCost":11700}]', 1, 'assets/soups/okro-soup.jpg'),

('soups', 'Egusi Soup', 'Thick, golden egusi soup cooked low and slow with ground melon seeds.', 
 '[{"label":"2 Litres (Serves ~3)","price":32000},{"label":"3 Litres (Serves ~5)","price":36000},{"label":"5 Litres (Serves ~7)","price":43000}]', 
 '[{"name":"Beef","extraCost":4000},{"name":"Assorted Meat","extraCost":5700}]', 1, 'assets/soups/egusi-soup.jpg'),

('stews', 'Classic Tomato Stew', 'A rich, slow-cooked tomato base stew — the backbone of Nigerian cooking.', 
 '[{"label":"3 Litres (Serves ~5)","price":37000},{"label":"5 Litres (Serves ~8)","price":45000}]', 
 '[]', 1, 'assets/stews/classic-tomato-stew.webp'),

('stews', 'Ayamase (Ofada Stew)', 'Spicy green pepper stew with assorted offals — pairs perfectly with ofada rice.', 
 '[{"label":"3 Litres (Serves ~5)","price":40000},{"label":"5 Litres (Serves ~8)","price":49000}]', 
 '[]', 1, 'assets/stews/ayamase-stew.jpg'),

('breakfast', 'Akara & Ogi (Pap)', 'Freshly fried golden akara balls served with warm, smooth pap.', 
 '[{"label":"Standard Portion","price":5500}]', 
 '[]', 1, 'assets/breakfast/akara-pap.jpg'),

('platters', 'Small Chops Platter', 'Samosa, spring rolls, puff puff, and gizzard kebabs.', 
 '[{"label":"Medium Platter (Serves 5-8)","price":25000},{"label":"Large Platter (Serves 10-15)","price":45000}]', 
 '[]', 1, 'assets/platters/small-chops.jpg');
