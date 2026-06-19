import mongoose from "mongoose";

const refundRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    transactionHash: { type: String, required: true, trim: true },
    walletAddress: { type: String, trim: true },
    currency: { type: String, trim: true },
    network: { type: String, trim: true },
    withdrawalAmount: { type: Number, min: 0 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    adminNote: { type: String, trim: true }
  },
  { timestamps: true }
);

export const RefundRequest = mongoose.model("RefundRequest", refundRequestSchema);
