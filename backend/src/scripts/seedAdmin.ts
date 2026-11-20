import dotenv from "dotenv";
import { connectDB } from "../config/db";
import seedAdmin from "../utils/seedAdmin";

dotenv.config();

const run = async (): Promise<void> => {
    await connectDB();
    await seedAdmin();
    process.exit(0);
};

run().catch((error: unknown) => {
    console.error("Admin seeding failed", error);
    process.exit(1);
});
