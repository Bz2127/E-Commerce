const errorHandler = (err, req, res, next) => {

    const statusCode = err.status || 500;

    const errorInfo = {
        timestamp: new Date().toISOString(),
        message: err.message,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?.id
    };

    if (process.env.NODE_ENV !== 'production') {
        errorInfo.stack = err.stack;
    }

    console.error("🔥 API Error:", errorInfo);

    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? "Internal Server Error"
            : err.message
    });

};

module.exports = errorHandler;