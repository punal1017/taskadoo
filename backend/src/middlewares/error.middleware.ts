import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next
) => {
    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
        return;
    }

    if (error?.code === 11000) {
        res.status(409).json({
            success: false,
            message: "Email already registered"
        });
        return;
    }

    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};
