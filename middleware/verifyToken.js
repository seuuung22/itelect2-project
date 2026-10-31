import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "No token. Send Authorization: Bearer <token>",
    });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    req.user = payload;
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token has expired. Log in again"
        : "Token is invalid";
    return res.status(401).json({ error: message });
  }

  next();
}
