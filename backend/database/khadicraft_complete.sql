-- ====================================================
-- KHADICRAFT BY GOLDY — Complete MySQL Database
-- Run: mysql -u root -p < khadicraft_complete.sql
--      (Creates DB khadicraft_db if missing.)
--
-- Seed logins (bcrypt):
--   admin@khadicraft.in   → Admin@123
--   customer@khadicraft.in → Customer@123
--
-- Laravel Sanctum needs personal_access_tokens (included at end).
--
-- Optional extra demo data: khadicraft_additional_seed.sql (run after this file).
-- ====================================================

CREATE DATABASE IF NOT EXISTS khadicraft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE khadicraft_db;

-- 1. USERS
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer','admin','staff','tailor','delivery','wholesale') DEFAULT 'customer',
  avatar VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  email_verified TINYINT(1) DEFAULT 0,
  otp VARCHAR(6),
  otp_expires_at TIMESTAMP NULL,
  remember_token VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. USER ADDRESSES
CREATE TABLE user_addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. MEASUREMENT PROFILES
CREATE TABLE measurement_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  profile_name VARCHAR(100) DEFAULT 'My Measurements',
  chest DECIMAL(5,1),
  waist DECIMAL(5,1),
  hips DECIMAL(5,1),
  shoulder DECIMAL(5,1),
  shirt_length DECIMAL(5,1),
  pant_length DECIMAL(5,1),
  sleeve_length DECIMAL(5,1),
  neck DECIMAL(5,1),
  thigh DECIMAL(5,1),
  inseam DECIMAL(5,1),
  ankle DECIMAL(5,1),
  unit VARCHAR(10) DEFAULT 'inches',
  notes TEXT,
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. CATEGORIES
CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id BIGINT UNSIGNED,
  description TEXT,
  image VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  show_in_menu TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. FABRIC TYPES
CREATE TABLE fabric_types (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  care_instructions TEXT,
  season VARCHAR(50),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. PRODUCTS
CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  fabric_type_id BIGINT UNSIGNED,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE,
  short_description TEXT,
  description LONGTEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  stock INT DEFAULT 0,
  low_stock_alert INT DEFAULT 10,
  weight DECIMAL(8,2),
  unit VARCHAR(20) DEFAULT 'piece',
  product_type ENUM('simple','variable','fabric_meter','custom') DEFAULT 'simple',
  is_active TINYINT(1) DEFAULT 1,
  is_featured TINYINT(1) DEFAULT 0,
  is_custom_available TINYINT(1) DEFAULT 0,
  is_wholesale_available TINYINT(1) DEFAULT 1,
  wholesale_min_qty INT DEFAULT 10,
  wholesale_price DECIMAL(10,2),
  thumbnail VARCHAR(255),
  tags JSON,
  views INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (fabric_type_id) REFERENCES fabric_types(id) ON DELETE SET NULL
);

-- 7. PRODUCT IMAGES
CREATE TABLE product_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_primary TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8. PRODUCT VARIANTS
CREATE TABLE product_variants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  size VARCHAR(20),
  color VARCHAR(50),
  color_hex VARCHAR(10),
  sku VARCHAR(100),
  price DECIMAL(10,2),
  stock INT DEFAULT 0,
  image VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 9. ORDERS
CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending','confirmed','processing','ready','dispatched','delivered','cancelled','returned') DEFAULT 'pending',
  payment_status ENUM('pending','paid','partial','failed','refunded') DEFAULT 'pending',
  payment_method ENUM('cod','online','upi','bank_transfer') DEFAULT 'cod',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_charge DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  gst_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  ship_name VARCHAR(255) NOT NULL,
  ship_phone VARCHAR(15) NOT NULL,
  ship_address TEXT NOT NULL,
  ship_city VARCHAR(100) NOT NULL,
  ship_state VARCHAR(100) NOT NULL,
  ship_pincode VARCHAR(10) NOT NULL,
  tracking_number VARCHAR(100),
  courier VARCHAR(100),
  notes TEXT,
  admin_notes TEXT,
  delivered_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. ORDER ITEMS
CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED,
  product_name VARCHAR(255) NOT NULL,
  variant_info VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  thumbnail VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- 11. CUSTOM ORDERS
CREATE TABLE custom_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED,
  custom_order_number VARCHAR(50) UNIQUE NOT NULL,
  fabric_product_id BIGINT UNSIGNED,
  style_type VARCHAR(100) NOT NULL,
  fabric_name VARCHAR(100),
  fabric_color VARCHAR(50),
  fabric_color_hex VARCHAR(10),
  measurement_profile_id BIGINT UNSIGNED,
  chest DECIMAL(5,1),
  waist DECIMAL(5,1),
  hips DECIMAL(5,1),
  shoulder DECIMAL(5,1),
  shirt_length DECIMAL(5,1),
  pant_length DECIMAL(5,1),
  sleeve_length DECIMAL(5,1),
  neck DECIMAL(5,1),
  thigh DECIMAL(5,1),
  inseam DECIMAL(5,1),
  measurement_unit VARCHAR(10) DEFAULT 'inches',
  special_instructions TEXT,
  reference_image VARCHAR(255),
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  status ENUM('pending','confirmed','fabric_selected','measurement_received','cutting','stitching','finishing','quality_check','ready','dispatched','delivered','cancelled') DEFAULT 'pending',
  assigned_tailor_id BIGINT UNSIGNED,
  estimated_ready_date DATE,
  actual_ready_date DATE,
  tailor_notes TEXT,
  admin_notes TEXT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (fabric_product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (measurement_profile_id) REFERENCES measurement_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_tailor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. CUSTOM ORDER STAGES
CREATE TABLE custom_order_stages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  custom_order_id BIGINT UNSIGNED NOT NULL,
  stage VARCHAR(100) NOT NULL,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  notes TEXT,
  updated_by BIGINT UNSIGNED,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (custom_order_id) REFERENCES custom_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. APPOINTMENTS
CREATE TABLE appointments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  appointment_number VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('shop_visit','home_visit') DEFAULT 'shop_visit',
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  purpose ENUM('measurement','consultation','trial','delivery') DEFAULT 'measurement',
  address TEXT,
  city VARCHAR(100),
  pincode VARCHAR(10),
  status ENUM('pending','confirmed','rescheduled','completed','cancelled') DEFAULT 'pending',
  staff_id BIGINT UNSIGNED,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 14. TIME SLOTS
CREATE TABLE time_slots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slot_label VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INT DEFAULT 3,
  is_active TINYINT(1) DEFAULT 1,
  days_available JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 15. INVENTORY LOGS
CREATE TABLE inventory_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED,
  type ENUM('stock_in','stock_out','adjustment','sale','return','damage') DEFAULT 'stock_in',
  quantity INT NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  reference_type VARCHAR(50),
  reference_id BIGINT UNSIGNED,
  notes TEXT,
  created_by BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 16. WHOLESALE BUYERS
CREATE TABLE wholesale_buyers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(20),
  pan_number VARCHAR(15),
  business_address TEXT,
  business_city VARCHAR(100),
  business_state VARCHAR(100),
  business_pincode VARCHAR(10),
  business_phone VARCHAR(15),
  credit_limit DECIMAL(10,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  status ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. WHOLESALE QUOTES
CREATE TABLE wholesale_quotes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wholesale_buyer_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  items JSON NOT NULL,
  total_amount DECIMAL(10,2),
  gst_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  invoice_number VARCHAR(50),
  status ENUM('requested','quoted','accepted','rejected','converted') DEFAULT 'requested',
  requirements TEXT,
  admin_notes TEXT,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (wholesale_buyer_id) REFERENCES wholesale_buyers(id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 18. PAYMENTS
CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED,
  user_id BIGINT UNSIGNED NOT NULL,
  payment_reference VARCHAR(100) UNIQUE NOT NULL,
  payment_method ENUM('cod','razorpay','upi','net_banking','card') DEFAULT 'cod',
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','success','failed','refunded') DEFAULT 'pending',
  gateway_order_id VARCHAR(100),
  gateway_payment_id VARCHAR(100),
  gateway_response JSON,
  refund_id VARCHAR(100),
  refund_amount DECIMAL(10,2),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 19. REVIEWS
CREATE TABLE reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED,
  rating TINYINT UNSIGNED NOT NULL,
  title VARCHAR(255),
  review TEXT,
  images JSON,
  is_approved TINYINT(1) DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  admin_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- 20. NOTIFICATIONS
CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info',
  is_read TINYINT(1) DEFAULT 0,
  data JSON,
  action_url VARCHAR(255),
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 21. SETTINGS
CREATE TABLE settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL,
  `value` LONGTEXT,
  `group` VARCHAR(50) DEFAULT 'general',
  `type` VARCHAR(20) DEFAULT 'text',
  label VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 22. BANNERS
CREATE TABLE banners (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image VARCHAR(255) NOT NULL,
  link VARCHAR(255),
  button_text VARCHAR(50),
  position ENUM('hero','category','sidebar','popup') DEFAULT 'hero',
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 23. SIZE CHARTS
CREATE TABLE size_charts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED,
  name VARCHAR(100) NOT NULL,
  size_label VARCHAR(10) NOT NULL,
  chest_min DECIMAL(5,1),
  chest_max DECIMAL(5,1),
  waist_min DECIMAL(5,1),
  waist_max DECIMAL(5,1),
  hip_min DECIMAL(5,1),
  hip_max DECIMAL(5,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============ SEED DEFAULT DATA ============

INSERT INTO users (name, email, phone, password, role, email_verified, is_active) VALUES
('Goldy Admin', 'admin@khadicraft.in', '9876543210', '$2y$12$f9t3imFBgqxra2T41R072OB2iNaImWN0w1BJRawN2ZaYLY4QIotQy', 'admin', 1, 1),
('Test Customer', 'customer@khadicraft.in', '9876543211', '$2y$12$NUdUQNR7o5YohZRizHTFAuC05/Go3twPEQOcX7u9QstTwfb1Rpoae', 'customer', 1, 1);

-- Categories
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Fabric & Thaan', 'fabric-thaan', 'Raw and processed khadi fabrics sold per meter', 1, 1),
('Ready-made Clothing', 'ready-made', 'Ready to wear khadi garments', 1, 2),
('Custom Tailoring', 'custom-tailoring', 'Bespoke stitched garments', 1, 3),
('Accessories', 'accessories', 'Scarves, dupattas, handkerchiefs and more', 1, 4),
('Wholesale', 'wholesale', 'Bulk fabric and garment orders', 1, 5);

-- Sub-categories
INSERT INTO categories (name, slug, parent_id, is_active, sort_order) VALUES
('Cotton Khadi', 'cotton-khadi', 1, 1, 1),
('Silk Blend', 'silk-blend', 1, 1, 2),
('Linen', 'linen', 1, 1, 3),
('Kurta Sets', 'kurta-sets', 2, 1, 1),
('Blazers & Jackets', 'blazers-jackets', 2, 1, 2),
('Coat & Pant', 'coat-pant', 2, 1, 3),
('Sarees & Dupattas', 'sarees-dupattas', 2, 1, 4);

-- Fabric Types
INSERT INTO fabric_types (name, description, care_instructions, season) VALUES
('Pure Cotton Khadi', 'Hand-spun and hand-woven 100% cotton khadi', 'Hand wash cold, dry in shade', 'All seasons'),
('Silk-Cotton Blend', 'Premium blend of silk and khadi cotton', 'Dry clean recommended', 'Winter, Festive'),
('Pure Linen', 'European quality linen fabric', 'Machine wash gentle, iron damp', 'Summer'),
('Wool Khadi', 'Warm handwoven wool khadi', 'Dry clean only', 'Winter'),
('Handspun Cotton', 'Traditional charkha-spun cotton', 'Hand wash gentle', 'Summer, Monsoon');

-- Default time slots
INSERT INTO time_slots (slot_label, start_time, end_time, max_bookings, days_available) VALUES
('10:00 AM - 11:00 AM', '10:00:00', '11:00:00', 3, '["monday","tuesday","wednesday","thursday","friday","saturday"]'),
('11:00 AM - 12:00 PM', '11:00:00', '12:00:00', 3, '["monday","tuesday","wednesday","thursday","friday","saturday"]'),
('12:00 PM - 1:00 PM', '12:00:00', '13:00:00', 2, '["monday","tuesday","wednesday","thursday","friday","saturday"]'),
('2:00 PM - 3:00 PM', '14:00:00', '15:00:00', 3, '["monday","tuesday","wednesday","thursday","friday","saturday"]'),
('3:00 PM - 4:00 PM', '15:00:00', '16:00:00', 3, '["monday","tuesday","wednesday","thursday","friday","saturday"]'),
('4:00 PM - 5:00 PM', '16:00:00', '17:00:00', 3, '["monday","tuesday","wednesday","thursday","friday","saturday"]'),
('5:00 PM - 6:00 PM', '17:00:00', '18:00:00', 3, '["monday","tuesday","wednesday","thursday","friday","saturday"]');

-- Settings
INSERT INTO settings (`key`, `value`, `group`, `type`, label) VALUES
('site_name', 'KhadiCraft by Goldy', 'general', 'text', 'Site Name'),
('site_email', 'hello@khadicraft.in', 'general', 'text', 'Contact Email'),
('site_phone', '+91 98765 43210', 'general', 'text', 'Contact Phone'),
('site_address', 'Sector 22, Chandigarh, Punjab 160022', 'general', 'text', 'Shop Address'),
('gst_number', '03ABCDE1234F1Z5', 'billing', 'text', 'GST Number'),
('gst_percent', '5', 'billing', 'text', 'GST Percentage'),
('free_shipping_above', '1000', 'shipping', 'text', 'Free Shipping Above (₹)'),
('shipping_charge', '80', 'shipping', 'text', 'Default Shipping Charge (₹)'),
('cod_available', 'true', 'payment', 'boolean', 'COD Available'),
('razorpay_key', '', 'payment', 'text', 'Razorpay Key ID'),
('razorpay_secret', '', 'payment', 'text', 'Razorpay Secret'),
('custom_order_advance', '50', 'custom', 'text', 'Custom Order Advance %'),
('custom_order_days', '7', 'custom', 'text', 'Custom Order TAT (days)'),
('low_stock_notify', 'true', 'inventory', 'boolean', 'Low Stock Notification'),
('shop_open_time', '10:00', 'shop', 'text', 'Shop Opening Time'),
('shop_close_time', '19:00', 'shop', 'text', 'Shop Closing Time'),
('shop_closed_days', '["sunday"]', 'shop', 'json', 'Closed Days');

-- Sample Products
INSERT INTO products (category_id, fabric_type_id, name, slug, sku, short_description, price, sale_price, stock, is_active, is_featured, is_custom_available, thumbnail) VALUES
(1, 1, 'Pure Cotton Khadi Fabric', 'pure-cotton-khadi-fabric', 'FAB-001', 'Hand-spun pure cotton khadi fabric. Natural texture, breathable and comfortable.', 280.00, NULL, 500, 1, 1, 0, '/storage/products/fabric1.jpg'),
(2, 1, 'Classic Khadi Kurta Set', 'classic-khadi-kurta-set', 'RDY-001', 'Elegant handloom khadi kurta with matching pajama. Perfect for daily and festive wear.', 1299.00, 999.00, 45, 1, 1, 1, '/storage/products/kurta1.jpg'),
(2, 2, 'Khadi Silk Blazer', 'khadi-silk-blazer', 'RDY-002', 'Premium silk-blend khadi blazer. Sophisticated and timeless.', 3499.00, NULL, 20, 1, 1, 1, '/storage/products/blazer1.jpg'),
(2, 3, 'Linen Khadi Shirt', 'linen-khadi-shirt', 'RDY-003', 'Premium linen khadi shirt for formal and casual occasions.', 899.00, 749.00, 60, 1, 0, 1, '/storage/products/shirt1.jpg'),
(4, 1, 'Khadi Cotton Dupatta', 'khadi-cotton-dupatta', 'ACC-001', 'Handwoven cotton dupatta with natural dyes. Lightweight and elegant.', 450.00, NULL, 80, 1, 0, 0, '/storage/products/dupatta1.jpg'),
(2, 4, 'Woolen Khadi Jacket', 'woolen-khadi-jacket', 'RDY-004', 'Warm handwoven wool khadi jacket. Perfect for winter.', 2799.00, 2299.00, 15, 1, 1, 1, '/storage/products/jacket1.jpg');

-- Product variants for Kurta Set
INSERT INTO product_variants (product_id, size, color, color_hex, sku, stock) VALUES
(2, 'S', 'Natural White', '#F5F0E8', 'RDY-001-S-WH', 8),
(2, 'M', 'Natural White', '#F5F0E8', 'RDY-001-M-WH', 12),
(2, 'L', 'Natural White', '#F5F0E8', 'RDY-001-L-WH', 10),
(2, 'XL', 'Natural White', '#F5F0E8', 'RDY-001-XL-WH', 6),
(2, 'M', 'Forest Green', '#1B4332', 'RDY-001-M-GR', 5),
(2, 'L', 'Forest Green', '#1B4332', 'RDY-001-L-GR', 4);

-- Laravel Sanctum (API Bearer tokens)
CREATE TABLE IF NOT EXISTS personal_access_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  abilities TEXT,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
);
