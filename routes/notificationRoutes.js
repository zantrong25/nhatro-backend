const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, notificationController.getAllNotifications);
router.post('/', authMiddleware, roleMiddleware('admin'), notificationController.createNotification);
router.put('/:id', authMiddleware, roleMiddleware('admin'), notificationController.updateNotification);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), notificationController.deleteNotification);

module.exports = router;