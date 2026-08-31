"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.habitLogSchema = exports.habitSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(1, 'Name is required')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.habitSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Habit name is required'),
    description: zod_1.z.string().optional().nullable(),
    frequency: zod_1.z.enum(['daily', 'weekly', 'monthly']).default('daily'),
    color: zod_1.z.string().default('#6366f1'),
    icon: zod_1.z.string().default('⭐')
});
exports.habitLogSchema = zod_1.z.object({
    date: zod_1.z.coerce.date().optional(),
    completed: zod_1.z.boolean().default(true),
    notes: zod_1.z.string().optional().nullable()
});
//# sourceMappingURL=validation.js.map