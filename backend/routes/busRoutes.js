const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBuses, getBus } = require('../controllers/busController');

router.use(protect);

router.route('/').get(getBuses);
router.route('/:id').get(getBus);

module.exports = router;

