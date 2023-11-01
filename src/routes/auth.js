const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.getLoginPage);
router.get('/new-password', authController.getNewPasswordPage);
router.get('/forgot-password', authController.getForgotPasswordPage);
router.get('/confirm-password', authController.getConfirmPasswordPage);

router.post('/login', authController.login);
router.post('/new-password', authController.newPassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/confirm-password', authController.confirmPassword);

router.post('/logout', authController.logout);

module.exports = router;
