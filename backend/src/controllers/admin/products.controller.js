// src/controllers/admin/products.controller.js
const Product = require('../../models/Product');
const InventoryLog = require('../../models/InventoryLog');
const { uniqueProductSlug } = require('../../utils/slugify');
const crypto = require('crypto');

// ─── LIST ────────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const query = req.query.with_deleted === 'true' ? {} : { deleted_at: null };

    if (req.query.search) {
      query.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { sku: { $regex: req.query.search, $options: 'i' } }];
    }
    if (req.query.category_id)   query.category_id = req.query.category_id;
    if (req.query.fabric_type_id) query.fabric_type_id = req.query.fabric_type_id;
    if (req.query.status === 'active')   query.is_active = true;
    if (req.query.status === 'inactive') query.is_active = false;
    if (req.query.stock === 'low')       query.$expr = { $and: [{ $lte: ['$stock', '$low_stock_alert'] }, { $gt: ['$stock', 0] }] };
    if (req.query.stock === 'out')       query.stock = 0;
    if (req.query.featured)              query.is_featured = true;
    if (req.query.type)                  query.product_type = req.query.type;

    const sort = {};
    sort[req.query.sort_by || 'createdAt'] = req.query.sort_dir === 'asc' ? 1 : -1;

    const page    = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const skip    = (page - 1) * perPage;
    const total   = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category_id', 'name slug')
      .populate('fabric_type_id', 'name')
      .sort(sort).skip(skip).limit(perPage);

    const summary = {
      total:     await Product.countDocuments({ deleted_at: null }),
      active:    await Product.countDocuments({ is_active: true, deleted_at: null }),
      inactive:  await Product.countDocuments({ is_active: false, deleted_at: null }),
      low_stock: await Product.countDocuments({ $expr: { $and: [{ $lte: ['$stock', '$low_stock_alert'] }, { $gt: ['$stock', 0] }] }, deleted_at: null }),
      out_stock: await Product.countDocuments({ stock: 0, deleted_at: null }),
    };

    res.json({ success: true, data: { data: products, total, current_page: page, last_page: Math.ceil(total / perPage) }, summary });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── CREATE ──────────────────────────────────────────────
exports.store = async (req, res) => {
  try {
    const { name, category_id, price, product_type, stock } = req.body;
    if (!name || !category_id || !price || !product_type || stock === undefined)
      return res.status(422).json({ success: false, message: 'Name, category, price, type, and stock are required.' });

    const slug = await uniqueProductSlug(name);
    const sku  = req.body.sku || crypto.randomBytes(4).toString('hex').toUpperCase();

    let thumbnail = null;
    if (req.file) thumbnail = req.file.path || req.file.secure_url || req.file.location;

    const product = await Product.create({
      category_id, fabric_type_id: req.body.fabric_type_id, name, slug, sku,
      short_description: req.body.short_description, description: req.body.description,
      price: parseFloat(price), sale_price: req.body.sale_price ? parseFloat(req.body.sale_price) : null,
      cost_price: req.body.cost_price ? parseFloat(req.body.cost_price) : null,
      stock: parseInt(stock), low_stock_alert: parseInt(req.body.low_stock_alert) || 10,
      weight: req.body.weight, unit: req.body.unit || 'piece', product_type,
      is_active: req.body.is_active !== 'false',
      is_featured: req.body.is_featured === 'true' || req.body.is_featured === true,
      is_custom_available: req.body.is_custom_available === 'true',
      is_wholesale_available: req.body.is_wholesale_available !== 'false',
      wholesale_min_qty: parseInt(req.body.wholesale_min_qty) || 10,
      wholesale_price: req.body.wholesale_price ? parseFloat(req.body.wholesale_price) : null,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : [],
      meta_title: req.body.meta_title, meta_description: req.body.meta_description, thumbnail,
    });

    if (parseInt(stock) > 0) {
      await InventoryLog.create({ product_id: product._id, type: 'stock_in', quantity: parseInt(stock), stock_before: 0, stock_after: parseInt(stock), reference_type: 'manual', notes: 'Initial stock entry', created_by: req.user._id });
    }

    const loaded = await Product.findById(product._id).populate('category_id fabric_type_id');
    res.status(201).json({ success: true, message: 'Product created successfully.', data: loaded });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── SHOW ────────────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category_id fabric_type_id');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const updateData = { ...req.body };
    if (req.body.name && req.body.name !== product.name) {
      updateData.slug = await uniqueProductSlug(req.body.name, product._id);
    }
    if (req.file) updateData.thumbnail = req.file.path || req.file.secure_url || req.file.location;

    // Parse tags — FormData sends as JSON string
    if (updateData.tags) {
      try { updateData.tags = JSON.parse(updateData.tags); } catch { updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : [updateData.tags]; }
    }

    // Coerce boolean fields — FormData sends '1'/'0' or 'true'/'false'
    ['is_active', 'is_featured', 'is_custom_available', 'is_wholesale_available'].forEach(f => {
      if (updateData[f] !== undefined) {
        updateData[f] = updateData[f] === '1' || updateData[f] === 'true' || updateData[f] === true;
      }
    });

    // Parse numeric fields
    ['price', 'sale_price', 'cost_price', 'wholesale_price', 'weight'].forEach(f => {
      if (updateData[f] !== undefined && updateData[f] !== '') updateData[f] = parseFloat(updateData[f]) || null;
    });
    ['stock', 'low_stock_alert', 'wholesale_min_qty'].forEach(f => {
      if (updateData[f] !== undefined && updateData[f] !== '') updateData[f] = parseInt(updateData[f]);
    });

    Object.assign(product, updateData);
    await product.save();

    const loaded = await Product.findById(product._id).populate('category_id fabric_type_id');
    res.json({ success: true, message: 'Product updated successfully.', data: { ...loaded.toObject(), id: loaded._id.toString() } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── DELETE (soft) ───────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.deleted_at = new Date();
    await product.save();
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── UPLOAD IMAGES ───────────────────────────────────────
exports.uploadImages = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (!req.files || req.files.length === 0) return res.status(422).json({ success: false, message: 'No images uploaded.' });

    const uploaded = req.files.map((f, idx) => ({
      image_path: f.path || f.secure_url || f.location,
      sort_order: product.images.length + idx,
      is_primary: product.images.length === 0 && idx === 0,
    }));

    product.images.push(...uploaded);
    await product.save();
    res.json({ success: true, message: 'Images uploaded.', data: uploaded });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── DELETE IMAGE ────────────────────────────────────────
exports.deleteImage = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const imgIdx = product.images.findIndex(i => i._id.toString() === req.params.imgId);
    if (imgIdx === -1) return res.status(404).json({ success: false, message: 'Image not found.' });
    product.images.splice(imgIdx, 1);
    await product.save();
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── UPDATE STOCK ────────────────────────────────────────
exports.updateStock = async (req, res) => {
  try {
    const { type, quantity, notes } = req.body;
    if (!type || !quantity) return res.status(422).json({ success: false, message: 'Type and quantity are required.' });

    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const before = product.stock;
    let after;

    if (type === 'stock_out' || type === 'damage') {
      if (product.stock < parseInt(quantity)) return res.status(400).json({ success: false, message: 'Insufficient stock.' });
      after = product.stock - parseInt(quantity);
    } else if (type === 'adjustment') {
      after = parseInt(quantity);
    } else {
      after = product.stock + parseInt(quantity);
    }

    product.stock = after;
    await product.save();

    await InventoryLog.create({ product_id: product._id, type, quantity: parseInt(quantity), stock_before: before, stock_after: after, reference_type: 'manual', notes, created_by: req.user._id });

    res.json({ success: true, message: 'Stock updated successfully.', stock: after });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── TOGGLE ──────────────────────────────────────────────
exports.toggle = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.is_active = !product.is_active;
    await product.save();
    res.json({ success: true, message: `Product ${product.is_active ? 'activated' : 'deactivated'}.`, is_active: product.is_active });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── TOGGLE FEATURED ─────────────────────────────────────
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.is_featured = !product.is_featured;
    await product.save();
    res.json({ success: true, is_featured: product.is_featured });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── BULK ACTION ─────────────────────────────────────────
exports.bulkAction = async (req, res) => {
  try {
    const { action, ids } = req.body;
    if (!action || !ids || !Array.isArray(ids))
      return res.status(422).json({ success: false, message: 'Action and IDs are required.' });

    if (action === 'delete') {
      await Product.updateMany({ _id: { $in: ids } }, { deleted_at: new Date() });
    } else {
      const updateMap = { activate: { is_active: true }, deactivate: { is_active: false }, feature: { is_featured: true }, unfeature: { is_featured: false } };
      await Product.updateMany({ _id: { $in: ids } }, updateMap[action]);
    }
    res.json({ success: true, message: 'Bulk action applied successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── ADD VARIANT ─────────────────────────────────────────
exports.addVariant = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const sku = req.body.sku || product.sku + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
    product.variants.push({ ...req.body, sku });
    await product.save();
    const variant = product.variants[product.variants.length - 1];
    res.json({ success: true, data: variant });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── UPDATE VARIANT ──────────────────────────────────────
exports.updateVariant = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const variant = product.variants.id(req.params.vid);
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found.' });
    Object.assign(variant, req.body);
    await product.save();
    res.json({ success: true, data: variant });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── DELETE VARIANT ──────────────────────────────────────
exports.deleteVariant = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const variantIdx = product.variants.findIndex(v => v._id.toString() === req.params.vid);
    if (variantIdx === -1) return res.status(404).json({ success: false, message: 'Variant not found.' });
    product.variants.splice(variantIdx, 1);
    await product.save();
    res.json({ success: true, message: 'Variant deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
