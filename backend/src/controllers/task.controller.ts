
import { Request, Response, NextFunction } from "express";
import * as taskService from "../services/task.service";

export const createTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminId = (req as any).user.userId;

        const task = await taskService.createTask(req.body, adminId);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });
    } catch (error) {
        next(error);
    }
};

export const getTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, role } = (req as any).user;

        const tasks = await taskService.getTasks(userId, role);

        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, role } = (req as any).user;

        const task = await taskService.getTaskById(
            req.params.id,
            userId,
            role
        );

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const task = await taskService.updateTask(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task
        });
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, role } = (req as any).user;

        const task = await taskService.updateTaskStatus(
            req.params.id,
            req.body.status,
            userId,
            role
        );

        res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            data: task
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        await taskService.deleteTask(req.params.id);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
