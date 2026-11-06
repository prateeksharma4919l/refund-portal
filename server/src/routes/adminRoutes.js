import express from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  deleteTransactionHistory,
  getRefundAnalytics,
  listRefunds,
  updateRefund,
  updateTransactionHistory
} from "../lib/store.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

const updateRefundSchema = z.object({
  params: z.object({ id: z.string().min(12) }),
  body: z.object({
    status: z.enum(["pending", "approved", "rejected"]),
    adminNote: z.string().max(500).optional()
  })
});

const historyIdSchema = z.object({
  params: z.object({ id: z.string().min(12) })
});

const updateHistorySchema = historyIdSchema.extend({
  body: z.object({
    recoveredAmount: z.number().finite().min(0).max(1_000_000)
  })
});

router.get("/refunds", async (_req, res, next) => {
  try {
    const refunds = await listRefunds();
    res.json({ refunds });
  } catch (error) {
    next(error);
  }
});

router.patch("/refunds/:id", validate(updateRefundSchema), async (req, res, next) => {
  try {
    const refund = await updateRefund(
      req.validated.params.id,
      req.validated.body,
      req.user._id
    );

    if (!refund) {
      const error = new Error("Refund request not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ refund });
  } catch (error) {
    next(error);
  }
});

router.patch("/history/:id", validate(updateHistorySchema), async (req, res, next) => {
  try {
    const transaction = await updateTransactionHistory(
      req.validated.params.id,
      req.validated.body.recoveredAmount
    );

    if (!transaction) {
      const error = new Error("Transaction history record not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

router.delete("/history/:id", validate(historyIdSchema), async (req, res, next) => {
  try {
    const deleted = await deleteTransactionHistory(req.validated.params.id);
    if (!deleted) {
      const error = new Error("Transaction history record not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/analytics", async (_req, res, next) => {
  try {
    const analytics = await getRefundAnalytics();

    res.json({ analytics });
  } catch (error) {
    next(error);
  }
});

export default router;
