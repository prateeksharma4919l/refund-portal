import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { findUserByIdentifier } from "../lib/store.js";

const router = express.Router();

const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(80),
    password: z.string().min(4).max(80)
  })
});

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
}

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.validated.body;
    const user = await findUserByIdentifier(username);
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
