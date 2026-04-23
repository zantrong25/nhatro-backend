const express = require('express');
const router = express.Router();

const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin'), invoiceController.getAllInvoices);
router.post('/', authMiddleware, roleMiddleware('admin'), invoiceController.createInvoice);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), invoiceController.updateInvoiceStatus);
router.get('/my', authMiddleware, roleMiddleware('tenant'), invoiceController.getMyInvoices);

module.exports = router;