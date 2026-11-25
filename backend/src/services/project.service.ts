import Project from "../models/Project.model";
import User from "../models/User.model";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";

const createProject = async (data: any, userId: string) => {
    const project = await Project.create({
        ...data,
        owner: userId,
        members: [userId]
    });

    return project;
};

const getProjects = async (userId: string, role: string) => {
    if (role === "ADMIN") {
        return await Project.find()
            .populate("owner", "name email")
            .populate("members", "name email");
    }

    return await Project.find({
        members: userId
    })
        .populate("owner", "name email")
        .populate("members", "name email");
};

const getProjectById = async (
    projectId: string,
    userId: string,
    role: string
) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(projectId)
        .populate("owner", "name email")
        .populate("members", "name email");

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isMember = project.members.some(
        (member: any) => member._id.toString() === userId
    );

    if (role !== "ADMIN" && !isMember) {
        throw new ApiError(403, "You are not authorized to view this project");
    }

    return project;
};

const updateProject = async (projectId: string, data: any) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findByIdAndUpdate(
        projectId,
        data,
        {
            new: true,
            runValidators: true
        }
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

const deleteProject = async (projectId: string) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

const addMember = async (projectId: string, userId: string) => {
    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        throw new ApiError(400, "Invalid project or user ID");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "MEMBER" || !user.isActive) {
        throw new ApiError(404, "Valid active member not found");
    }

    if (project.members.some(id => id.toString() === userId)) {
        throw new ApiError(409, "User is already a project member");
    }

    project.members.push(user._id);
    await project.save();

    return project;
};

const removeMember = async (projectId: string, userId: string) => {
    if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        throw new ApiError(400, "Invalid project or user ID");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (project.owner.toString() === userId) {
        throw new ApiError(400, "Project owner cannot be removed");
    }

    const isMember = project.members.some(
        id => id.toString() === userId
    );

    if (!isMember) {
        throw new ApiError(404, "User is not a project member");
    }

    project.members = project.members.filter(
        id => id.toString() !== userId
    );

    await project.save();

    return project;
};

export {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember
};