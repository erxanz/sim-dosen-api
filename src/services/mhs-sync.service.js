// Service untuk integrasi dan sinkronisasi data Pengguna ber-role DOSEN dari sim-mhs-api
import "dotenv/config";
import prisma from "../config/database.js";
import { generateAccessToken } from "../config/jwt.js";
import { toPlain } from "../utils/json.js";

const MHS_API_URL = process.env.SIM_MHS_API_URL || "https://sim-mhs-api.vercel.app/api/v1";

/**
 * Mengambil seluruh data pengguna yang memiliki role DOSEN langsung dari sim-mhs-api
 */
export async function fetchDosenFromMhsApi() {
  // Dapatkan system token internal ber-role ADMIN agar diizinkan membaca endpoint /pengguna
  const systemToken = generateAccessToken({
    id: 1,
    username: "sim-dosen-sync-service",
    nama: "SIM Dosen Sync Engine",
    role: "ADMIN",
    scope: { idUniversitas: 1 },
  });

  const response = await fetch(`${MHS_API_URL}/pengguna?limit=100`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${systemToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gagal menghubungi sim-mhs-api (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const allUsers = Array.isArray(result?.data) ? result.data : [];

  // Filter hanya pengguna yang memiliki role DOSEN (kodeRole: "DOSEN")
  const dosenUsers = allUsers.filter(
    (u) => u.role?.kodeRole === "DOSEN" || u.kodeRole === "DOSEN" || u.role === "DOSEN"
  );

  return dosenUsers.map((user) => {
    const nama = user.namaLengkap || user.nama || user.username;
    const penempatan = [
      user.fakultas?.namaFakultas,
      user.programStudi?.namaProgramStudi,
    ]
      .filter(Boolean)
      .join(" - ");

    return {
      mhs_id: user.id,
      username: user.username,
      nama: nama,
      nip: user.nip || null,
      email: user.email || null,
      role: user.role?.kodeRole || "DOSEN",
      fakultas: user.fakultas?.namaFakultas || null,
      program_studi: user.programStudi?.namaProgramStudi || null,
      penempatan: penempatan || null,
      status_aktivitas: user.statusAktif || "Aktif",
    };
  });
}

/**
 * Menyinkronkan daftar pengguna role DOSEN dari sim-mhs-api ke tabel database `dosen`
 * Menggunakan pendekatan Upsert cerdas agar data portofolio akademik tidak terhapus.
 */
export async function syncDosenWithDatabase() {
  const dosenList = await fetchDosenFromMhsApi();
  const results = [];

  for (const item of dosenList) {
    const nomorRegistrasi = `REG-UMB-${item.username.toUpperCase()}`;

    // Cari apakah dosen sudah ada di database lokal
    const existing = await prisma.dosen.findFirst({
      where: {
        OR: [
          { nomor_registrasi: nomorRegistrasi },
          { nama: item.nama },
          ...(item.nip ? [{ nip: item.nip }] : []),
        ],
      },
    });

    if (existing) {
      // Perbarui nama, penempatan, dan status jika ada perubahan di sim-mhs-api
      // Jangan timpa jabatan_fungsional, kepangkatan, pendidikan_terakhir, atau status_serdos yang sudah diedit
      const updated = await prisma.dosen.update({
        where: { id: existing.id },
        data: {
          nama: item.nama,
          penempatan: item.penempatan || existing.penempatan,
          status_aktivitas: item.status_aktivitas || existing.status_aktivitas,
          ...(item.nip && !existing.nip ? { nip: item.nip } : {}),
        },
      });
      results.push({ action: "updated", dosen: updated });
    } else {
      // Buat data dosen baru dari akun sim-mhs-api
      const created = await prisma.dosen.create({
        data: {
          nomor_registrasi: nomorRegistrasi,
          nama: item.nama,
          nip: item.nip || null,
          penempatan: item.penempatan,
          status_aktivitas: item.status_aktivitas,
          status_pegawai: "Dosen Tetap",
          ikatan_kerja: "Permanen",
          status_serdos: "Proses",
          pendidikan_terakhir: item.program_studi?.includes("S1") ? "S2" : "S3",
        },
      });
      results.push({ action: "created", dosen: created });
    }
  }

  return {
    totalFromMhsApi: dosenList.length,
    processedCount: results.length,
    details: toPlain(results),
  };
}
