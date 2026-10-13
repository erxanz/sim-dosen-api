// Verifikasi JWT SSO yang diterbitkan oleh sim-mhs-api.
// Sim-mhs-api menandatangani access token dengan HS256 memakai JWT_SECRET
// yang sama dan issuer "sim-mhs-api" (lihat sim-mhs-api/src/config/jwt.js).
import "dotenv/config";
import jwt from "jsonwebtoken";

export const SSO_ISSUER = "sim-mhs-api";

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET belum diatur di .env. JWT_SECRET harus SAMA dengan nilai JWT_SECRET di sim-mhs-api agar token SSO bisa diverifikasi."
  );
}

/**
 * Verifikasi access token SSO dari sim-mhs-api.
 * Mengembalikan payload: { sub, username, nama, role, scope, typ, iat, exp }.
 * Melempar error bila token tidak valid / kedaluwarsa / issuer berbeda.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { issuer: SSO_ISSUER });
}
