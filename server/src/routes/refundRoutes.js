import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { createRefund } from "../lib/store.js";

const router = express.Router();

const createRefundSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    transactionHash: z.string().min(10).max(120),
    walletAddress: z.string().min(10).max(120),
    currency: z.string().max(20),
    network: z.string().max(40).optional(),
    withdrawalAmount: z.coerce.number().positive().max(1_000_000),
    reason: z.string().min(10).max(1000)
  })
});

router.post("/", validate(createRefundSchema), async (req, res, next) => {
  try {
    const refund = await createRefund(req.validated.body);
    res.status(201).json({ refund });
  } catch (error) {
    next(error);
  }
});

export default router;
