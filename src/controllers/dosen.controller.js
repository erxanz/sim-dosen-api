// Controller CRUD untuk resource /api/dosen.
import prisma from "../config/database.js";
import { ok, fail } from "../utils/json.js";
import { sanitizeDosenInput, parseId } from "../utils/validate.js";

/**
 * GET /api/dosen
 * Mengambil seluruh data dosen, diurutkan berdasarkan id menaik.
 */
export async function listDosen(_req, res) {
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
