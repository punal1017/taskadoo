import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import seedAdmin from "./utils/seedAdmin";

dotenv.config();

const port = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
    await connectDB();

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        await seedAdmin();
    } else {
        console.log("Admin seeding skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing");
    }

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

startServer().catch((error: unknown) => {
    console.error("Failed to start server", error);
    process.exit(1);
});