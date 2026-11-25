import { z } from "zod";

const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());

const projectFields = z.object({
    name: z.string().min(3, "Project name must be at least 3 characters"),
    description: z.string().optional(),
    startDate: dateSchema.optional(),
    dueDate: dateSchema.optional()
});

const datesAreValid = <T extends { startDate?: string; dueDate?: string }>(
    data: T
) => {
    if (data.startDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.startDate);
    }

    return true;
};

export const createProjectSchema = projectFields.refine(
    datesAreValid,
    {
        message: "Due date cannot be before start date",
        path: ["dueDate"]
    }
);

export const updateProjectSchema = projectFields.partial().refine(
    datesAreValid,
    {
        message: "Due date cannot be before start date",
        path: ["dueDate"]
    }
);

export const addMemberSchema = z.object({
    userId: z.string().min(1, "User ID is required")
});