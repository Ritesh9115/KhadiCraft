// src/utils/slugify.js
const slugifyLib = require('slugify');
const Product = require('../models/Product');
const Category = require('../models/Category');

const toSlug = (text) => slugifyLib(text, {
  lower: true,
  strict: true,
  trim: true,
});

// Generate unique slug for products
const uniqueProductSlug = async (name, excludeId = null) => {
  let slug = toSlug(name);
  let count = 1;
  while (true) {
    const query = { slug, deleted_at: null };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Product.findOne(query);
    if (!exists) break;
    slug = `${toSlug(name)}-${count++}`;
  }
  return slug;
};

// Generate unique slug for categories
const uniqueCategorySlug = async (name, excludeId = null) => {
  let slug = toSlug(name);
  let count = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Category.findOne(query);
    if (!exists) break;
    slug = `${toSlug(name)}-${count++}`;
  }
  return slug;
};

module.exports = { toSlug, uniqueProductSlug, uniqueCategorySlug };
