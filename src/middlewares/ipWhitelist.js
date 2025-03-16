import "dotenv/config";

/**
 * Middleware to restrict API access to allowed IPs.
 */
const ipWhitelistMiddleware = (req, res, next) => {
  const allowedIPs = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(",") : [];
  const requestIP = req.ip || req.connection.remoteAddress;

  if (!allowedIPs.includes(requestIP)) {
    console.warn(`[SECURITY] ❌ Unauthorized request from IP: ${requestIP}`);
    return res.status(403).json({ error: "Forbidden: Your IP is not allowed." });
  }

  next();
};

export default ipWhitelistMiddleware;