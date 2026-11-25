const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create item (lost/found)
router.post('/', authMiddleware, upload.single('image'), itemController.createItem);

// List items with filters and pagination (public)
router.get('/', optionalAuthMiddleware, itemController.getItems);

// Public overall stats for homepage
router.get('/stats', itemController.getPublicStats);

// Current user's reported items
router.get('/mine', authMiddleware, itemController.getMyItems);

// Single item detail
router.get('/:id', optionalAuthMiddleware, itemController.getItemById);

// Renew expired item listing
router.patch('/:id/renew', authMiddleware, itemController.renewItem);

// Update item
router.put('/:id', authMiddleware, upload.single('image'), itemController.updateItem);

// Delete item
router.delete('/:id', authMiddleware, itemController.deleteItem);

// Get suggested matches for item
router.get('/:id/matches', optionalAuthMiddleware, itemController.getItemMatches);

module.exports = router;
