const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '77777777',
    database: process.env.DB_NAME || 'ecommerce_db',
    
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    
    charset: 'utf8mb4',
    timezone: '+00:00'
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Connected to ecommerce_db');
        connection.release();
    } catch (err) {
        console.error('❌ Database Connection Failed:', err.message);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };