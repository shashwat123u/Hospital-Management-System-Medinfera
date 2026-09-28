const router = require('express').Router();
const c = require('./dashboards.controller');
const { protect } = require('../../middleware/auth');

router.get('/summary', protect, c.getSummary);

module.exports = router;
