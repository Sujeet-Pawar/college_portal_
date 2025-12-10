const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAchievements } = require('../controllers/achievementsController');

router.use(protect);

router.route('/').get(getAchievements);

module.exports = router;

