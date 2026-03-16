require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const { connectDB, pool } = require('./config/db');
const compression = require('compression');
const brandRoutes = require('./routes/brand.routes');
const updateSellerBalance = require('./utils/updateSellerBalance');


const app = express();

// ======================================================
// TRUST PROXY (FIX FOR RATE LIMIT ERROR)
// ======================================================

app.set('trust proxy', 1);

// ======================================================
// ROUTES IMPORTS
// ======================================================

// EXISTING ROUTES
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const sellerRoutes = require('./routes/seller.routes');
const adminRoutes = require('./routes/admin.routes');

// CUSTOMER FEATURES
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const reviewRoutes = require('./routes/review.routes');

// MARKETPLACE FEATURES
const categoryRoutes = require('./routes/category.routes');
const searchRoutes = require('./routes/search.routes');

// SHIPPING & LOGISTICS
const shippingRoutes = require('./routes/shipping.routes');

// NOTIFICATIONS
const notificationRoutes = require('./routes/notification.routes');
//
const reportRoutes = require('./routes/report.routes');

//
const attributeRoutes = require('./routes/attribute.routes');
//
const paymentRoutes = require("./routes/payment.routes");
const bannerRoutes = require("./routes/banner.routes");
//
// ======================================================
// CREATE UPLOADS DIRECTORY
// ======================================================

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Uploads folder created');
}

// ======================================================
// SECURITY MIDDLEWARE (CORRECTED CSP)
// ======================================================

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http://localhost:5000"],
            connectSrc: [
  "'self'",
  "http://localhost:5000",
  "http://localhost:5173",
  "http://localhost:3000",
  "https:"
],
            scriptSrc: ["'self'"]
        }
    }
}));
//
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// ======================================================
// REQUEST LOGGING
// ======================================================

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));

//
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ======================================================
// RATE LIMITING
// ======================================================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests. Try again later.'
    }
});


app.use('/api/auth', limiter);
app.use('/api/orders', limiter);


//

// ======================================================
// CORS CONFIG
// ======================================================


// ======================================================
// CHAPA PAYMENT WEBHOOK (RAW BODY REQUIRED)
// ======================================================

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const payload = JSON.parse(req.body.toString());

        console.log('💳 Chapa webhook received:', payload);

        const tx_ref = payload.tx_ref;
        const status = payload.status;

        if (status === 'success') {
            // 🔥 CORRECTED PART: Use the utility instead of a manual SQL update
            // This handles the wallet balance, commissions, and order status in one transaction.
            const walletUpdated = await updateSellerBalance(tx_ref);

            if (walletUpdated) {
                console.log(`✅ Payment confirmed & Wallet updated for ${tx_ref}`);
            } else {
                console.log(`⚠️ Payment received for ${tx_ref}, but wallet update skipped (possibly already processed)`);
            }
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(500).send('Webhook failed');
    }
});



// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/attributes', attributeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/banners", bannerRoutes);
// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', async (req, res) => {
    try {
        const { pool } = require('./config/db');
        await pool.query('SELECT 1');

        res.json({
            status: 'OK',
            database: 'connected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uploadsAvailable: fs.existsSync(uploadsDir)
        });

    } catch (err) {
        res.status(500).json({
            status: 'ERROR',
            database: 'disconnected'
        });
    }
});

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
    console.log(`${req.method} ${req.originalUrl} - 404`);

    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

const errorHandler = require('./middleware/errorHandler');

app.use(errorHandler);

// ======================================================
// SERVER START
// ======================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {

        console.log(`🚀 EthMarket Server running`);
        console.log(`📍 Port: ${PORT}`);
        console.log(`📱 Local: http://localhost:${PORT}`);
        console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
        console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);

    });

    process.on('SIGTERM', () => {

        console.log('🛑 Graceful shutdown...');

        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });

    });

};

startServer();