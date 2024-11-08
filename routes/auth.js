const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Rate limiting for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    message: 'Too many login attempts. Please try again later.',
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);

module.exports = router;
