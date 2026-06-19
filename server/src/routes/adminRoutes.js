import express from "express";
import { z } from "zod";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getRefundAnalytics, listRefunds, updateRefund } from "../lib/store.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

const updateRefundSchema = z.object({
  params: z.object({ id: z.string().min(12) }),
  body: z.object({
    status: z.enum(["pending", "approved", "rejected"]),
    adminNote: z.string().max(500).optional()
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

router.get("/analytics", async (_req, res, next) => {
  try {
    const analytics = await getRefundAnalytics();

    res.json({ analytics });
  } catch (error) {
    next(error);
  }
});

export default router;
