// src/controllers/product.controller.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const FabricType = require('../models/FabricType');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');

// ─── LIST PRODUCTS ───────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const query = { is_active: true, deleted_at: null };

    // Search
    if (req.query.search) {
      const s = req.query.search;
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { sku:  { $regex: s, $options: 'i' } },
      ];
    }

    if (req.query.category)     query.category_id = req.query.category;
    if (req.query.fabric_type)  query.fabric_type_id = req.query.fabric_type;
    if (req.query.min_price)    query.price = { ...query.price, $gte: parseFloat(req.query.min_price) };
    if (req.query.max_price)    query.price = { ...query.price, $lte: parseFloat(req.query.max_price) };
    if (req.query.in_stock)     query.stock = { $gt: 0 };
    if (req.query.featured === '1' || req.query.featured === 'true') query.is_featured = true;

    // Sort
    const sortMap = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      popular:    { views: -1 },
    };
    const sort = sortMap[req.query.sort] || { createdAt: -1 };

    // Limit (for homepage featured section)
    if (req.query.limit) {
      const products = await Product.find(query)
        .populate('category_id', 'name slug')
        .populate('fabric_type_id', 'name')
        .sort(sort)
        .limit(parseInt(req.query.limit));
      return res.json({ success: true, data: products });
    }

    // Paginate
    const page    = parseInt(req.query.page) || 1;
    const perPage = Math.min(parseInt(req.query.per_page) || 16, 100);
    const skip    = (page - 1) * perPage;
    const total   = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category_id', 'name slug')
      .populate('fabric_type_id', 'name')
      .sort(sort)
      .skip(skip)
      .limit(perPage);

    return res.json({
      success: true,
      data: {
        data: products,
        current_page: page,
        per_page: perPage,
        total,
        last_page: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SHOW PRODUCT ────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, is_active: true, deleted_at: null })
      .populate('category_id', 'name slug')
      .populate('fabric_type_id', 'name');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Increment views
    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

    // Related products
    const related = await Product.find({
      category_id: product.category_id,
      _id: { $ne: product._id },
      is_active: true,
      deleted_at: null,
    }).limit(4);

    return res.json({ success: true, data: product, related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CATEGORIES ──────────────────────────────────────────
exports.categories = async (req, res) => {
  try {
    const cats = await Category.find({ parent_id: null, is_active: true })
      .populate('children')
      .sort({ sort_order: 1 });
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CATEGORY PRODUCTS ───────────────────────────────────
exports.categoryProducts = async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug, is_active: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    const children = await Category.find({ parent_id: cat._id });
    const allIds = [cat._id, ...children.map(c => c._id)];

    const page    = parseInt(req.query.page) || 1;
    const perPage = 16;
    const skip    = (page - 1) * perPage;
    const total   = await Product.countDocuments({ category_id: { $in: allIds }, is_active: true, deleted_at: null });

    const products = await Product.find({ category_id: { $in: allIds }, is_active: true, deleted_at: null })
      .skip(skip).limit(perPage);

    res.json({
      success: true,
      category: cat,
      data: { data: products, total, current_page: page, last_page: Math.ceil(total / perPage) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── FABRIC TYPES ────────────────────────────────────────
exports.fabricTypes = async (req, res) => {
  try {
    const types = await FabricType.find({ is_active: true });
    res.json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLIC BANNERS ──────────────────────────────────────
exports.publicBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      is_active: true,
      $or: [
        { starts_at: null, ends_at: null },
        { starts_at: { $lte: now }, ends_at: { $gte: now } },
        { starts_at: null, ends_at: { $gte: now } },
        { starts_at: { $lte: now }, ends_at: null },
      ],
    }).sort({ sort_order: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLIC SETTINGS ─────────────────────────────────────
exports.publicSettings = async (req, res) => {
  try {
    const publicKeys = [
      'site_name', 'site_tagline', 'site_phone', 'site_email', 'site_address',
      'logo', 'favicon', 'razorpay_key_id', 'free_shipping_threshold',
      'gst_number', 'social_facebook', 'social_instagram', 'social_whatsapp',
    ];
    const settings = await Setting.find({ key: { $in: publicKeys } });
    const data = {};
    settings.forEach(s => { data[s.key] = s.value; });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
