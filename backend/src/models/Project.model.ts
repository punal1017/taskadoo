import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
    name: string;
    description?: string;
    owner: Types.ObjectId;
    members: Types.ObjectId[];
    startDate?: Date;
    dueDate?: Date;
    status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
}

const projectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        startDate: {
            type: Date
        },

        dueDate: {
            type: Date
        },

        status: {
            type: String,
            enum: ["ACTIVE", "COMPLETED", "ON_HOLD"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;