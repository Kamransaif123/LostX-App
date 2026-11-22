const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(authMiddleware, adminOnly);

router.patch('/items/:id/recovered', adminController.markItemRecovered);
router.get('/stats', adminController.getStats);
router.get('/export/csv', adminController.exportItemsCSV);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/promote', adminController.promoteUser);
router.delete('/demo-users', adminController.deleteDemoUsers);

module.exports = router;
