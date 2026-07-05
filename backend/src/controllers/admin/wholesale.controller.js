// src/controllers/admin/wholesale.controller.js
const WholesaleBuyer = require('../../models/WholesaleBuyer');
const WholesaleQuote = require('../../models/WholesaleQuote');

exports.buyers = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const total = await WholesaleBuyer.countDocuments(query);
    const buyers = await WholesaleBuyer.find(query).populate('user_id', 'name email phone').sort({ createdAt: -1 }).skip((page-1)*perPage).limit(perPage);
    const normalisedBuyers = buyers.map(b => {
      const obj = b.toObject();
      return { ...obj, id: obj._id.toString() };
    });
    res.json({ success: true, data: { data: normalisedBuyers, total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateBuyerStatus = async (req, res) => {
  try {
    const buyer = await WholesaleBuyer.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true });
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found.' });
    res.json({ success: true, message: 'Status updated.', data: buyer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.setDiscount = async (req, res) => {
  try {
    const buyer = await WholesaleBuyer.findByIdAndUpdate(req.params.id, { discount_percent: req.body.discount }, { new: true });
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found.' });
    res.json({ success: true, message: 'Discount set.', data: buyer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.quotes = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 20;
    const total = await WholesaleQuote.countDocuments(query);
    const quotes = await WholesaleQuote.find(query).populate('user_id', 'name email').sort({ createdAt: -1 }).skip((page-1)*perPage).limit(perPage);
    const normalisedQuotes = quotes.map(q => {
      const obj = q.toObject();
      return { ...obj, id: obj._id.toString() };
    });
    res.json({ success: true, data: { data: normalisedQuotes, total, current_page: page, last_page: Math.ceil(total/perPage) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateQuote = async (req, res) => {
  try {
    const quote = await WholesaleQuote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });
    res.json({ success: true, message: 'Quote updated.', data: quote });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.generateInvoice = async (req, res) => {
  try {
    const quote = await WholesaleQuote.findById(req.params.id).populate('user_id', 'name email phone');
    if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });
    res.json({ success: true, data: quote });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
