import jwt from "jsonwebtoken";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || typeof payload !== "object" || typeof payload.id !== "string" || payload.role !== "admin") {
      const error = new Error("Invalid session");
      error.statusCode = 401;
      throw error;
    }

    req.user = { _id: payload.id, role: payload.role };
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    const error = new Error("Admin access required");
    error.statusCode = 403;
    next(error);
    return;
  }

  next();
}
