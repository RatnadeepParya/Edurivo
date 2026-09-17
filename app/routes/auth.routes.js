const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { validate } = require('../middleware/validation.middleware');
const { loginSchema, forgotPasswordSchema } = require('../validators/auth.validator');

router.get('/login', authController.renderLogin);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

router.get('/forgot-password', authController.renderForgotPassword);

module.exports = router;
