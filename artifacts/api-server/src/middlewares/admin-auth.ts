import type { Request, Response, NextFunction } from "express";

/**
 * Protects admin-only endpoints (like listing quote requests) behind a
 * shared secret header. Not full user auth, but stops the endpoint from
 * being publicly scrapeable by anyone who has the URL.
 *
 * Usage: curl -H "x-admin-key: <ADMIN_API_KEY>" https://your-app/api/quotes
 */
export function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const expectedKey = process.env["ADMIN_API_KEY"];

  if (!expectedKey) {
    // Fail closed: if no key is configured, don't silently allow access.
    res.status(500).json({ error: "Admin access is not configured." });
    return;
  }

  const providedKey = req.header("x-admin-key");

  if (!providedKey || providedKey !== expectedKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
