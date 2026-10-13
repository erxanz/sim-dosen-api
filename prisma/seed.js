// Seed data dummy dosen.
// Idempotent: baris di-upsert berdasarkan `nomor_registrasi` (constraint unik),
// sehingga aman dijalankan berulang kali tanpa duplikasi dan tanpa menghapus data.
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur di file .env");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const dosenList = [
  {
    nomor_registrasi: "REG-2026-0001",
    nuptk: "197001011995011001",
    nama: "Prof. Dr. Bambang Suryanto, M.Pd.",
    nip: "197001011995011001",
    jabatan_fungsional: "Guru Besar",
    kepangkatan: "Utama IV/c",
    pendidikan_terakhir: "S3",
    rumpun_ilmu: "Pendidikan",
    status_serdos: "Lulus",
    status_pegawai: "PNS",
    ikatan_kerja: "Permanen",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Keguruan dan Ilmu Pendidikan",
  },
  {
    nomor_registrasi: "REG-2026-0002",
    nuptk: "198002022005012002",
    nama: "Dr. Siti Aminah, S.Kom., M.T.",
    nip: "198002022005012002",
    jabatan_fungsional: "Lektor Kepala",
    kepangkatan: "Muda III/d",
    pendidikan_terakhir: "S3",
    rumpun_ilmu: "Ilmu Komputer",
    status_serdos: "Proses",
    status_pegawai: "PNS",
    ikatan_kerja: "Permanen",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Teknik",
  },
  {
    nomor_registrasi: "REG-2026-0003",
    nuptk: "198503032010121003",
    nama: "Ahmad Fauzi, S.E., M.M.",
    nip: "198503032010121003",
    jabatan_fungsional: "Lektor",
    kepangkatan: "Muda II/b",
    pendidikan_terakhir: "S2",
    rumpun_ilmu: "Ekonomi dan Bisnis",
    status_serdos: "Belum",
    status_pegawai: "PPK / Honorer",
    ikatan_kerja: "Kontrak",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Ekonomi dan Bisnis",
  },
  {
    nomor_registrasi: "REG-2026-0004",
    nuptk: "199004042015032004",
    nama: "Rina Wulandari, S.Pd., M.Pd.",
    nip: null,
    jabatan_fungsional: "Asisten Ahli",
    kepangkatan: "Penata Muda I/a",
    pendidikan_terakhir: "S2",
    rumpun_ilmu: "Bahasa",
    status_serdos: "Belum",
    status_pegawai: "Non-PNS",
    ikatan_kerja: "PKWT",
    status_aktivitas: "Cuti",
    penempatan: "Fakultas Ilmu Budaya",
  },
  {
    nomor_registrasi: "REG-2026-0005",
    nuptk: null,
    nama: "Drs. H. Muhammad Yusuf, M.Si.",
    nip: "196812121994031005",
    jabatan_fungsional: "Lektor Kepala",
    kepangkatan: "Utama III/e",
    pendidikan_terakhir: "S2",
    rumpun_ilmu: "Sains dan Matematika",
    status_serdos: "Lulus",
    status_pegawai: "PNS",
    ikatan_kerja: "Permanen",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Matematika dan Ilmu Pengetahuan Alam",
  },
];

async function main() {
  for (const dosen of dosenList) {
    const { nomor_registrasi } = dosen;
    // Upsert berdasarkan kunci unik `nomor_registrasi`:
    // - baris baru dibuat,
    // - baris existing tidak ditimpa (`update: {}`),
    // sehingga seed aman dijalankan berulang kali tanpa duplikasi.
    await prisma.dosen.upsert({
      where: { nomor_registrasi },
      update: {},
      create: dosen,
    });
  }

  const total = await prisma.dosen.count();
  console.log(
    `Seed selesai. Memproses ${dosenList.length} baris; total data dosen di database: ${total}.`
  );
}

main()
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
