import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { habitLogSchema } from '../lib/validation';
import { requireAuth } from '../middleware/auth.middleware';

const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const router = Router();

router.use(requireAuth);

const getUserHabit = async (habitId: number, userId: number) => {
  return prisma.habit.findFirst({
    where: { id: habitId, userId }
  });
};

router.get('/:habitId/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const habitId = parseInt(req.params.habitId, 10);
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID' });
      return;
    }

    const habit = await getUserHabit(habitId, req.user!.userId);
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const logs = await prisma.habitLog.findMany({
      where: { habitId },
      orderBy: { date: 'desc' },
      take: 90
    });
    res.json({ logs });
  } catch (err) {
    console.error('[List logs error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:habitId/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const habitId = parseInt(req.params.habitId, 10);
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID' });
      return;
    }

    const habit = await getUserHabit(habitId, req.user!.userId);
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const result = habitLogSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten().fieldErrors });
      return;
    }

    const baseDate = result.data.date ? new Date(result.data.date) : new Date();
    const dayStart = startOfDay(baseDate);
    const dayEnd = endOfDay(baseDate);

    const existing = await prisma.habitLog.findFirst({
      where: {
        habitId,
        date: { gte: dayStart, lte: dayEnd }
      }
    });

    if (existing) {
      const updated = await prisma.habitLog.update({
        where: { id: existing.id },
        data: { completed: result.data.completed, notes: result.data.notes ?? null }
      });
      res.json({ log: updated });
      return;
    }

    const log = await prisma.habitLog.create({
      data: {
        habitId,
        date: dayStart,
        completed: result.data.completed,
        notes: result.data.notes ?? null
      }
    });
    res.status(201).json({ log });
  } catch (err) {
    console.error('[Create log error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:habitId/logs/:logId', async (req: Request, res: Response): Promise<void> => {
  try {
    const habitId = parseInt(req.params.habitId, 10);
    const logId = parseInt(req.params.logId, 10);
    if (isNaN(habitId) || isNaN(logId)) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const habit = await getUserHabit(habitId, req.user!.userId);
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const log = await prisma.habitLog.findFirst({
      where: { id: logId, habitId }
    });
    if (!log) {
      res.status(404).json({ error: 'Log not found' });
      return;
    }

    await prisma.habitLog.delete({ where: { id: logId } });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    console.error('[Delete log error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
