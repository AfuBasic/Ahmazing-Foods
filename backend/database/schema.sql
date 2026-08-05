-- Schema for AHmazing Foods (PostgreSQL / MySQL compatible)

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    proteins JSONB NOT NULL DEFAULT '[]'::jsonb,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    menu_item_id INT NOT NULL REFERENCES menu_items(id),
    menu_item_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    selected_size VARCHAR(100) NOT NULL,
    selected_protein VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT,
    delivery_date DATE NOT NULL,
    delivery_slot VARCHAR(50) NOT NULL,
    item_price INT NOT NULL,
    rush_fee INT NOT NULL DEFAULT 0,
    total INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    paystack_ref VARCHAR(255),
    pepper_level VARCHAR(50),
    cart_items JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specials_votes (
    id SERIAL PRIMARY KEY,
    special_name VARCHAR(255) NOT NULL,
    week_of DATE NOT NULL,
    voter_phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT specials_votes_week_phone_unique UNIQUE (week_of, voter_phone)
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
