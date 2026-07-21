import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { getPagination, buildMeta } from "../../utils/pagination";
import { ApiError } from "../../utils/ApiError";
import { FinanceService } from "./finance.service";

function uid(req: AuthedRequest) {
  if (!req.userId) throw ApiError.unauthorized();
  return req.userId;
}

const txType = z.enum(["Income", "Expense"]);

const createTxSchema = z.object({
  body: z.object({
    description: z.string().min(1).max(200),
    amount: z.number().positive(),
    type: txType,
    category: z.string().max(50).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().max(1000).optional(),
    recurring: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateTxSchema = z.object({
  body: createTxSchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

const createBudgetSchema = z.object({
  body: z.object({
    category: z.string().min(1).max(50),
    limit: z.number().positive(),
    period: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * /finance:
 *   get:
 *     summary: List transactions
 *     tags: [Finance]
 *   post:
 *     summary: Create a transaction
 *     tags: [Finance]
 */
router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { page, limit, skip } = getPagination(req);
    const { items, total } = await FinanceService.listTransactions(
      uid(req),
      skip,
      limit,
      req.query.type as string | undefined,
      req.query.category as string | undefined
    );
    return sendSuccess(res, items, 200, buildMeta(page, limit, total));
  })
);

router.post(
  "/",
  validate(createTxSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const tx = await FinanceService.createTransaction(uid(req), req.body);
    return sendSuccess(res, tx, 201);
  })
);

router.put(
  "/:id",
  validate(updateTxSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const tx = await FinanceService.updateTransaction(uid(req), req.params.id, req.body);
    return sendSuccess(res, tx);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    await FinanceService.deleteTransaction(uid(req), req.params.id);
    return sendSuccess(res, { message: "Transaction deleted" });
  })
);

/**
 * @openapi
 * /finance/budgets:
 *   get:
 *     summary: List budgets
 *     tags: [Finance]
 *   post:
 *     summary: Create a budget
 *     tags: [Finance]
 */
router.get(
  "/budgets",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const budgets = await FinanceService.listBudgets(uid(req));
    return sendSuccess(res, budgets);
  })
);

router.post(
  "/budgets",
  validate(createBudgetSchema),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const budget = await FinanceService.createBudget(uid(req), req.body);
    return sendSuccess(res, budget, 201);
  })
);

/**
 * @openapi
 * /finance/stats:
 *   get:
 *     summary: Get income/expense stats
 *     tags: [Finance]
 * /finance/trends:
 *   get:
 *     summary: Get 6-month income/expense trend
 *     tags: [Finance]
 */
router.get(
  "/stats",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const stats = await FinanceService.stats(uid(req));
    return sendSuccess(res, stats);
  })
);

router.get(
  "/trends",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const trends = await FinanceService.trends(uid(req));
    return sendSuccess(res, trends);
  })
);

export default router;
