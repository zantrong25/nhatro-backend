const express = require('express');
const router = express.Router();

const regulationController = require('../controllers/regulationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, regulationController.getAllRegulations);
router.post('/', authMiddleware, roleMiddleware('admin'), regulationController.createRegulation);
router.put('/:id', authMiddleware, roleMiddleware('admin'), regulationController.updateRegulation);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), regulationController.deleteRegulation);

module.exports = router;