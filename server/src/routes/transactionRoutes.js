import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { getSupportedNetworks, verifyTransaction } from "../services/blockchainService.js";
import { createTransactionHistory, listTransactionHistory } from "../lib/store.js";

const router = express.Router();

const optionalAmountSchema = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.coerce.number().positive().max(1_000_000).optional()
);

const verifySchema = z.object({
  body: z.object({
    txid: z.string().trim().min(10).max(120),
    walletAddress: z.string().trim().min(10).max(120),
    currency: z.enum(["btc", "eth", "ltc", "usdt"]),
    requestedAmount: optionalAmountSchema,
    network: z.enum(["bitcoin", "ethereum", "litecoin", "tron", "bsc", "polygon"])
  })
});

router.get("/networks", (_req, res) => {
  res.json(getSupportedNetworks());
});

router.post("/verify", validate(verifySchema), async (req, res, next) => {
  try {
    const transaction = await verifyTransaction(req.validated.body);
    await createTransactionHistory(transaction);
    res.json({ transaction });
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (_req, res, next) => {
  try {
    const history = await listTransactionHistory();
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

export default router;
