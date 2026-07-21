import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { AuthedRequest } from "../../middleware/auth";
import { TasksService } from "./tasks.service";
import { ApiError } from "../../utils/ApiError";

function uid(req: AuthedRequest) {
  if (!req.userId) throw ApiError.unauthorized();
  return req.userId;
}

export const list = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const userId = uid(req);
  const { page, limit, skip } = getPagination(req);
  const { completed, category, priority, search } = req.query;

  const { items, total } = await TasksService.list(userId, skip, limit, {
    completed: completed === undefined ? undefined : completed === "true",
    category: category as string | undefined,
    priority: priority as string | undefined,
    search: search as string | undefined,
  });

  return sendSuccess(res, items, 200, buildMeta(page, limit, total));
});

export const getById = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const task = await TasksService.getById(uid(req), req.params.id);
  return sendSuccess(res, task);
});

export const create = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const task = await TasksService.create(uid(req), req.body);
  return sendSuccess(res, task, 201);
});

export const update = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const task = await TasksService.update(uid(req), req.params.id, req.body);
  return sendSuccess(res, task);
});

export const remove = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await TasksService.remove(uid(req), req.params.id);
  return sendSuccess(res, { message: "Task deleted" });
});

export const stats = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = await TasksService.stats(uid(req));
  return sendSuccess(res, data);
});
