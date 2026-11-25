
import { Router } from "express";

import * as taskController from "../controllers/task.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema
} from "../validators/task.validator";

const router = Router();

// Admin: Create task
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(createTaskSchema),
    taskController.createTask
);

// Admin and Member: Get tasks
router.get(
    "/",
    authMiddleware,
    taskController.getTasks
);

// Admin and Member: Get task details
router.get(
    "/:id",
    authMiddleware,
    taskController.getTaskById
);

// Admin: Update task details
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(updateTaskSchema),
    taskController.updateTask
);

// Admin and assigned Member: Update task status
router.patch(
    "/:id/status",
    authMiddleware,
    validate(updateTaskStatusSchema),
    taskController.updateTaskStatus
);

// Admin: Delete task
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    taskController.deleteTask
);

export default router;
