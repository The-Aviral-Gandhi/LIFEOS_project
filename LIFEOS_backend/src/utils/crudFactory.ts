import { Router } from "express";
import { Response } from "express";
import { prisma } from "../config/database";
import { ApiError } from "./ApiError";
import { asyncHandler } from "./asyncHandler";
import { sendSuccess } from "./apiResponse";
import { getPagination, buildMeta } from "./pagination";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { AnyZodObject } from "zod";

type Delegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
  findFirst: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
};

interface CrudOptions {
  modelName: string;
  softDelete?: boolean;
  include?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc">;
  createSchema: AnyZodObject;
  updateSchema: AnyZodObject;
  /** Transform raw body into Prisma create data */
  mapCreate: (userId: string, body: any) => any;
  /** Transform raw body into Prisma update data */
  mapUpdate: (body: any) => any;
}

/**
 * Builds a standard authenticated REST router (list/get/create/update/delete)
 * for a simple per-user owned Prisma model. Used for Goals, Projects, Journal —
 * modules whose business logic is "own it, CRUD it" with no extra side effects.
 */
export function buildCrudRouter(getDelegate: () => Delegate, opts: CrudOptions): Router {
  const router = Router();
  router.use(requireAuth);

  const where = (userId: string, extra: Record<string, unknown> = {}) => ({
    userId,
    ...(opts.softDelete ? { deletedAt: null } : {}),
    ...extra,
  });

  router.get(
    "/",
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      if (!req.userId) throw ApiError.unauthorized();
      const { page, limit, skip } = getPagination(req);
      const delegate = getDelegate();
      const [items, total] = await Promise.all([
        delegate.findMany({
          where: where(req.userId),
          skip,
          take: limit,
          orderBy: opts.orderBy ?? { createdAt: "desc" },
          ...(opts.include ? { include: opts.include } : {}),
        }),
        delegate.count({ where: where(req.userId) }),
      ]);
      return sendSuccess(res, items, 200, buildMeta(page, limit, total));
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      if (!req.userId) throw ApiError.unauthorized();
      const delegate = getDelegate();
      const item = await delegate.findFirst({
        where: where(req.userId, { id: req.params.id }),
        ...(opts.include ? { include: opts.include } : {}),
      });
      if (!item) throw ApiError.notFound(`${opts.modelName} not found`);
      return sendSuccess(res, item);
    })
  );

  router.post(
    "/",
    validate(opts.createSchema),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      if (!req.userId) throw ApiError.unauthorized();
      const delegate = getDelegate();
      const item = await delegate.create({ data: opts.mapCreate(req.userId, req.body) });
      return sendSuccess(res, item, 201);
    })
  );

  router.put(
    "/:id",
    validate(opts.updateSchema),
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      if (!req.userId) throw ApiError.unauthorized();
      const delegate = getDelegate();
      const existing = await delegate.findFirst({ where: where(req.userId, { id: req.params.id }) });
      if (!existing) throw ApiError.notFound(`${opts.modelName} not found`);
      const item = await delegate.update({ where: { id: req.params.id }, data: opts.mapUpdate(req.body) });
      return sendSuccess(res, item);
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: AuthedRequest, res: Response) => {
      if (!req.userId) throw ApiError.unauthorized();
      const delegate = getDelegate();
      const existing = await delegate.findFirst({ where: where(req.userId, { id: req.params.id }) });
      if (!existing) throw ApiError.notFound(`${opts.modelName} not found`);
      if (opts.softDelete) {
        await delegate.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
      } else {
        await (prisma as any)[opts.modelName].delete({ where: { id: req.params.id } });
      }
      return sendSuccess(res, { message: `${opts.modelName} deleted` });
    })
  );

  return router;
}
