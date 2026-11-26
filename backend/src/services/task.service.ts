
import mongoose from "mongoose";
import Task from "../models/Task.model";
import Project from "../models/Project.model";
import User from "../models/User.model";
import { ApiError } from "../utils/ApiError";

const createTask = async (data: any, adminId: string) => {

    if (
        !mongoose.Types.ObjectId.isValid(data.projectId) ||
        !mongoose.Types.ObjectId.isValid(data.assignedTo)
    ) {
        throw new ApiError(400, "Invalid project or user ID");
    }

    const project = await Project.findById(data.projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const user = await User.findById(data.assignedTo);

    if (!user || user.role !== "MEMBER" || !user.isActive) {
        throw new ApiError(404, "Active member not found");
    }

    const isMember = project.members.some(
        id => id.toString() === data.assignedTo
    );

    if (!isMember) {
        throw new ApiError(403, "User is not a member of this project");
    }

    const task = await Task.create({
        title: data.title,
        description: data.description,
        project: data.projectId,
        assignedTo: data.assignedTo,
        assignedBy: adminId,
        priority: data.priority,
        dueDate: data.dueDate
    });

    return task;
};

const getTasks = async (userId: string, role: string) => {

    const filter = role === "ADMIN"
        ? {}
        : { assignedTo: userId };

    return await Task.find(filter)
        .populate("project", "name")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email")
        .sort({ createdAt: -1 });
};

const getTaskById = async (
    taskId: string,
    userId: string,
    role: string
) => {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(taskId)
        .populate("project", "name")
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email");

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (
        role !== "ADMIN" &&
        (!task.assignedTo || task.assignedTo._id.toString() !== userId)
    ) {
        throw new ApiError(403, "You are not authorized to view this task");
    }

    return task;
};

const updateTask = async (taskId: string, data: any) => {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
        throw new ApiError(404, "Task not found");
    }

    if (data.assignedTo !== undefined && data.assignedTo !== null) {
        if (!mongoose.Types.ObjectId.isValid(data.assignedTo)) {
            throw new ApiError(400, "Invalid assigned user ID");
        }

        const user = await User.findById(data.assignedTo);

        if (!user || user.role !== "MEMBER" || !user.isActive) {
            throw new ApiError(404, "Active member not found");
        }

        const project = await Project.findById(existingTask.project);

        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        const isMember = project.members.some(
            id => id.toString() === data.assignedTo
        );

        if (!isMember) {
            throw new ApiError(403, "User is not a member of this project");
        }
    }

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        data,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return updatedTask;
};

const updateTaskStatus = async (
    taskId: string,
    status: string,
    userId: string,
    role: string
) => {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (
        role !== "ADMIN" &&
        (!task.assignedTo || task.assignedTo.toString() !== userId)
    ) {
        throw new ApiError(403, "You cannot update this task");
    }

    task.status = status as "TODO" | "IN_PROGRESS" | "COMPLETED";

    await task.save();

    return task;
};

const deleteTask = async (taskId: string) => {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return task;
};

export {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask
};
