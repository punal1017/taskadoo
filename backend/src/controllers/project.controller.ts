import { Request, Response, NextFunction } from "express";
import * as projectService from "../services/project.service";

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;

        const project = await projectService.createProject(req.body, userId);

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        next(error);
    }
};

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, role } = (req as any).user;

        const projects = await projectService.getProjects(userId, role);

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const { userId, role } = (req as any).user;

        const project = await projectService.getProjectById(
            req.params.id,
            userId,
            role
        );

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.updateProject(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        await projectService.deleteProject(req.params.id);

        res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const addMember = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.addMember(
            req.params.id,
            req.body.userId
        );

        res.status(200).json({
            success: true,
            message: "Member added successfully",
            data: project
        });
    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req: Request<{ id: string; userId: string }>, res: Response, next: NextFunction) => {
    try {
        const project = await projectService.removeMember(
            req.params.id,
            req.params.userId
        );

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            data: project
        });
    } catch (error) {
        next(error);
    }
};