import { createHash, randomBytes } from "node:crypto";

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(sessionToken: string) {
  return createHash("sha256").update(sessionToken).digest("hex");
}

export function extractBearerToken(authorizationHeader?: string | string[]) {
  const header = Array.isArray(authorizationHeader)
    ? authorizationHeader[0]
    : authorizationHeader;

  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}
