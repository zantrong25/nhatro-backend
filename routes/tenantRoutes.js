const express = require('express');
const router = express.Router();

const tenantController = require('../controllers/tenantController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin'), tenantController.getAllTenants);
router.post('/', authMiddleware, roleMiddleware('admin'), tenantController.createTenant);
router.put('/:id', authMiddleware, roleMiddleware('admin'), tenantController.updateTenant);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), tenantController.deleteTenant);

module.exports = router;