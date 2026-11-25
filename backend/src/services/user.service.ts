import mongoose from "mongoose";
import User from "../models/User.model";
import { ApiError } from "../utils/ApiError";

const publicUserFields = "_id name email role isActive createdAt updatedAt";

export const getUsers = async () => {
    return User.find().select(publicUserFields).sort({ createdAt: -1 });
};

export const getUserById = async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findById(userId).select(publicUserFields);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, runValidators: true }
    ).select(publicUserFields);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return user;
};
