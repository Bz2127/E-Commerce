const { body } = require("express-validator");

/* =================================
   CUSTOMER REGISTER
================================= */

exports.registerValidator = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required"),

  body("phone")
    .trim()
    .isLength({ min: 9, max: 15 })
    .withMessage("Valid phone number required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")

];


/* =================================
   SELLER REGISTER
================================= */

exports.registerSellerValidator = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email required"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("business_name")
    .trim()
    .notEmpty()
    .withMessage("Business name required"),

  body("business_license")
    .trim()
    .notEmpty()
    .withMessage("License number required")

];

/* =================================
   LOGIN
================================= */

exports.loginValidator = [

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .notEmpty()
    .withMessage("Password required")

];


/* =================================
   VERIFY OTP
================================= */

exports.verifyOTPValidator = [

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("otp")
    .isLength({ min: 4, max: 6 })
    .withMessage("Invalid OTP")

];


/* =================================
   FORGOT PASSWORD
================================= */

exports.forgotPasswordValidator = [

  body("email")
    .isEmail()
    .withMessage("Valid email required")

];


/* =================================
   RESET PASSWORD
================================= */

exports.resetPasswordValidator = [

  body("token")
    .notEmpty()
    .withMessage("Reset token required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")

];


/* =================================
   PROFILE UPDATE
================================= */

exports.updateProfileValidator = [

  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("phone")
    .optional()
    .isLength({ min: 9 })
    .withMessage("Phone number invalid"),

  body("address")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Address too short")

];