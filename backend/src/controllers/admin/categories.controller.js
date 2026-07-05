// src/controllers/admin/categories.controller.js
const Category = require('../../models/Category');
const { uniqueCategorySlug } = require('../../utils/slugify');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const query = {};
    if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };
    const total = await Category.countDocuments(query);
    const cats = await Category.find(query).populate('children').sort({ sort_order: 1 }).skip((page-1)*perPage).limit(perPage);
    
    // Get product counts for each category
    const Product = require('../../models/Product');
    const mappedCats = await Promise.all(cats.map(async (c) => {
      const obj = c.toObject();
      const count = await Product.countDocuments({ category_id: c._id });
      return { ...obj, id: obj._id.toString(), products_count: count };
    }));

    res.json({ success: true, data: { data: mappedCats, total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.store = async (req, res) => {
  try {
    if (!req.body.name) return res.status(422).json({ success: false, message: 'Name is required.' });
    const slug = await uniqueCategorySlug(req.body.name);
    let image = null;
    if (req.file) image = req.file.path || req.file.secure_url || req.file.location;
    const cat = await Category.create({ ...req.body, slug, image });
    res.status(201).json({ success: true, message: 'Category created.', data: cat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.show = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id).populate('children');
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: cat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    if (req.body.name && req.body.name !== cat.name) req.body.slug = await uniqueCategorySlug(req.body.name, cat._id);
    if (req.file) req.body.image = req.file.path || req.file.secure_url || req.file.location;
    Object.assign(cat, req.body);
    await cat.save();
    res.json({ success: true, message: 'Category updated.', data: cat });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.destroy = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggle = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    cat.is_active = !cat.is_active;
    await cat.save();
    res.json({ success: true, message: `Category ${cat.is_active ? 'activated' : 'deactivated'}.` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      await Promise.all(items.map(({ id, sort_order }) => Category.findByIdAndUpdate(id, { sort_order })));
    }
    res.json({ success: true, message: 'Categories reordered.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
