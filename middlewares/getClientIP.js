const getClientIP = (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    req.clientIP = clientIP;
    next();
};

module.exports = getClientIP;
