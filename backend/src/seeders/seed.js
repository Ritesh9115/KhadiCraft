// src/seeders/seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("../models/User");
const Category = require("../models/Category");
const FabricType = require("../models/FabricType");
const Product = require("../models/Product");
const Banner = require("../models/Banner");
const Setting = require("../models/Setting");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `✅ MongoDB Connected for Seeding : ${conn.connection.host}`
    );
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {

    console.log("Clearing Database...");

    await User.deleteMany({});
    await Category.deleteMany({});
    await FabricType.deleteMany({});
    await Product.deleteMany({});
    await Banner.deleteMany({});
    await Setting.deleteMany({});

    console.log("Database Cleared Successfully.");

    // =========================================================
    // USERS
    // =========================================================

    console.log("Seeding Users...");

    const password = await bcrypt.hash("password123", 12);

    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@khadicraft.in",
        phone: "9999999991",
        password,
        role: "admin",
        is_active: true,
        email_verified: true,
      },

      {
        name: "Rahul Tailor",
        email: "rahul@khadicraft.in",
        phone: "9999999992",
        password,
        role: "tailor",
        is_active: true,
        email_verified: true,
      },

      {
        name: "Aman Tailor",
        email: "aman@khadicraft.in",
        phone: "9999999993",
        password,
        role: "tailor",
        is_active: true,
        email_verified: true,
      },

      {
        name: "Ritesh Sharma",
        email: "ritesh@gmail.com",
        phone: "9999999994",
        password,
        role: "customer",
        is_active: true,
        email_verified: true,
      },

      {
        name: "John Doe",
        email: "john@gmail.com",
        phone: "9999999995",
        password,
        role: "customer",
        is_active: true,
        email_verified: true,
      },
    ]);

    console.log("✅ Users Added");

    // =========================================================
    // CATEGORIES
    // =========================================================

    console.log("Seeding Categories...");

    const categories = await Category.insertMany([
      {
        name: "Shirting Fabrics",
        slug: "shirting-fabrics",
        description:
          "Premium fabrics for formal and casual shirts.",
        sort_order: 1,
        is_active: true,
      },

      {
        name: "Suiting Fabrics",
        slug: "suiting-fabrics",
        description:
          "Luxury fabrics for premium suits and blazers.",
        sort_order: 2,
        is_active: true,
      },

      {
        name: "Trouser Fabrics",
        slug: "trouser-fabrics",
        description:
          "Premium fabrics suitable for trousers and chinos.",
        sort_order: 3,
        is_active: true,
      },

      {
        name: "Kurta Fabrics",
        slug: "kurta-fabrics",
        description:
          "Traditional cotton and linen fabrics for kurtas.",
        sort_order: 4,
        is_active: true,
      },

      {
        name: "Sherwani Fabrics",
        slug: "sherwani-fabrics",
        description:
          "Luxury fabrics specially crafted for sherwanis.",
        sort_order: 5,
        is_active: true,
      },

      {
        name: "Blazer Fabrics",
        slug: "blazer-fabrics",
        description:
          "Elegant blazer and coat fabrics.",
        sort_order: 6,
        is_active: true,
      },

      {
        name: "Waistcoat Fabrics",
        slug: "waistcoat-fabrics",
        description:
          "Designer fabrics for waistcoats.",
        sort_order: 7,
        is_active: true,
      },

      {
        name: "Traditional Wear",
        slug: "traditional-wear",
        description:
          "Ethnic and festive wear fabrics.",
        sort_order: 8,
        is_active: true,
      },
    ]);

    console.log("✅ Categories Added");

    // =========================================================
    // FABRIC TYPES
    // =========================================================

    console.log("Seeding Fabric Types...");

    const fabrics = await FabricType.insertMany([
      {
        name: "Cotton",
        slug: "cotton",
        description: "Soft breathable natural cotton."
      },

      {
        name: "Linen",
        slug: "linen",
        description: "Premium lightweight linen."
      },

      {
        name: "Silk",
        slug: "silk",
        description: "Luxury silk fabric."
      },

      {
        name: "Wool",
        slug: "wool",
        description: "Premium wool fabric."
      },

      {
        name: "Khadi",
        slug: "khadi",
        description: "Handwoven khadi fabric."
      },

      {
        name: "Denim",
        slug: "denim",
        description: "Heavy denim material."
      },

      {
        name: "Polyester Blend",
        slug: "polyester-blend",
        description: "Wrinkle resistant blend."
      },

      {
        name: "Velvet",
        slug: "velvet",
        description: "Luxury velvet fabric."
      },

      {
        name: "Tweed",
        slug: "tweed",
        description: "Premium tweed suitable for blazers."
      },
    ]);

    console.log("✅ Fabric Types Added");

    // =========================================================
    // PRODUCTS
    // =========================================================

    console.log("Seeding Products...");

    await Product.insertMany([{
      category_id: categories[0]._id,
      fabric_type_id: fabrics[0]._id,

      name: "Premium White Cotton Shirting Fabric",
      slug: "premium-white-cotton-shirting-fabric",

      sku: "SHIRT-001",

      short_description: "Soft premium cotton shirt fabric.",

      description:
        "100% premium cotton fabric suitable for formal shirts, office wear, uniforms and daily wear. Breathable and skin friendly.",

      price: 499,
      sale_price: 429,
      cost_price: 320,

      stock: 120,

      low_stock_alert: 15,

      weight: 0.45,

      unit: "meter",

      product_type: "fabric_meter",

      is_active: true,

      is_featured: true,

      is_custom_available: true,

      is_wholesale_available: true,

      wholesale_min_qty: 20,

      wholesale_price: 380,

      thumbnail:
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",

      tags: [
        "cotton",
        "white",
        "formal",
        "premium",
        "shirt"
      ],

      meta_title:
        "Premium White Cotton Shirt Fabric",

      meta_description:
        "Premium breathable white cotton shirt fabric.",

      images: [
        {
          image_path:
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
          sort_order: 2
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "White",
          color_hex: "#FFFFFF",
          sku: "SHIRT001-W",
          price: 429,
          stock: 50
        },
        {
          color: "Ivory",
          color_hex: "#FFFFF0",
          sku: "SHIRT001-I",
          price: 439,
          stock: 40
        }
      ]
    },

    {
      category_id: categories[0]._id,
      fabric_type_id: fabrics[1]._id,

      name: "Sky Blue Linen Shirting Fabric",

      slug: "sky-blue-linen-shirting-fabric",

      sku: "SHIRT-002",

      short_description:
        "Premium linen shirt fabric.",

      description:
        "Elegant linen fabric designed for premium shirts. Comfortable during summers and perfect for office wear.",

      price: 799,

      sale_price: 699,

      cost_price: 560,

      stock: 90,

      low_stock_alert: 10,

      weight: 0.40,

      unit: "meter",

      product_type: "fabric_meter",

      is_featured: true,

      is_active: true,

      is_custom_available: true,

      is_wholesale_available: true,

      wholesale_min_qty: 15,

      wholesale_price: 620,

      thumbnail:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",

      tags: [
        "linen",
        "summer",
        "shirt",
        "premium"
      ],

      meta_title:
        "Sky Blue Linen Shirt Fabric",

      meta_description:
        "Premium linen fabric for tailored shirts.",

      images: [
        {
          image_path:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
          sort_order: 2
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Sky Blue",
          color_hex: "#87CEEB",
          sku: "SHIRT002-SB",
          price: 699,
          stock: 30
        },
        {
          color: "Navy",
          color_hex: "#000080",
          sku: "SHIRT002-N",
          price: 719,
          stock: 35
        }
      ]
    },

    {
      category_id: categories[1]._id,
      fabric_type_id: fabrics[3]._id,

      name: "Charcoal Wool Suiting Fabric",

      slug: "charcoal-wool-suiting-fabric",

      sku: "SUIT-001",

      short_description:
        "Luxury wool suit fabric.",

      description:
        "Premium wool suiting fabric suitable for business suits, tuxedos and luxury blazers.",

      price: 1599,

      sale_price: 1399,

      cost_price: 1100,

      stock: 65,

      low_stock_alert: 10,

      weight: 0.70,

      unit: "meter",

      product_type: "fabric_meter",

      is_active: true,

      is_featured: true,

      is_custom_available: true,

      is_wholesale_available: true,

      wholesale_min_qty: 10,

      wholesale_price: 1250,

      thumbnail:
        "https://images.unsplash.com/photo-1593032465171-8bdc0c31d0f4",

      tags: [
        "wool",
        "suit",
        "formal",
        "premium"
      ],

      meta_title:
        "Charcoal Wool Suit Fabric",

      meta_description:
        "Luxury charcoal wool fabric for suits.",

      images: [
        {
          image_path:
            "https://images.unsplash.com/photo-1593032465171-8bdc0c31d0f4",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
          sort_order: 2
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Charcoal",
          color_hex: "#36454F",
          sku: "SUIT001-C",
          price: 1399,
          stock: 25
        },
        {
          color: "Black",
          color_hex: "#000000",
          sku: "SUIT001-B",
          price: 1450,
          stock: 25
        }
      ]
    },

    {
      category_id: categories[2]._id,
      fabric_type_id: fabrics[0]._id,

      name: "Classic Beige Trouser Fabric",

      slug: "classic-beige-trouser-fabric",

      sku: "TRS-001",

      short_description:
        "Premium cotton trouser fabric.",

      description:
        "Soft stretchable cotton fabric perfect for trousers, chinos and office wear.",

      price: 699,

      sale_price: 599,

      cost_price: 470,

      stock: 150,

      low_stock_alert: 20,

      weight: 0.50,

      unit: "meter",

      product_type: "fabric_meter",

      is_featured: false,

      is_active: true,

      is_custom_available: true,

      is_wholesale_available: true,

      wholesale_min_qty: 20,

      wholesale_price: 540,

      thumbnail:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a",

      tags: [
        "trouser",
        "cotton",
        "office",
        "beige"
      ],

      meta_title:
        "Classic Beige Trouser Fabric",

      meta_description:
        "Premium beige trouser fabric.",

      images: [
        {
          image_path:
            "https://images.unsplash.com/photo-1473966968600-fa801b869a1a",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
          sort_order: 2
        },
        {
          image_path:
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Beige",
          color_hex: "#F5F5DC",
          sku: "TRS001-BE",
          price: 599,
          stock: 60
        },
        {
          color: "Khaki",
          color_hex: "#C3B091",
          sku: "TRS001-KH",
          price: 619,
          stock: 50
        }
      ]
    }, {
      category_id: categories[1]._id,
      fabric_type_id: fabrics[3]._id,

      name: "Navy Blue Wool Suiting Fabric",
      slug: "navy-blue-wool-suiting-fabric",

      sku: "SUIT-002",

      short_description: "Premium navy blue wool suiting fabric.",

      description:
        "Fine quality Australian wool suiting fabric ideal for business suits, wedding suits and premium blazers.",

      price: 1699,
      sale_price: 1499,
      cost_price: 1180,

      stock: 75,
      low_stock_alert: 10,

      weight: 0.72,
      unit: "meter",

      product_type: "fabric_meter",

      is_active: true,
      is_featured: true,
      is_custom_available: true,
      is_wholesale_available: true,

      wholesale_min_qty: 10,
      wholesale_price: 1320,

      thumbnail: "/uploads/products/navy-suiting.jpg",

      tags: [
        "navy",
        "suiting",
        "formal",
        "wedding",
        "premium"
      ],

      meta_title: "Navy Blue Wool Suit Fabric",
      meta_description: "Premium navy wool suiting material.",

      images: [
        {
          image_path: "/uploads/products/navy-suiting-1.jpg",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path: "/uploads/products/navy-suiting-2.jpg",
          sort_order: 2
        },
        {
          image_path: "/uploads/products/navy-suiting-3.jpg",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Navy Blue",
          color_hex: "#000080",
          sku: "SUIT002-NB",
          price: 1499,
          stock: 35
        },
        {
          color: "Royal Blue",
          color_hex: "#4169E1",
          sku: "SUIT002-RB",
          price: 1549,
          stock: 30
        }
      ]
    },

    {
      category_id: categories[3]._id,
      fabric_type_id: fabrics[4]._id,

      name: "Premium Khadi Kurta Fabric",

      slug: "premium-khadi-kurta-fabric",

      sku: "KURTA-001",

      short_description:
        "Handwoven khadi fabric for premium kurtas.",

      description:
        "Soft handcrafted khadi fabric perfect for traditional kurtas, festive wear and daily ethnic clothing.",

      price: 699,
      sale_price: 599,
      cost_price: 430,

      stock: 140,

      low_stock_alert: 20,

      weight: 0.50,

      unit: "meter",

      product_type: "fabric_meter",

      is_featured: true,

      is_active: true,

      is_custom_available: true,

      is_wholesale_available: true,

      wholesale_min_qty: 20,

      wholesale_price: 540,

      thumbnail: "/uploads/products/khadi-kurta.jpg",

      tags: [
        "khadi",
        "kurta",
        "ethnic",
        "cotton",
        "festival"
      ],

      meta_title: "Premium Khadi Kurta Fabric",

      meta_description:
        "Authentic handwoven khadi kurta material.",

      images: [
        {
          image_path: "/uploads/products/khadi-kurta-1.jpg",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path: "/uploads/products/khadi-kurta-2.jpg",
          sort_order: 2
        },
        {
          image_path: "/uploads/products/khadi-kurta-3.jpg",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Natural White",
          color_hex: "#FAF9F6",
          sku: "KURTA001-W",
          price: 599,
          stock: 50
        },
        {
          color: "Olive Green",
          color_hex: "#556B2F",
          sku: "KURTA001-O",
          price: 619,
          stock: 45
        }
      ]
    },

    {
      category_id: categories[4]._id,
      fabric_type_id: fabrics[7]._id,

      name: "Royal Velvet Sherwani Fabric",

      slug: "royal-velvet-sherwani-fabric",

      sku: "SHER-001",

      short_description:
        "Luxury velvet fabric for sherwanis.",

      description:
        "Premium velvet material suitable for wedding sherwanis, designer jackets and festive ethnic wear.",

      price: 2499,

      sale_price: 2199,

      cost_price: 1800,

      stock: 40,

      low_stock_alert: 8,

      weight: 0.90,

      unit: "meter",

      product_type: "fabric_meter",

      is_featured: true,

      is_active: true,

      is_custom_available: true,

      is_wholesale_available: true,

      wholesale_min_qty: 5,

      wholesale_price: 1990,

      thumbnail: "/uploads/products/velvet-sherwani.jpg",

      tags: [
        "velvet",
        "sherwani",
        "royal",
        "wedding",
        "luxury"
      ],

      meta_title:
        "Royal Velvet Sherwani Fabric",

      meta_description:
        "Luxury velvet fabric for designer sherwanis.",

      images: [
        {
          image_path: "/uploads/products/velvet-sherwani-1.jpg",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path: "/uploads/products/velvet-sherwani-2.jpg",
          sort_order: 2
        },
        {
          image_path: "/uploads/products/velvet-sherwani-3.jpg",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Maroon",
          color_hex: "#800000",
          sku: "SHER001-M",
          price: 2199,
          stock: 20
        },
        {
          color: "Wine",
          color_hex: "#722F37",
          sku: "SHER001-W",
          price: 2249,
          stock: 15
        }
      ]
    }, {
      category_id: categories[5]._id,
      fabric_type_id: fabrics[8]._id,

      name: "Grey Tweed Blazer Fabric",
      slug: "grey-tweed-blazer-fabric",

      sku: "BLZ-001",

      short_description:
        "Premium tweed fabric for stylish blazers.",

      description:
        "High quality tweed fabric designed for premium blazers, jackets and winter coats. Durable, warm and wrinkle resistant.",

      price: 1899,
      sale_price: 1699,
      cost_price: 1400,

      stock: 45,
      low_stock_alert: 8,

      weight: 0.82,
      unit: "meter",

      product_type: "fabric_meter",

      is_active: true,
      is_featured: true,
      is_custom_available: true,
      is_wholesale_available: true,

      wholesale_min_qty: 8,
      wholesale_price: 1540,

      thumbnail: "/uploads/products/grey-tweed.jpg",

      tags: [
        "tweed",
        "grey",
        "blazer",
        "winter",
        "premium"
      ],

      meta_title: "Grey Tweed Blazer Fabric",

      meta_description:
        "Luxury tweed fabric for winter blazers.",

      images: [
        {
          image_path: "/uploads/products/grey-tweed-1.jpg",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path: "/uploads/products/grey-tweed-2.jpg",
          sort_order: 2
        },
        {
          image_path: "/uploads/products/grey-tweed-3.jpg",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Grey",
          color_hex: "#808080",
          sku: "BLZ001-G",
          price: 1699,
          stock: 18
        },
        {
          color: "Dark Grey",
          color_hex: "#505050",
          sku: "BLZ001-DG",
          price: 1749,
          stock: 20
        }
      ]
    },

    {
      category_id: categories[6]._id,
      fabric_type_id: fabrics[0]._id,

      name: "Black Waistcoat Fabric",

      slug: "black-waistcoat-fabric",

      sku: "WST-001",

      short_description:
        "Premium cotton waistcoat fabric.",

      description:
        "Smooth cotton blend fabric ideal for tailored waistcoats, formal occasions and business attire.",

      price: 799,
      sale_price: 699,
      cost_price: 560,

      stock: 95,
      low_stock_alert: 15,

      weight: 0.45,
      unit: "meter",

      product_type: "fabric_meter",

      is_active: true,
      is_featured: false,
      is_custom_available: true,
      is_wholesale_available: true,

      wholesale_min_qty: 15,
      wholesale_price: 630,

      thumbnail: "/uploads/products/waistcoat-black.jpg",

      tags: [
        "waistcoat",
        "black",
        "formal",
        "cotton"
      ],

      meta_title: "Black Waistcoat Fabric",

      meta_description:
        "Premium black waistcoat material.",

      images: [
        {
          image_path: "/uploads/products/waistcoat-black-1.jpg",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path: "/uploads/products/waistcoat-black-2.jpg",
          sort_order: 2
        },
        {
          image_path: "/uploads/products/waistcoat-black-3.jpg",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Black",
          color_hex: "#000000",
          sku: "WST001-B",
          price: 699,
          stock: 35
        },
        {
          color: "Charcoal",
          color_hex: "#36454F",
          sku: "WST001-C",
          price: 719,
          stock: 30
        }
      ]
    },

    {
      category_id: categories[0]._id,
      fabric_type_id: fabrics[1]._id,

      name: "Italian Linen Shirt Fabric",

      slug: "italian-linen-shirt-fabric",

      sku: "SHIRT-003",

      short_description:
        "Imported Italian linen fabric.",

      description:
        "Premium imported linen suitable for luxury shirts, resort wear and summer clothing.",

      price: 999,
      sale_price: 899,
      cost_price: 710,

      stock: 70,
      low_stock_alert: 10,

      weight: 0.40,
      unit: "meter",

      product_type: "fabric_meter",

      is_featured: true,
      is_active: true,
      is_custom_available: true,
      is_wholesale_available: true,

      wholesale_min_qty: 12,
      wholesale_price: 820,

      thumbnail: "/uploads/products/italian-linen.jpg",

      tags: [
        "linen",
        "italian",
        "shirt",
        "summer",
        "premium"
      ],

      meta_title:
        "Italian Linen Shirt Fabric",

      meta_description:
        "Luxury imported linen shirt material.",

      images: [
        {
          image_path: "/uploads/products/italian-linen-1.jpg",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path: "/uploads/products/italian-linen-2.jpg",
          sort_order: 2
        },
        {
          image_path: "/uploads/products/italian-linen-3.jpg",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "White",
          color_hex: "#FFFFFF",
          sku: "SHIRT003-W",
          price: 899,
          stock: 30
        },
        {
          color: "Light Blue",
          color_hex: "#ADD8E6",
          sku: "SHIRT003-LB",
          price: 929,
          stock: 25
        }
      ]
    },

    {
      category_id: categories[3]._id,
      fabric_type_id: fabrics[2]._id,

      name: "Premium Silk Kurta Fabric",

      slug: "premium-silk-kurta-fabric",

      sku: "KURTA-002",

      short_description:
        "Luxury silk fabric for festive kurtas.",

      description:
        "Rich silk fabric with a soft finish, ideal for wedding kurtas, festive wear and premium ethnic outfits.",

      price: 1499,
      sale_price: 1299,
      cost_price: 1020,

      stock: 55,
      low_stock_alert: 8,

      weight: 0.48,
      unit: "meter",

      product_type: "fabric_meter",

      is_featured: true,
      is_active: true,
      is_custom_available: true,
      is_wholesale_available: true,

      wholesale_min_qty: 10,
      wholesale_price: 1180,

      thumbnail: "/uploads/products/silk-kurta.jpg",

      tags: [
        "silk",
        "kurta",
        "festival",
        "luxury",
        "ethnic"
      ],

      meta_title:
        "Premium Silk Kurta Fabric",

      meta_description:
        "Luxury silk material for designer kurtas.",

      images: [
        {
          image_path: "/uploads/products/silk-kurta-1.jpg",
          is_primary: true,
          sort_order: 1
        },
        {
          image_path: "/uploads/products/silk-kurta-2.jpg",
          sort_order: 2
        },
        {
          image_path: "/uploads/products/silk-kurta-3.jpg",
          sort_order: 3
        }
      ],

      variants: [
        {
          color: "Cream",
          color_hex: "#FFFDD0",
          sku: "KURTA002-C",
          price: 1299,
          stock: 22
        },
        {
          color: "Gold",
          color_hex: "#FFD700",
          sku: "KURTA002-G",
          price: 1349,
          stock: 20
        }
      ]
    },]);

    console.log("✅ Products Added");

    // =========================================================
    // BANNERS
    // =========================================================

    console.log("Seeding Banners...");

    await Banner.insertMany([
      {
        title: "Premium Summer Collection",
        subtitle: "Lightweight Linen & Cotton",
        description:
          "Explore our latest summer fabrics for shirts, kurtas and trousers.",
        image: "/uploads/banners/banner1.jpg",
        button_text: "Shop Now",
        link: "/products",
        position: "hero",
        sort_order: 1,
        is_active: true
      },

      {
        title: "Wedding Collection",
        subtitle: "Luxury Sherwani Fabrics",
        description:
          "Premium velvet, silk and jacquard fabrics for weddings.",
        image: "/uploads/banners/banner2.jpg",
        button_text: "Explore",
        link: "/products",
        position: "hero",
        sort_order: 2,
        is_active: true
      },

      {
        title: "Book Free Measurement",
        subtitle: "Perfect Fit Guaranteed",
        description:
          "Schedule your measurement with our expert tailors.",
        image: "/uploads/banners/banner3.jpg",
        button_text: "Book Appointment",
        link: "/appointments",
        position: "banner",
        sort_order: 3,
        is_active: true
      },

      {
        title: "Wholesale Orders",
        subtitle: "Bulk Discounts Available",
        description:
          "Special pricing for boutiques and garment manufacturers.",
        image: "/uploads/banners/banner4.jpg",
        button_text: "Contact Us",
        link: "/wholesale",
        position: "sidebar",
        sort_order: 4,
        is_active: true
      },

      {
        title: "Custom Tailoring",
        subtitle: "Designed For You",
        description:
          "Choose fabric, measurements and style in one place.",
        image: "/uploads/banners/banner5.jpg",
        button_text: "Customize",
        link: "/custom-orders",
        position: "popup",
        sort_order: 5,
        is_active: true
      }
    ]);

    console.log("✅ Banners Added");
    console.log("Seeding Settings...");

    await Setting.insertMany([
      {
        key: "store_name",
        value: "KhadiCraft",
        group: "general"
      },

      {
        key: "store_email",
        value: "info@khadicraft.com",
        group: "general"
      },

      {
        key: "store_phone",
        value: "+91 9999999999",
        group: "general"
      },

      {
        key: "currency",
        value: "INR",
        group: "general"
      },

      {
        key: "currency_symbol",
        value: "₹",
        group: "general"
      },

      {
        key: "tax_percentage",
        value: 18,
        group: "general"
      },

      {
        key: "free_shipping_limit",
        value: 999,
        group: "shipping"
      },

      {
        key: "delivery_charge",
        value: 99,
        group: "shipping"
      },

      {
        key: "company_address",
        value: "Ludhiana, Punjab, India",
        group: "general"
      },

      {
        key: "support_email",
        value: "support@khadicraft.com",
        group: "general"
      }
    ]);

    console.log("✅ Settings Added");
    console.log("🎉 Database Seeded Successfully!");
    process.exit(0);

  } catch (err) {

    console.error(err);

    process.exit(1);

  }
};

connectDB().then(seedData);
