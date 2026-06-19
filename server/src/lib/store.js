import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { RefundRequest } from "../models/RefundRequest.js";
import { TransactionHistory } from "../models/TransactionHistory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data");
const dataFile = path.join(dataDir, "store.json");

const memory = {
  users: [],
  refunds: [],
  history: []
};

function useMemory() {
  return process.env.USE_MEMORY_DB === "true";
}

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(memory, null, 2));
  }
}

function loadMemoryStore() {
  if (!useMemory()) return;

  try {
    ensureDataFile();
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    memory.users = Array.isArray(parsed.users) ? parsed.users : [];
    memory.refunds = Array.isArray(parsed.refunds) ? parsed.refunds : [];
    memory.history = Array.isArray(parsed.history) ? parsed.history : [];
  } catch (error) {
    console.warn("Could not load local store. Starting with empty local data.", error.message);
  }
}

function saveMemoryStore() {
  if (!useMemory()) return;

  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(memory, null, 2));
}

function withTimestamps(item) {
  const now = new Date().toISOString();
  return { ...item, createdAt: now, updatedAt: now };
}

export async function ensureAdminFromEnv() {
  loadMemoryStore();

  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME || "prateeksharma4919l";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) return;

  const passwordHash = await bcrypt.hash(password, 12);

  if (useMemory()) {
    const existing = memory.users.find((user) => user.email === email.toLowerCase());
    if (existing) {
      existing.name = name;
      existing.username = username.toLowerCase();
      existing.passwordHash = passwordHash;
      existing.updatedAt = new Date().toISOString();
      saveMemoryStore();
      return existing;
    }

    const user = withTimestamps({
      _id: randomUUID(),
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash,
      role: "admin"
    });
    memory.users.push(user);
    saveMemoryStore();
    return user;
  }

  return User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name, email: email.toLowerCase(), username: username.toLowerCase(), passwordHash, role: "admin" },
    { upsert: true, new: true }
  );
}

export async function findUserByIdentifier(identifier) {
  const value = identifier.toLowerCase();

  if (useMemory()) {
    return memory.users.find((user) => user.email === value || user.username === value) || null;
  }

  return User.findOne({ $or: [{ email: value }, { username: value }] });
}

export async function findUserById(id) {
  if (useMemory()) {
    const user = memory.users.find((item) => item._id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  return User.findById(id).select("-passwordHash");
}

export async function createRefund(payload) {
  if (useMemory()) {
    const refund = withTimestamps({
      _id: randomUUID(),
      status: "pending",
      ...payload
    });
    memory.refunds.unshift(refund);
    saveMemoryStore();
    return refund;
  }

  return RefundRequest.create(payload);
}

export async function listRefunds() {
  if (useMemory()) {
    return [...memory.refunds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return RefundRequest.find().sort({ createdAt: -1 });
}

export async function updateRefund(id, payload, userId) {
  if (useMemory()) {
    const refund = memory.refunds.find((item) => item._id === id);
    if (!refund) return null;
    Object.assign(refund, payload, {
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    saveMemoryStore();
    return refund;
  }

  return RefundRequest.findByIdAndUpdate(
    id,
    {
      ...payload,
      reviewedBy: userId,
      reviewedAt: new Date()
    },
    { new: true, runValidators: true }
  );
}

export async function getRefundAnalytics() {
  const analytics = { pending: 0, approved: 0, rejected: 0 };

  if (useMemory()) {
    memory.refunds.forEach((refund) => {
      analytics[refund.status] += 1;
    });
    return analytics;
  }

  const grouped = await RefundRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  grouped.forEach((item) => {
    analytics[item._id] = item.count;
  });
  return analytics;
}

export async function createTransactionHistory(payload) {
  if (useMemory()) {
    const record = withTimestamps({ _id: randomUUID(), ...payload });
    memory.history.unshift(record);
    saveMemoryStore();
    return record;
  }

  return TransactionHistory.create(payload);
}

export async function listTransactionHistory() {
  if (useMemory()) {
    return memory.history.slice(0, 50);
  }

  return TransactionHistory.find().sort({ createdAt: -1 }).limit(50);
}
