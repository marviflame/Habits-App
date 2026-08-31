"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const validation_1 = require("../lib/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', async (req, res) => {
    try {
        const habits = await prisma_1.prisma.habit.findMany({
            where: { userId: req.user.userId },
            include: {
                logs: {
                    orderBy: { date: 'desc' },
                    take: 30
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ habits });
    }
    catch (err) {
        console.error('[List habits error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const result = validation_1.habitSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.flatten().fieldErrors });
            return;
        }
        const habit = await prisma_1.prisma.habit.create({
            data: { ...result.data, userId: req.user.userId }
        });
        res.status(201).json({ habit });
    }
    catch (err) {
        console.error('[Create habit error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const habitId = parseInt(req.params.id, 10);
        if (isNaN(habitId)) {
            res.status(400).json({ error: 'Invalid habit ID' });
            return;
        }
        const habit = await prisma_1.prisma.habit.findUnique({
            where: { id: habitId, userId: req.user.userId }
        });
        if (!habit) {
            res.status(404).json({ error: 'Habit not found' });
            return;
        }
        const result = validation_1.habitSchema.partial().safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: result.error.flatten().fieldErrors });
            return;
        }
        const updated = await prisma_1.prisma.habit.update({
            where: { id: habitId },
            data: result.data
        });
        res.json({ habit: updated });
    }
    catch (err) {
        console.error('[Update habit error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const habitId = parseInt(req.params.id, 10);
        if (isNaN(habitId)) {
            res.status(400).json({ error: 'Invalid habit ID' });
            return;
        }
        const habit = await prisma_1.prisma.habit.findUnique({
            where: { id: habitId, userId: req.user.userId }
        });
        if (!habit) {
            res.status(404).json({ error: 'Habit not found' });
            return;
        }
        await prisma_1.prisma.habit.delete({ where: { id: habitId } });
        res.json({ message: 'Habit deleted successfully' });
    }
    catch (err) {
        console.error('[Delete habit error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=habits.routes.js.map