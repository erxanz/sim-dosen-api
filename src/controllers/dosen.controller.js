// Controller CRUD untuk resource /api/dosen.
import prisma from "../config/database.js";
import { ok, fail } from "../utils/json.js";
import { sanitizeDosenInput, parseId } from "../utils/validate.js";
import {
  fetchDosenFromMhsApi,
  syncDosenWithDatabase,
} from "../services/mhs-sync.service.js";

/**
 * GET /api/dosen/mhs
 * Mengambil daftar pengguna ber-role DOSEN langsung dari sim-mhs-api (tanpa database lokal).
 */
export async function listDosenMhs(_req, res) {
  try {
    const data = await fetchDosenFromMhsApi();
    return ok(res, {
      message: "Daftar pengguna ber-role DOSEN dari sim-mhs-api",
      data,
    });
  } catch (err) {
    return fail(res, {
      status: 502,
      message: `Gagal mengambil data dari sim-mhs-api: ${err.message}`,
    });
  }
}

/**
 * POST /api/dosen/sync
 * Menyinkronkan daftar pengguna ber-role DOSEN dari sim-mhs-api ke database lokal.
 */
export async function syncDosen(_req, res) {
  try {
    const result = await syncDosenWithDatabase();
    return ok(res, {
      message: `Sinkronisasi berhasil: ${result.processedCount} data dosen diproses dari sim-mhs-api`,
      data: result,
    });
  } catch (err) {
    return fail(res, {
      status: 502,
      message: `Gagal sinkronisasi data dari sim-mhs-api: ${err.message}`,
    });
  }
}

/**
 * GET /api/dosen
 * Mengambil seluruh data dosen, diurutkan berdasarkan id menaik.
 * Jika terdapat query parameter ?sync=true, lakukan sinkronisasi dengan sim-mhs-api terlebih dahulu.
 */
export async function listDosen(req, res) {
  if (req.query?.sync === "true") {
    try {
      await syncDosenWithDatabase();
    } catch (e) {
      console.error("Auto-sync error:", e.message);
    }
  }

  const data = await prisma.dosen.findMany({ orderBy: { id: "asc" } });
  return ok(res, { message: "Daftar data dosen", data });
}

/**
 * GET /api/dosen/:id
 */
export async function getDosen(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return fail(res, { status: 400, message: "id harus berupa angka positif yang valid" });
  }

  const dosen = await prisma.dosen.findUnique({ where: { id } });
  if (!dosen) {
    return fail(res, { status: 404, message: `Dosen dengan id ${id} tidak ditemukan` });
  }

  return ok(res, { message: "Detail data dosen", data: dosen });
}

/**
 * POST /api/dosen
 * Hanya `nama` yang wajib diisi; kolom lain nullable.
 */
export async function createDosen(req, res) {
  const { data, errors } = sanitizeDosenInput(req.body, { requireNama: true });
  if (Object.keys(errors).length > 0) {
    return fail(res, { status: 400, message: "Validasi gagal", errors });
  }

  const dosen = await prisma.dosen.create({ data });
  return ok(res, { status: 201, message: "Data dosen berhasil dibuat", data: dosen });
}

/**
 * PUT /api/dosen/:id
 * Partial update: field yang tidak dikirim tidak diubah.
 */
export async function updateDosen(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return fail(res, { status: 400, message: "id harus berupa angka positif yang valid" });
  }

  const { data, errors } = sanitizeDosenInput(req.body);
  if (Object.keys(errors).length > 0) {
    return fail(res, { status: 400, message: "Validasi gagal", errors });
  }
  if (Object.keys(data).length === 0) {
    return fail(res, { status: 400, message: "Tidak ada field yang bisa diperbarui" });
  }

  const existing = await prisma.dosen.findUnique({ where: { id } });
  if (!existing) {
    return fail(res, { status: 404, message: `Dosen dengan id ${id} tidak ditemukan` });
  }

  const dosen = await prisma.dosen.update({ where: { id }, data });
  return ok(res, { message: "Data dosen berhasil diperbarui", data: dosen });
}

/**
 * DELETE /api/dosen/:id
 */
export async function deleteDosen(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return fail(res, { status: 400, message: "id harus berupa angka positif yang valid" });
  }

  const existing = await prisma.dosen.findUnique({ where: { id } });
  if (!existing) {
    return fail(res, { status: 404, message: `Dosen dengan id ${id} tidak ditemukan` });
  }

  await prisma.dosen.delete({ where: { id } });
  return ok(res, { message: "Data dosen berhasil dihapus", data: { id: id.toString() } });
}
