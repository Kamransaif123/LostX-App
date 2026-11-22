const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
