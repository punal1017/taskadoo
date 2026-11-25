
import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";

export const getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, role } = (req as any).user;

        const dashboard = await dashboardService.getDashboardStats(
            userId,
            role
        );

        res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: dashboard
        });

    } catch (error) {
        next(error);
    }
};
