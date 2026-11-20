
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { generateToken } from "../utils/generateToken";
import { ApiError } from "../utils/ApiError";

export const registerUser = async (data: {
    name: string;
    email: string;
    password: string;
}) => {
    const existingUser = await User.findOne({
        email: data.email
    });

    if (existingUser) {
        throw new ApiError(409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
        ...data,
        password: hashedPassword,
        role: "MEMBER"
    });

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token: generateToken(user._id.toString(), user.role)
    };
};

export const loginUser = async (email: string, password: string) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Account is inactive");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token: generateToken(user._id.toString(), user.role)
    };
};
