const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const JWT_SECRET = process.env.JWT_SECRET || 'marketplace_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_marketplace_2024';
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";


// ======================================
// EMAIL TRANSPORTER
// ======================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ======================================
// MULTER SETUP
// ======================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const uploadPath = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  }
});


// ======================================
// OTP FUNCTION
// ======================================

const sendOTP = async (email, phone, userId) => {

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false
  });

  await pool.query(
    `INSERT INTO otps (user_id, email, phone, otp, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
     ON DUPLICATE KEY UPDATE otp = ?, expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)`,
    [userId, email, phone, otp, otp]
  );

  try {

    await transporter.sendMail({
      to: email,
      subject: 'Ethmarket Verification Code',
      html: `
        <div style="font-family: Arial; max-width:500px;margin:auto;">
          <h2 style="color:#3b82f6;">Your OTP Code</h2>

          <div style="background:#3b82f6;color:white;padding:20px;border-radius:10px;text-align:center;">
            <h1 style="margin:0;font-size:32px;">${otp}</h1>
          </div>

          <p style="color:#64748b;">Valid for 10 minutes only.</p>
        </div>
      `
    });

  } catch (err) {

    console.log('Email failed. OTP logged:', otp);

  }

  console.log(`OTP ${otp} sent to ${email}`);

  return otp;
};


// ======================================
// RESEND OTP
// ======================================

const resendOTP = async (req, res) => {

  try {

    const { email } = req.body;

    const [user] = await pool.query(
      "SELECT id,email,phone FROM users WHERE email=? AND is_verified=0",
      [email]
    );

    if (!user.length) {
      return res.status(400).json({ error: "User not found or already verified" });
    }

    await sendOTP(user[0].email, user[0].phone, user[0].id);

    res.json({ message: "OTP resent successfully" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};


// ======================================
// CUSTOMER REGISTER
// ======================================

const register = async (req, res) => {

const { name, email, phone, password, business_name, business_license } = req.body;
  try {

    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email=? OR phone=?",
      [email, phone]
    );

    if (existingUser.length) {
      return res.status(400).json({ error: "Email or phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

 const [result] = await pool.query(
`INSERT INTO users
(name,email,phone,password,role,status,is_verified)
VALUES (?, ?, ?, ?, 'customer', 'active', 0)`,
[name, email, phone, hashedPassword]
);

    await sendOTP(email, phone, result.insertId);

    res.status(201).json({
      message: "Customer registration successful!",
      user: { id: result.insertId, name, email, role: 'customer' }
    });

  } catch (err) {

    res.status(400).json({ error: err.message });

  }
};


// ======================================
// SELLER REGISTER
// ======================================

const registerSeller = async (req, res) => {

  console.log("SELLER BODY:", req.body);
 const { name, email, phone, password, business_name, business_license } = req.body;

  try {

    // Basic validation
    

    // Check if user already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE email=? OR phone=?",
      [email, phone]
    );

    if (existingUser.length) {
      return res.status(400).json({ error: "Email or phone already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert seller
const [result] = await pool.query(
  `INSERT INTO users
  (name, email, phone, password, role, business_name, business_license, status, is_approved, is_verified)
  VALUES (?, ?, ?, ?, 'seller', ?, ?, 'pending', 0, 0)`,
  [name, email, phone, hashedPassword, business_name, business_license]
);

    // Send OTP
    await sendOTP(email, phone, result.insertId);

    res.status(201).json({
      message: "Seller registration successful! Awaiting admin approval.",
      user: {
        id: result.insertId,
        name,
        email,
        role: "seller"
      }
    });

  } catch (err) {

    console.error("Seller Registration Error:", err);

    res.status(500).json({
      error: "Seller registration failed"
    });

  }
};

// ======================================
// VERIFY OTP
// ======================================

const verifyOTP = async (req, res) => {

  const { email, otp } = req.body;

  try {

    const [user] = await pool.query(
      "SELECT id FROM users WHERE email=? AND is_verified=0",
      [email]
    );

    if (!user.length) {
      return res.status(400).json({ error: "User not found or already verified" });
    }

    const [otpRecord] = await pool.query(
      "SELECT * FROM otps WHERE user_id=? AND otp=? AND expires_at>NOW()",
      [user[0].id, otp]
    );

    if (!otpRecord.length) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await pool.query(
  "UPDATE users SET is_verified=1, status = CASE WHEN role='customer' THEN 'active' ELSE 'pending' END WHERE id=?",
  [user[0].id]
);
    await pool.query(
      "DELETE FROM otps WHERE user_id=?",
      [user[0].id]
    );

    res.json({ success: true, message: "Email verified successfully!" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};


// ======================================
// LOGIN
// ======================================

const login = async (req, res) => {

  const { email, password, rememberMe = false, role } = req.body;

  try {

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Wrong password" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: "Verify email first" });
    }

    if (user.role === 'seller' && user.status !== 'active') {
  return res.status(403).json({ error: "Seller awaiting admin approval" });
}

    if (role && user.role !== role) {
      return res.status(403).json({ error: "Invalid login portal for role" });
    }

// Inside your login function...
const token = jwt.sign(
  { 
    id: user.id, 
    role: user.role, 
    email: user.email, 
    name: user.name,
    is_approved: user.is_approved 
  },
  JWT_SECRET,
  { expiresIn: rememberMe ? '30d' : '7d' }
);

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: rememberMe ? '60d' : '14d' }
    );

    const { password: _, ...safeUser } = user;

    if (safeUser.profile_pic) {
      safeUser.profile_pic =
        `${BASE_URL}/uploads/${path.basename(safeUser.profile_pic)}`;
    }

    res.json({
      token,
      refreshToken,
      user: safeUser
    });

  } catch (err) {

    res.status(500).json({ error: "Login failed" });

  }
};


// ======================================
// REFRESH TOKEN
// ======================================

const refreshTokenFunc = async (req, res) => {

  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const [user] = await pool.query(
      "SELECT id,name,email,role FROM users WHERE id=?",
      [decoded.id]
    );

    if (!user.length) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const newToken = jwt.sign(
      {
        id: user[0].id,
        role: user[0].role,
        email: user[0].email,
        name: user[0].name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token: newToken });

  } catch {

    res.status(401).json({ error: "Invalid refresh token" });

  }
};


// ======================================
// FORGOT PASSWORD
// ======================================

const forgotPassword = async (req, res) => {

  const { email } = req.body;

  try {

    const [user] = await pool.query(
      "SELECT id,name FROM users WHERE email=?",
      [email]
    );

    if (!user.length) {
      return res.json({ message: "If account exists, reset instructions sent." });
    }

    const resetToken = jwt.sign(
      { id: user[0].id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log(`Reset link for ${user[0].name}: ${resetLink}`);

    res.json({ message: "Reset instructions sent." });

  } catch {

    res.status(500).json({ error: "Server error" });

  }
};


// ======================================
// RESET PASSWORD
// ======================================

const resetPassword = async (req, res) => {

  try {

    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, JWT_SECRET);

    const hashed = await bcrypt.hash(newPassword, 12);

    await pool.query(
      "UPDATE users SET password=? WHERE id=?",
      [hashed, decoded.id]
    );

    res.json({ success: true, message: "Password updated" });

  } catch {

    res.status(400).json({ error: "Invalid or expired reset link" });

  }
};


// ======================================
// UPDATE PROFILE
// ======================================

const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const userId = req.user.id;
        let profilePic = req.file ? req.file.path : null;

        let query = "UPDATE users SET name = ?, phone = ?, address = ?";
        let params = [name, phone, address];

        if (profilePic) {
            query += ", profile_pic = ?";
            params.push(profilePic);
        }

        query += " WHERE id = ?";
        params.push(userId);

        await pool.execute(query, params);

        const [updatedUser] = await pool.execute(
            "SELECT id, name, email, phone, address, profile_pic, role FROM users WHERE id = ?", 
            [userId]
        );

        res.json({ success: true, user: updatedUser[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [users] = await pool.execute("SELECT password FROM users WHERE id = ?", [userId]);
        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        
        if (!isMatch) return res.status(400).json({ message: "Wrong current password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
        res.json({ success: true, message: "Password updated" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
// ======================================
// EXPORTS
// ======================================

module.exports = {
  register,
  registerSeller,
  verifyOTP,
  resendOTP,
  login,
  refreshToken: refreshTokenFunc,
  forgotPassword,
  resetPassword,
  updateProfile,
  sendOTP,
  changePassword
};