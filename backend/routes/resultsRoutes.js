const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getResults } = require('../controllers/resultsController');

router.use(protect);

router.route('/').get(getResults);

module.exports = router;

