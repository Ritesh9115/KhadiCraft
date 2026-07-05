// src/controllers/admin/inventory.controller.js
const Product = require('../../models/Product');
const InventoryLog = require('../../models/InventoryLog');

exports.index = async (req, res) => {
  try {
    const query = { deleted_at: null };
    if (req.query.search) query.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { sku: { $regex: req.query.search, $options: 'i' } }];
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .select('name sku stock low_stock_alert is_active thumbnail price cost_price category_id')
      .populate('category_id', 'name')
      .sort({ stock: 1 }).skip((page-1)*perPage).limit(perPage);
    
    // Map _id -> id
    const mapped = products.map(p => { const o = p.toObject(); return { ...o, id: o._id.toString(), category: o.category_id }; });
    res.json({ success: true, data: { data: mapped, total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.lowStock = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $and: [{ $lte: ['$stock', '$low_stock_alert'] }, { $gt: ['$stock', 0] }] }, deleted_at: null })
      .select('name sku stock low_stock_alert thumbnail price cost_price category_id')
      .populate('category_id', 'name');
      
    const mapped = products.map(p => { const o = p.toObject(); return { ...o, id: o._id.toString(), category: o.category_id }; });
    res.json({ success: true, data: mapped });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.adjust = async (req, res) => {
  try {
    const { product_id, type, quantity, notes } = req.body;
    if (!product_id || !type || !quantity) return res.status(422).json({ success: false, message: 'Product ID, type and quantity are required.' });

    const product = await Product.findOne({ _id: product_id, deleted_at: null });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const before = product.stock;
    let after;
    if (type === 'stock_out' || type === 'damage') after = Math.max(0, product.stock - parseInt(quantity));
    else if (type === 'adjustment') after = parseInt(quantity);
    else after = product.stock + parseInt(quantity);

    product.stock = after;
    await product.save();

    await InventoryLog.create({ product_id, type, quantity: parseInt(quantity), stock_before: before, stock_after: after, reference_type: 'manual', notes, created_by: req.user._id });

    res.json({ success: true, message: 'Stock adjusted.', stock: after });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.logs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const total = await InventoryLog.countDocuments();
    const logs = await InventoryLog.find()
      .populate('product_id', 'name sku')
      .populate('created_by', 'name')
      .sort({ createdAt: -1 }).skip((page-1)*perPage).limit(perPage);

    // Normalise for frontend
    const normalised = logs.map(l => {
      const obj = l.toObject();
      return {
        ...obj,
        id: obj._id?.toString(),
        created_at: obj.createdAt,
        product: obj.product_id, // frontend uses log.product?.name
      };
    });

    res.json({ success: true, data: { data: normalised, total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.productLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find({ product_id: req.params.productId }).populate('created_by', 'name').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: logs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
