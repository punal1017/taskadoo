
import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
    title: string;
    description?: string;
    project: mongoose.Types.ObjectId;
    assignedTo: mongoose.Types.ObjectId | null;
    assignedBy: mongoose.Types.ObjectId;
    status: "TODO" | "IN_PROGRESS" | "COMPLETED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: Date;
}

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["TODO", "IN_PROGRESS", "COMPLETED"],
            default: "TODO"
        },

        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM"
        },

        dueDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
