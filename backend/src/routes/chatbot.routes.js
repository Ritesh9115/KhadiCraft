// src/routes/chatbot.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/chatbot.controller');

router.post('/respond', ctrl.respond);  // Public — no auth required

module.exports = router;
