
import bcrypt from "bcryptjs";
import User from "../models/User.model";

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error("Admin credentials missing in environment variables");
        }

        const existingAdmin = await User.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
            name: process.env.ADMIN_NAME || "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN"
        });

        console.log("Admin created successfully");
    } catch (error) {
        console.error("Admin seeding failed:", error);
        throw error;
    }
};

export default seedAdmin;
