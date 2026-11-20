import jwt from "jsonwebtoken";

export const generateToken = (userId: string, role: string) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        { userId, role },
        secret,
        { expiresIn: "1d" }
    );
};

