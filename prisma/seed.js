// Seed data dosen resmi dari SIM Mahasiswa (role DOSEN).
// Idempotent: baris di-upsert berdasarkan `nomor_registrasi` (constraint unik),
// sehingga aman dijalankan berulang kali tanpa duplikasi.
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
    nomor_registrasi: "REG-UMB-DOSEN01",
    nuptk: "197801012003121001",
    nama: "Dr. Budi Santoso, M.Kom.",
    nip: "197801012003121001",
    jabatan_fungsional: "Lektor Kepala",
    kepangkatan: "Pembina IV/a",
    pendidikan_terakhir: "S3",
    rumpun_ilmu: "Teknik Informatika",
    status_serdos: "Lulus",
    status_pegawai: "Dosen Tetap",
    ikatan_kerja: "Permanen",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Teknik - Teknik Informatika",
  },
  {
    nomor_registrasi: "REG-UMB-DOSEN02",
    nuptk: "198205152008122002",
    nama: "Dr. Ir. Siti Nurhaliza, M.T.",
    nip: "198205152008122002",
    jabatan_fungsional: "Lektor Kepala",
    kepangkatan: "Penata Tk. I III/d",
    pendidikan_terakhir: "S3",
    rumpun_ilmu: "Teknik Informatika",
    status_serdos: "Lulus",
    status_pegawai: "Dosen Tetap",
    ikatan_kerja: "Permanen",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Teknik - Teknik Informatika",
  },
  {
    nomor_registrasi: "REG-UMB-DOSEN03",
    nuptk: "198708202014041003",
    nama: "Ahmad Fauzi, S.Kom., M.Cs.",
    nip: "198708202014041003",
    jabatan_fungsional: "Lektor",
    kepangkatan: "Penata III/c",
    pendidikan_terakhir: "S2",
    rumpun_ilmu: "Teknik Informatika",
    status_serdos: "Proses",
    status_pegawai: "Dosen Tetap",
    ikatan_kerja: "Permanen",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Teknik - Teknik Informatika",
  },
  {
    nomor_registrasi: "REG-UMB-DOSEN04",
    nuptk: "198511102010122004",
    nama: "Dr. Maya Indah, S.E., M.M.",
    nip: "198511102010122004",
    jabatan_fungsional: "Lektor Kepala",
    kepangkatan: "Pembina IV/a",
    pendidikan_terakhir: "S3",
    rumpun_ilmu: "Manajemen",
    status_serdos: "Lulus",
    status_pegawai: "Dosen Tetap",
    ikatan_kerja: "Permanen",
    status_aktivitas: "Aktif",
    penempatan: "Fakultas Ekonomi dan Bisnis - Manajemen",
  },
];

async function main() {
  for (const dosen of dosenList) {
    const { nomor_registrasi } = dosen;
    await prisma.dosen.upsert({
      where: { nomor_registrasi },
      update: {
        nama: dosen.nama,
        penempatan: dosen.penempatan,
      },
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
