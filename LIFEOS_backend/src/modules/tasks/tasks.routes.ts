import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createTaskSchema, updateTaskSchema, idParamSchema } from "./tasks.validators";
import * as ctrl from "./tasks.controller";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: List tasks (paginated, filterable)
 *     tags: [Tasks]
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 */
router.get("/", ctrl.list);
router.post("/", validate(createTaskSchema), ctrl.create);

/**
 * @openapi
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics for the current user
 *     tags: [Tasks]
 */
router.get("/stats", ctrl.stats);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by id
 *     tags: [Tasks]
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *   delete:
 *     summary: Soft-delete a task
 *     tags: [Tasks]
 */
router.get("/:id", validate(idParamSchema), ctrl.getById);
router.put("/:id", validate(updateTaskSchema), ctrl.update);
router.delete("/:id", validate(idParamSchema), ctrl.remove);

export default router;
