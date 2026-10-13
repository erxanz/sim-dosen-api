import { ok, fail } from "../utils/json.js";
import { generateAccessToken } from "../config/jwt.js";

// Daftar kredensial pengguna terdaftar untuk autentikasi sistem
const USERS = [
  {
    id: 1,
    username: "admin",
    password: ["Admin123!", "admin"],
    nama: "Administrator SIM Dosen",
    role: "ADMIN",
    scope: { idUniversitas: 1 },
  },
  {
    id: 2,
    username: "baak",
    password: ["Baak123!", "baak"],
    nama: "Staf BAAK",
    role: "BAAK",
    scope: { idUniversitas: 1, idFakultas: 1 },
  },
  {
    id: 3,
    username: "dosen",
    password: ["Dosen123!", "dosen"],
    nama: "Prof. Dr. Bambang Suryanto, M.Pd.",
    nip: "197001011995011001",
    role: "DOSEN",
    scope: { idUniversitas: 1, idFakultas: 1, idProgramStudi: 1 },
  },
  {
    id: 4,
    username: "sitiaminah",
    password: ["Dosen123!", "dosen"],
    nama: "Dr. Siti Aminah, S.Kom., M.T.",
    nip: "198002022005012002",
    role: "DOSEN",
    scope: { idUniversitas: 1, idFakultas: 2, idProgramStudi: 2 },
  },
  {
    id: 5,
    username: "mahasiswa",
    password: ["Mhs123!", "mahasiswa"],
    nama: "Ahmad Fauzi (Mahasiswa)",
    role: "MAHASISWA",
    scope: { idUniversitas: 1, idFakultas: 1, idProgramStudi: 1 },
  },
  {
    id: 6,
    username: "dosen01",
    password: ["Dosen123!", "dosen01", "dosen", "12345678", "password"],
    nama: "Dr. Dosen Satu, M.Kom.",
    nip: "198501012010011005",
    role: "DOSEN",
    scope: { idUniversitas: 1, idFakultas: 1, idProgramStudi: 1 },
  },
];

/**
 * POST /api/auth/login
 * Memvalidasi kredensial pengguna dan menerbitkan JWT access token SSO.
 */
export async function login(req, res) {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return fail(res, {
      status: 400,
      message: "Username dan password wajib diisi",
      errors: {
        ...(!username && { username: "username wajib diisi" }),
        ...(!password && { password: "password wajib diisi" }),
      },
    });
  }

  const uName = String(username).trim().toLowerCase();
  const pass = String(password);

  const foundUser = USERS.find((u) => {
    if (u.username.toLowerCase() !== uName) return false;
    return Array.isArray(u.password) ? u.password.includes(pass) : u.password === pass;
  });

  if (!foundUser) {
    return fail(res, {
      status: 401,
      message: "Username atau password salah",
    });
  }

  // Terbitkan access token JWT yang valid
  const token = generateAccessToken(foundUser, "2h");

  return ok(res, {
    message: "Login berhasil",
    data: {
      accessToken: token,
      user: {
        id: foundUser.id,
        username: foundUser.username,
        nama: foundUser.nama,
        nip: foundUser.nip || null,
        role: foundUser.role,
        scope: foundUser.scope,
      },
    },
  });
}

/**
 * GET /api/auth/me
 * Mengambil informasi user dari token yang sedang aktif.
 */
export async function getProfile(req, res) {
  return ok(res, {
    message: "Informasi pengguna aktif",
    data: req.auth,
  });
}
