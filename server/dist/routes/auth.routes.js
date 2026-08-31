"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/auth");
const validation_1 = require("../lib/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const result = validation_1.registerSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.flatten().fieldErrors });
            return;
        }
        const { email, password, name } = result.data;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.create({
            data: { email, name, password: hashedPassword }
        });
        const token = (0, auth_1.signToken)({ userId: user.id, email: user.email });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        res.status(201).json({
            user: { id: user.id, email: user.email, name: user.name },
            token
        });
    }
    catch (err) {
        console.error('[Register error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const result = validation_1.loginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.flatten().fieldErrors });
            return;
        }
        const { email, password } = result.data;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const valid = await (0, auth_1.comparePassword)(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = (0, auth_1.signToken)({ userId: user.id, email: user.email });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        res.json({
            user: { id: user.id, email: user.email, name: user.name },
            token
        });
    }
    catch (err) {
        console.error('[Login error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/logout', (_req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});
router.get('/me', auth_middleware_1.requireAuth, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, email: true, name: true, createdAt: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        console.error('[Me error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map