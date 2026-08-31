import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { habitSchema } from '../lib/validation';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user!.userId },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ habits });
  } catch (err) {
    console.error('[List habits error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = habitSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten().fieldErrors });
      return;
    }

    const habit = await prisma.habit.create({
      data: { ...result.data, userId: req.user!.userId }
    });
    res.status(201).json({ habit });
  } catch (err) {
    console.error('[Create habit error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const habitId = parseInt(req.params.id, 10);
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID' });
      return;
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habitId, userId: req.user!.userId }
    });
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const result = habitSchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten().fieldErrors });
      return;
    }

    const updated = await prisma.habit.update({
      where: { id: habitId },
      data: result.data
    });
    res.json({ habit: updated });
  } catch (err) {
    console.error('[Update habit error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const habitId = parseInt(req.params.id, 10);
    if (isNaN(habitId)) {
      res.status(400).json({ error: 'Invalid habit ID' });
      return;
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habitId, userId: req.user!.userId }
    });
    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    await prisma.habit.delete({ where: { id: habitId } });
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    console.error('[Delete habit error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
