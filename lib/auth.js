import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verifies the bearer token on a NextRequest. Returns the decoded payload,
// or throws an object with `status`/`message` for the caller to turn into
// a JSON error response.
export function requireAuth(req) {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw { status: 401, message: "No token provided" };
  }
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw { status: 401, message: "Invalid or expired token" };
  }
}
