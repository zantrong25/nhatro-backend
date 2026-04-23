const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, roomController.getAllRooms);
router.post('/', authMiddleware, roleMiddleware('admin'), roomController.createRoom);
router.put('/:id', authMiddleware, roleMiddleware('admin'), roomController.updateRoom);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), roomController.deleteRoom);

module.exports = router;