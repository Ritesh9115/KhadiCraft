// src/routes/wholesale.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/wholesale.controller');
const auth = require('../middleware/auth');

router.post('/apply', ctrl.apply);  // Public — no auth
router.use(auth);
router.post('/register',       ctrl.register);
router.get('/status',          ctrl.status);
router.post('/quote-request',  ctrl.requestQuote); // Laravel: /wholesale/quote-request
router.post('/quote',          ctrl.requestQuote); // Alias
router.get('/quotes',          ctrl.myQuotes);     // Laravel: /wholesale/quotes
router.get('/my-quotes',       ctrl.myQuotes);     // Alias

module.exports = router;
