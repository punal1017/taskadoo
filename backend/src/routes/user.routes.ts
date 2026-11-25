import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserStatusSchema } from "../validators/user.validator";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch(
    "/:id/status",
    validate(updateUserStatusSchema),
    userController.updateUserStatus
);

export default router;
