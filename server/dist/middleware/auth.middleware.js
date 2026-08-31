"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = void 0;
const auth_1 = require("../lib/auth");
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const payload = (0, auth_1.verifyToken)(token);
    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    req.user = payload;
    next();
};
exports.requireAuth = requireAuth;
const optionalAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : req.cookies?.token;
    if (token) {
        const payload = (0, auth_1.verifyToken)(token);
        if (payload) {
            req.user = payload;
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map