import dotenv from "dotenv";
import { connectDB } from "../lib/db.js";
import { ensureAdminFromEnv } from "../lib/store.js";

dotenv.config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  process.exit(1);
}

await connectDB();
await ensureAdminFromEnv();

console.log(`Admin ready: ${email}`);
process.exit(0);
