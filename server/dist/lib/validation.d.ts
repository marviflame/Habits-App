import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
}, {
    email: string;
    password: string;
    name: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const habitSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    frequency: z.ZodDefault<z.ZodEnum<["daily", "weekly", "monthly"]>>;
    color: z.ZodDefault<z.ZodString>;
    icon: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    frequency: "daily" | "weekly" | "monthly";
    color: string;
    icon: string;
    description?: string | null | undefined;
}, {
    name: string;
    description?: string | null | undefined;
    frequency?: "daily" | "weekly" | "monthly" | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}>;
export declare const habitLogSchema: z.ZodObject<{
    date: z.ZodOptional<z.ZodDate>;
    completed: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    completed: boolean;
    date?: Date | undefined;
    notes?: string | null | undefined;
}, {
    date?: Date | undefined;
    completed?: boolean | undefined;
    notes?: string | null | undefined;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
