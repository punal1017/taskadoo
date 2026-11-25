import { Router } from "express";

import * as projectController from "../controllers/project.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
    createProjectSchema,
    updateProjectSchema,
    addMemberSchema
} from "../validators/project.validator";

const router = Router();

// Admin only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(createProjectSchema),
    projectController.createProject
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(updateProjectSchema),
    projectController.updateProject
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    projectController.deleteProject
);

router.post(
    "/:id/members",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(addMemberSchema),
    projectController.addMember
);

router.delete(
    "/:id/members/:userId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    projectController.removeMember
);

// Admin + Member
router.get("/", authMiddleware, projectController.getProjects);

router.get("/:id", authMiddleware, projectController.getProjectById);

export default router;