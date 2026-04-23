const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/my-profile', authMiddleware, userController.getMyProfile);
router.put('/my-profile', authMiddleware, userController.updateMyProfile);
router.get('/my-room', authMiddleware, roleMiddleware('tenant'), userController.getMyRoom);

module.exports = router;