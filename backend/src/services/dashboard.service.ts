
import Project from "../models/Project.model";
import Task from "../models/Task.model";

export const getDashboardStats = async (
    userId: string,
    role: string
) => {

    // Admin sees all data
    // Member sees only their assigned data

    const projectFilter = role === "ADMIN"
        ? {}
        : { members: userId };

    const taskFilter = role === "ADMIN"
        ? {}
        : { assignedTo: userId };

    const [
        totalProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        myTasks
    ] = await Promise.all([

        Project.countDocuments(projectFilter),

        Task.countDocuments(taskFilter),

        Task.countDocuments({
            ...taskFilter,
            status: "TODO"
        }),

        Task.countDocuments({
            ...taskFilter,
            status: "IN_PROGRESS"
        }),

        Task.countDocuments({
            ...taskFilter,
            status: "COMPLETED"
        }),

        Task.find({ assignedTo: userId })
            .populate("project", "name")
            .sort({ createdAt: -1 })
    ]);

    return {
        totalProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        myTasks
    };
};
