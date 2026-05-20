-- ====================================================
-- KhadiCraft — Additional seed data (MySQL)
-- Prerequisites: run khadicraft_complete.sql first on khadicraft_db.
-- Run: mysql -u root -p khadicraft_db < khadicraft_additional_seed.sql
-- ====================================================

USE khadicraft_db;

-- ==========================================
-- EXTRA CATEGORIES
-- ==========================================

INSERT INTO categories (name, slug, parent_id, description, is_active, sort_order) VALUES
('Mens Wear', 'mens-wear', 2, 'Traditional and modern khadi menswear', 1, 10),
('Womens Wear', 'womens-wear', 2, 'Elegant khadi womens collection', 1, 11),
('Kids Wear', 'kids-wear', 2, 'Comfortable khadi clothing for kids', 1, 12),
('Organic Cotton', 'organic-cotton', 1, 'Eco-friendly organic khadi fabrics', 1, 13),
('Designer Fabrics', 'designer-fabrics', 1, 'Premium designer handloom fabrics', 1, 14),
('Wedding Collection', 'wedding-collection', 2, 'Luxury wedding outfits', 1, 15),
('Office Wear', 'office-wear', 2, 'Professional khadi office collection', 1, 16),
('Summer Collection', 'summer-collection', 2, 'Breathable summer outfits', 1, 17),
('Winter Collection', 'winter-collection', 2, 'Warm winter khadi clothing', 1, 18),
('Handloom Specials', 'handloom-specials', 1, 'Exclusive handloom products', 1, 19);

-- ==========================================
-- EXTRA FABRIC TYPES
-- ==========================================

INSERT INTO fabric_types (name, description, care_instructions, season) VALUES
('Organic Khadi Cotton', 'Premium organic handwoven cotton', 'Gentle hand wash only', 'Summer'),
('Denim Khadi', 'Strong textured khadi denim', 'Machine wash cold', 'All seasons'),
('Rayon Khadi Blend', 'Soft rayon mixed khadi', 'Dry clean preferred', 'Festive'),
('Mulmul Cotton', 'Ultra soft breathable cotton', 'Hand wash', 'Summer'),
('Slub Cotton', 'Textured slub cotton khadi', 'Machine wash gentle', 'All seasons'),
('Khadi Silk Premium', 'Luxury silk khadi blend', 'Dry clean only', 'Wedding'),
('Bamboo Cotton Khadi', 'Eco-friendly bamboo cotton fabric', 'Gentle wash', 'Summer'),
('Jacquard Khadi', 'Designer jacquard weave khadi', 'Dry clean preferred', 'Festive');

-- ==========================================
-- EXTRA PRODUCTS (IDs follow complete seed: next id is 7)
-- ==========================================

INSERT INTO products (
category_id,
fabric_type_id,
name,
slug,
sku,
short_description,
description,
price,
sale_price,
cost_price,
stock,
low_stock_alert,
weight,
unit,
product_type,
is_active,
is_featured,
is_custom_available,
is_wholesale_available,
wholesale_min_qty,
wholesale_price,
thumbnail
) VALUES

(1,1,'White Cotton Khadi Fabric','white-cotton-khadi-fabric','FAB-1001','Premium white cotton khadi fabric','Pure breathable cotton khadi fabric ideal for kurtas and shirts',320,280,190,400,20,0.5,'meter','fabric_meter',1,1,0,1,20,240,'/storage/products/fabric_white.jpg'),

(1,2,'Royal Silk Khadi Fabric','royal-silk-khadi-fabric','FAB-1002','Luxury silk khadi blend fabric','Elegant silk blend handwoven khadi fabric',780,699,500,150,10,0.6,'meter','fabric_meter',1,1,0,1,10,640,'/storage/products/fabric_silk.jpg'),

(2,1,'Classic White Kurta','classic-white-kurta','KUR-1001','Traditional white khadi kurta','Soft handwoven kurta for daily and festive use',1499,1199,800,60,5,0.7,'piece','simple',1,1,1,1,10,1050,'/storage/products/kurta_white.jpg'),

(2,1,'Black Khadi Kurta Pajama','black-khadi-kurta-pajama','KUR-1002','Elegant black kurta pajama set','Premium black khadi outfit for festive occasions',1999,1699,1200,45,5,0.9,'piece','simple',1,1,1,1,8,1550,'/storage/products/kurta_black.jpg'),

(2,3,'Linen Office Shirt','linen-office-shirt','SHT-1001','Formal khadi office shirt','Premium linen khadi shirt for office wear',999,849,550,80,10,0.5,'piece','simple',1,0,1,1,12,790,'/storage/products/shirt_office.jpg'),

(2,4,'Summer Cotton Saree','summer-cotton-saree','SAR-1001','Lightweight cotton saree','Elegant handcrafted summer saree',2499,2199,1600,35,5,1.1,'piece','simple',1,1,0,1,5,2050,'/storage/products/saree_summer.jpg'),

(4,1,'Khadi Cotton Dupatta Blue','khadi-cotton-dupatta-blue','DUP-1001','Blue cotton dupatta','Elegant lightweight blue dupatta',599,499,300,90,10,0.2,'piece','simple',1,0,0,1,20,450,'/storage/products/dupatta_blue.jpg'),

(4,1,'Khadi Handkerchief Set','khadi-handkerchief-set','ACC-1001','Pack of 5 khadi handkerchiefs','Soft reusable handwoven handkerchiefs',299,249,120,120,20,0.1,'pack','simple',1,0,0,1,25,220,'/storage/products/hanky.jpg'),

(2,5,'Winter Wool Khadi Jacket','winter-wool-khadi-jacket','JKT-1001','Warm wool khadi jacket','Premium handcrafted winter jacket',3999,3499,2500,25,5,1.5,'piece','simple',1,1,1,1,5,3300,'/storage/products/jacket_winter.jpg'),

(2,6,'Wedding Sherwani Khadi','wedding-sherwani-khadi','SHR-1001','Luxury khadi sherwani','Designer handcrafted wedding sherwani',8999,7999,6000,12,2,2.5,'piece','simple',1,1,1,1,2,7600,'/storage/products/sherwani.jpg');

-- ==========================================
-- PRODUCT VARIANTS (product ids: kurta=9, kurta black=10, shirt=11, dupatta=13)
-- ==========================================

INSERT INTO product_variants (
product_id,
size,
color,
color_hex,
sku,
price,
stock,
is_active
) VALUES

(9,'S','White','#FFFFFF','KUR-1001-S-WH',1199,10,1),
(9,'M','White','#FFFFFF','KUR-1001-M-WH',1199,14,1),
(9,'L','White','#FFFFFF','KUR-1001-L-WH',1199,16,1),
(9,'XL','White','#FFFFFF','KUR-1001-XL-WH',1199,8,1),

(10,'M','Black','#000000','KUR-1002-M-BLK',1699,8,1),
(10,'L','Black','#000000','KUR-1002-L-BLK',1699,10,1),
(10,'XL','Black','#000000','KUR-1002-XL-BLK',1699,6,1),

(11,'M','Sky Blue','#87CEEB','SHT-1001-M-SKY',849,15,1),
(11,'L','Sky Blue','#87CEEB','SHT-1001-L-SKY',849,12,1),

(13,'Free Size','Blue','#0000FF','DUP-1001-F-BLU',499,40,1);

-- ==========================================
-- RAW MATERIAL PRODUCTS (50 ITEMS)
-- ==========================================

INSERT INTO products (
category_id,
fabric_type_id,
name,
slug,
sku,
short_description,
price,
cost_price,
stock,
unit,
product_type,
is_active,
is_wholesale_available,
wholesale_min_qty,
wholesale_price,
thumbnail
) VALUES

(1,1,'Raw Cotton Khadi White','raw-cotton-khadi-white','RAW-001','Raw white khadi fabric',220,150,500,'meter','fabric_meter',1,1,20,190,'/storage/raw/raw1.jpg'),
(1,1,'Raw Cotton Khadi Cream','raw-cotton-khadi-cream','RAW-002','Cream khadi fabric',230,155,450,'meter','fabric_meter',1,1,20,200,'/storage/raw/raw2.jpg'),
(1,1,'Raw Cotton Khadi Beige','raw-cotton-khadi-beige','RAW-003','Beige khadi fabric',240,160,430,'meter','fabric_meter',1,1,20,210,'/storage/raw/raw3.jpg'),
(1,1,'Raw Cotton Khadi Brown','raw-cotton-khadi-brown','RAW-004','Brown khadi fabric',250,170,410,'meter','fabric_meter',1,1,20,220,'/storage/raw/raw4.jpg'),
(1,1,'Raw Cotton Khadi Black','raw-cotton-khadi-black','RAW-005','Black khadi fabric',260,180,390,'meter','fabric_meter',1,1,20,230,'/storage/raw/raw5.jpg'),
(1,1,'Raw Cotton Khadi Blue','raw-cotton-khadi-blue','RAW-006','Blue khadi fabric',265,182,380,'meter','fabric_meter',1,1,20,235,'/storage/raw/raw6.jpg'),
(1,1,'Raw Cotton Khadi Green','raw-cotton-khadi-green','RAW-007','Green khadi fabric',270,185,370,'meter','fabric_meter',1,1,20,240,'/storage/raw/raw7.jpg'),
(1,1,'Raw Cotton Khadi Red','raw-cotton-khadi-red','RAW-008','Red khadi fabric',275,190,360,'meter','fabric_meter',1,1,20,245,'/storage/raw/raw8.jpg'),
(1,1,'Raw Cotton Khadi Yellow','raw-cotton-khadi-yellow','RAW-009','Yellow khadi fabric',280,195,350,'meter','fabric_meter',1,1,20,250,'/storage/raw/raw9.jpg'),
(1,1,'Raw Cotton Khadi Pink','raw-cotton-khadi-pink','RAW-010','Pink khadi fabric',285,200,340,'meter','fabric_meter',1,1,20,255,'/storage/raw/raw10.jpg'),

(1,2,'Raw Silk Blend Gold','raw-silk-blend-gold','RAW-011','Golden silk blend fabric',650,500,120,'meter','fabric_meter',1,1,10,600,'/storage/raw/raw11.jpg'),
(1,2,'Raw Silk Blend Maroon','raw-silk-blend-maroon','RAW-012','Maroon silk blend fabric',660,510,115,'meter','fabric_meter',1,1,10,610,'/storage/raw/raw12.jpg'),
(1,2,'Raw Silk Blend Navy','raw-silk-blend-navy','RAW-013','Navy silk blend fabric',670,520,110,'meter','fabric_meter',1,1,10,620,'/storage/raw/raw13.jpg'),
(1,2,'Raw Silk Blend Silver','raw-silk-blend-silver','RAW-014','Silver silk blend fabric',680,530,105,'meter','fabric_meter',1,1,10,630,'/storage/raw/raw14.jpg'),
(1,2,'Raw Silk Blend Purple','raw-silk-blend-purple','RAW-015','Purple silk blend fabric',690,540,100,'meter','fabric_meter',1,1,10,640,'/storage/raw/raw15.jpg'),

(1,3,'Pure Linen White','pure-linen-white','RAW-016','Premium white linen',480,350,160,'meter','fabric_meter',1,1,15,430,'/storage/raw/raw16.jpg'),
(1,3,'Pure Linen Grey','pure-linen-grey','RAW-017','Grey linen fabric',485,355,155,'meter','fabric_meter',1,1,15,435,'/storage/raw/raw17.jpg'),
(1,3,'Pure Linen Olive','pure-linen-olive','RAW-018','Olive linen fabric',490,360,150,'meter','fabric_meter',1,1,15,440,'/storage/raw/raw18.jpg'),
(1,3,'Pure Linen Sky Blue','pure-linen-sky-blue','RAW-019','Sky blue linen fabric',495,365,145,'meter','fabric_meter',1,1,15,445,'/storage/raw/raw19.jpg'),
(1,3,'Pure Linen Charcoal','pure-linen-charcoal','RAW-020','Charcoal linen fabric',500,370,140,'meter','fabric_meter',1,1,15,450,'/storage/raw/raw20.jpg'),

(1,4,'Wool Khadi Dark Grey','wool-khadi-dark-grey','RAW-021','Warm wool khadi fabric',720,580,80,'meter','fabric_meter',1,1,8,680,'/storage/raw/raw21.jpg'),
(1,4,'Wool Khadi Brown','wool-khadi-brown','RAW-022','Brown wool khadi fabric',725,585,78,'meter','fabric_meter',1,1,8,685,'/storage/raw/raw22.jpg'),
(1,4,'Wool Khadi Black','wool-khadi-black','RAW-023','Black wool khadi fabric',730,590,76,'meter','fabric_meter',1,1,8,690,'/storage/raw/raw23.jpg'),
(1,4,'Wool Khadi Cream','wool-khadi-cream','RAW-024','Cream wool khadi fabric',735,595,74,'meter','fabric_meter',1,1,8,695,'/storage/raw/raw24.jpg'),
(1,4,'Wool Khadi Navy','wool-khadi-navy','RAW-025','Navy wool khadi fabric',740,600,72,'meter','fabric_meter',1,1,8,700,'/storage/raw/raw25.jpg'),

(1,5,'Handspun Cotton White','handspun-cotton-white','RAW-026','Handspun white cotton',310,220,220,'meter','fabric_meter',1,1,20,280,'/storage/raw/raw26.jpg'),
(1,5,'Handspun Cotton Green','handspun-cotton-green','RAW-027','Green handspun cotton',315,225,215,'meter','fabric_meter',1,1,20,285,'/storage/raw/raw27.jpg'),
(1,5,'Handspun Cotton Indigo','handspun-cotton-indigo','RAW-028','Indigo handspun cotton',320,230,210,'meter','fabric_meter',1,1,20,290,'/storage/raw/raw28.jpg'),
(1,5,'Handspun Cotton Peach','handspun-cotton-peach','RAW-029','Peach handspun cotton',325,235,205,'meter','fabric_meter',1,1,20,295,'/storage/raw/raw29.jpg'),
(1,5,'Handspun Cotton Lavender','handspun-cotton-lavender','RAW-030','Lavender handspun cotton',330,240,200,'meter','fabric_meter',1,1,20,300,'/storage/raw/raw30.jpg'),

(1,6,'Premium Wedding Khadi Gold','premium-wedding-khadi-gold','RAW-031','Luxury wedding khadi',980,760,45,'meter','fabric_meter',1,1,5,920,'/storage/raw/raw31.jpg'),
(1,6,'Premium Wedding Khadi Red','premium-wedding-khadi-red','RAW-032','Luxury wedding red khadi',990,770,42,'meter','fabric_meter',1,1,5,930,'/storage/raw/raw32.jpg'),
(1,6,'Premium Wedding Khadi Ivory','premium-wedding-khadi-ivory','RAW-033','Ivory wedding khadi',995,775,40,'meter','fabric_meter',1,1,5,940,'/storage/raw/raw33.jpg'),
(1,6,'Premium Wedding Khadi Royal Blue','premium-wedding-khadi-royal-blue','RAW-034','Royal blue wedding khadi',1000,780,38,'meter','fabric_meter',1,1,5,950,'/storage/raw/raw34.jpg'),
(1,6,'Premium Wedding Khadi Black','premium-wedding-khadi-black','RAW-035','Black luxury wedding khadi',1010,790,35,'meter','fabric_meter',1,1,5,960,'/storage/raw/raw35.jpg'),

(1,7,'Office Wear Khadi Grey','office-wear-khadi-grey','RAW-036','Grey office wear fabric',430,310,170,'meter','fabric_meter',1,1,15,390,'/storage/raw/raw36.jpg'),
(1,7,'Office Wear Khadi Navy','office-wear-khadi-navy','RAW-037','Navy office wear fabric',435,315,168,'meter','fabric_meter',1,1,15,395,'/storage/raw/raw37.jpg'),
(1,7,'Office Wear Khadi Black','office-wear-khadi-black','RAW-038','Black office wear fabric',440,320,165,'meter','fabric_meter',1,1,15,400,'/storage/raw/raw38.jpg'),
(1,7,'Office Wear Khadi White','office-wear-khadi-white','RAW-039','White office wear fabric',445,325,162,'meter','fabric_meter',1,1,15,405,'/storage/raw/raw39.jpg'),
(1,7,'Office Wear Khadi Beige','office-wear-khadi-beige','RAW-040','Beige office wear fabric',450,330,160,'meter','fabric_meter',1,1,15,410,'/storage/raw/raw40.jpg'),

(1,8,'Designer Jacquard Khadi Gold','designer-jacquard-khadi-gold','RAW-041','Designer gold jacquard',860,690,65,'meter','fabric_meter',1,1,8,810,'/storage/raw/raw41.jpg'),
(1,8,'Designer Jacquard Khadi Silver','designer-jacquard-khadi-silver','RAW-042','Designer silver jacquard',865,695,63,'meter','fabric_meter',1,1,8,815,'/storage/raw/raw42.jpg'),
(1,8,'Designer Jacquard Khadi Black','designer-jacquard-khadi-black','RAW-043','Designer black jacquard',870,700,61,'meter','fabric_meter',1,1,8,820,'/storage/raw/raw43.jpg'),
(1,8,'Designer Jacquard Khadi Maroon','designer-jacquard-khadi-maroon','RAW-044','Designer maroon jacquard',875,705,59,'meter','fabric_meter',1,1,8,825,'/storage/raw/raw44.jpg'),
(1,8,'Designer Jacquard Khadi Navy','designer-jacquard-khadi-navy','RAW-045','Designer navy jacquard',880,710,57,'meter','fabric_meter',1,1,8,830,'/storage/raw/raw45.jpg'),

(1,1,'Natural Dye Khadi Orange','natural-dye-khadi-orange','RAW-046','Orange natural dye fabric',350,250,190,'meter','fabric_meter',1,1,20,320,'/storage/raw/raw46.jpg'),
(1,1,'Natural Dye Khadi Indigo','natural-dye-khadi-indigo','RAW-047','Indigo natural dye fabric',355,255,185,'meter','fabric_meter',1,1,20,325,'/storage/raw/raw47.jpg'),
(1,1,'Natural Dye Khadi Green','natural-dye-khadi-green','RAW-048','Green natural dye fabric',360,260,180,'meter','fabric_meter',1,1,20,330,'/storage/raw/raw48.jpg'),
(1,1,'Natural Dye Khadi Pink','natural-dye-khadi-pink','RAW-049','Pink natural dye fabric',365,265,175,'meter','fabric_meter',1,1,20,335,'/storage/raw/raw49.jpg'),
(1,1,'Natural Dye Khadi Purple','natural-dye-khadi-purple','RAW-050','Purple natural dye fabric',370,270,170,'meter','fabric_meter',1,1,20,340,'/storage/raw/raw50.jpg');

-- ==========================================
-- SAMPLE BANNERS (links aligned with SPA routes)
-- ==========================================

INSERT INTO banners (
title,
subtitle,
image,
link,
button_text,
position,
is_active,
sort_order
) VALUES

('Summer Khadi Collection','Breathable handmade fabrics for summer','/storage/banners/summer.jpg','/shop','Shop Now','hero',1,1),
('Wedding Collection','Luxury handcrafted wedding outfits','/storage/banners/wedding.jpg','/shop/wedding-collection','Explore','hero',1,2),
('Wholesale Deals','Bulk orders at best prices','/storage/banners/wholesale.jpg','/wholesale','Get Quote','sidebar',1,3),
('Custom Tailoring','Get perfectly stitched outfits','/storage/banners/custom.jpg','/custom-tailoring','Book Now','category',1,4);

-- ==========================================
-- SAMPLE INVENTORY LOGS (matches stocks after inserts above)
-- ==========================================

INSERT INTO inventory_logs (
product_id,
type,
quantity,
stock_before,
stock_after,
reference_type,
notes,
created_by
) VALUES

(7,'stock_in',50,400,450,'purchase','White fabric stock inbound',1),
(8,'stock_in',20,150,170,'purchase','Silk fabric updated',1),
(9,'sale',2,60,58,'order','Customer order completed',1),
(10,'sale',1,45,44,'order','Festive sale',1),
(11,'adjustment',5,80,85,'manual','Inventory corrected',1),
(12,'stock_in',10,35,45,'purchase','Saree stock refill',1);

-- ==========================================
-- SAMPLE REVIEWS (user_id 2 = Test Customer from base seed)
-- ==========================================

INSERT INTO reviews (
user_id,
product_id,
rating,
title,
review,
is_approved,
is_featured
) VALUES

(2,7,5,'Excellent Quality','Fabric quality is amazing and very comfortable.',1,1),
(2,8,4,'Lovely Silk Blend','Nice texture and premium feel.',1,0),
(2,11,5,'Perfect Office Wear','Very breathable shirt for summer.',1,1),
(2,12,4,'Beautiful Saree','Color and texture are really good.',1,0);

-- ==========================================
-- SAMPLE NOTIFICATIONS
-- ==========================================

INSERT INTO notifications (
user_id,
title,
message,
type,
is_read
) VALUES

(2,'Order Confirmed','Your order has been confirmed successfully.','success',0),
(2,'New Collection Added','Check out the latest summer khadi collection.','info',0),
(1,'Low Stock Alert','Some products are reaching low inventory.','warning',0),
(1,'New Wholesale Inquiry','A new wholesale quote request has arrived.','info',0);
