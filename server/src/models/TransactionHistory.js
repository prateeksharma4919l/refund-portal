import mongoose from "mongoose";

const transactionHistorySchema = new mongoose.Schema(
  {
    txid: { type: String, required: true, trim: true, index: true },
    walletAddress: { type: String, required: true, trim: true },
    currency: { type: String, trim: true },
    requestedAmount: Number,
    network: { type: String, required: true, trim: true },
    sender: String,
    receiver: String,
    amount: Number,
    recoveredAmount: { type: Number, min: 0, default: null },
    blockNumber: Number,
    confirmations: Number,
    confirmed: Boolean,
    rawStatus: String
  },
  { timestamps: true }
);

export const TransactionHistory = mongoose.model("TransactionHistory", transactionHistorySchema);
