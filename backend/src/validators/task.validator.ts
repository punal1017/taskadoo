
import { z } from "zod";

const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());

export const createTaskSchema = z.object({
    title: z.string().min(3, "Task title must be at least 3 characters"),

    description: z.string().optional(),

    projectId: z.string().min(1, "Project ID is required"),

    assignedTo: z.string().min(1, "Assigned user ID is required"),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

    dueDate: dateSchema.optional()
});

export const updateTaskSchema = z.object({
    title: z.string().min(3).optional(),

    description: z.string().optional(),

    assignedTo: z.string().min(1, "Assigned user ID cannot be empty").nullable().optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

    dueDate: dateSchema.optional()
});

export const updateTaskStatusSchema = z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"])
});
