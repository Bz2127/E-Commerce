const express = require('express');
const upload = require('../middleware/upload');

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  registerSeller,
  verifyOTP,
  resendOTP,
  refreshToken,
  changePassword
} = require('../controllers/auth.controller');

const { authenticateToken } = require('../middleware/auth');

const validate = require('../middleware/validate');

const {
  registerValidator,
  registerSellerValidator,
  loginValidator,
  verifyOTPValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator
} = require('../validators/auth.validator');

const router = express.Router();

/* ===============================
   AUTHENTICATION
================================ */

router.post(
  '/register',
  registerValidator,
  validate,
  register
);

router.post(
  '/register-seller',
  registerSellerValidator,
  validate,
  registerSeller
);

router.post(
  '/login',
  loginValidator,
  validate,
  login
);

router.post('/refresh', refreshToken);

/* ===============================
   EMAIL / OTP
================================ */

router.post(
  '/verify-otp',
  verifyOTPValidator,
  validate,
  verifyOTP
);

router.post(
  '/resend-otp',
  forgotPasswordValidator,
  validate,
  resendOTP
);

/* ===============================
   PASSWORD
================================ */

router.post(
  '/forgot-password',
  forgotPasswordValidator,
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  resetPasswordValidator,
  validate,
  resetPassword
);

router.put('/change-password', authenticateToken, changePassword);
/* ===============================
   PROFILE
================================ */

router.put(
  '/profile',
  authenticateToken,
  upload.single('profileImage'),
  updateProfileValidator,
  validate,
  updateProfile
);

module.exports = router;