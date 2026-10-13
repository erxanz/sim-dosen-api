// Middleware autentikasi/otorisasi SSO.
// Access token diterbitkan sim-mhs-api (issuer "sim-mhs-api", HS256,
// JWT_SECRET yang sama) sehingga sim-dosen-api cukup memverifikasinya
// secara stateless tanpa memanggil API lain.
import { verifyAccessToken } from "../config/jwt.js";

/** Error dengan status HTTP + pesan publik (ditangani src/middleware/error-handler.js). */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.publicMessage = message;
  return err;
}

/**
 * Middleware: wajib Authorization "Bearer <access token SSO>".
 * Berhasil → req.auth = { id, username, nama, role, scope }.
 */
export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization ?? "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw httpError(401, "Header Authorization dengan format Bearer <token> wajib ada");
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      if (err?.name === "TokenExpiredError") {
        throw httpError(401, "Token SSO sudah kedaluwarsa, lakukan login ulang di sim-mhs-api");
      }
      throw httpError(401, "Token SSO tidak valid");
    }

    if (payload.typ !== "access") {
      throw httpError(401, "Token bukan access token");
    }

    req.auth = {
      id: payload.sub,
      username: payload.username,
      nama: payload.nama,
      role: payload.role,
      scope: payload.scope ?? {},
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware: batasi berdasarkan kodeRole dari sim-mhs-api.
 * Dipanggil setelah authenticate. Tanpa argumen = semua role yang login boleh akses.
 */
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(httpError(401, "Belum terautentikasi"));
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.auth.role)) {
      return next(
        httpError(403, `Role ${req.auth.role} tidak memiliki akses ke resource ini`)
      );
    }
    next();
  };
}
