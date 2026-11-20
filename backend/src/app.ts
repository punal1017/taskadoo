import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Taskadoo API is running"
    });
});

app.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;
