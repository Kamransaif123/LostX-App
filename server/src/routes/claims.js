const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Submit a claim
router.post('/', authMiddleware, claimController.submitClaim);

// Get current user's claims
router.get('/mine', authMiddleware, claimController.getMyClaims);

// Admin: view all claims
router.get('/', authMiddleware, adminOnly, claimController.getClaimsAdmin);

// Cancel/Withdraw pending claim (claimant)
router.delete('/:id', authMiddleware, claimController.cancelClaim);

// Admin: approve or reject claim
router.patch('/:id', authMiddleware, adminOnly, claimController.updateClaimStatusAdmin);

module.exports = router;
