import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
  description: z.string().optional().nullable(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  color: z.string().default('#6366f1'),
  icon: z.string().default('⭐')
});

export const habitLogSchema = z.object({
  date: z.coerce.date().optional(),
  completed: z.boolean().default(true),
  notes: z.string().optional().nullable()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
