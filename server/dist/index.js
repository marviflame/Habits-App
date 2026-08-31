"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const habits_routes_1 = __importDefault(require("./routes/habits.routes"));
const logs_routes_1 = __importDefault(require("./routes/logs.routes"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '4000', 10);
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const CLIENT_DIST_DIR = process.env.CLIENT_DIST_DIR || path_1.default.resolve(__dirname, '..', '..', 'client', 'dist');
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || CORS_ORIGINS.includes(origin))
            return callback(null, true);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json({ limit: '1mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/habits', habits_routes_1.default);
app.use('/api/habits', logs_routes_1.default);
if (fs_1.default.existsSync(CLIENT_DIST_DIR)) {
    app.use(express_1.default.static(CLIENT_DIST_DIR, { index: false, maxAge: '1d' }));
    app.get('*', (_req, res, next) => {
        const indexHtml = path_1.default.join(CLIENT_DIST_DIR, 'index.html');
        if (fs_1.default.existsSync(indexHtml))
            return res.sendFile(indexHtml);
        next();
    });
}
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Habits server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 CORS origins: ${CORS_ORIGINS.join(', ')}`);
    if (fs_1.default.existsSync(CLIENT_DIST_DIR)) {
        console.log(`🌐 Serving built client from: ${CLIENT_DIST_DIR}`);
    }
});
exports.default = app;
//# sourceMappingURL=index.js.map