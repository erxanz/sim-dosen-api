# SIM Dosen API

REST API untuk Sistem Informasi Manajemen Dosen. Dibangun dengan **Node.js**, **Express 5**, **Prisma ORM 7**, **PostgreSQL (Neon)**, JavaScript **ES Modules**, dan **dotenv**.

## Daftar Isi

- [Fitur](#fitur)
- [Prasyarat](#prasyarat)
- [Setup Database Neon](#setup-database-neon)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Instalasi & Generate Prisma Client](#instalasi--generate-prisma-client)
- [Migrasi Database](#migrasi-database)
- [Seed Data](#seed-data)
- [Menjalankan Server](#menjalankan-server)
- [Daftar Endpoint](#daftar-endpoint)
- [Pengujian dengan curl](#pengujian-dengan-curl)
- [Struktur Proyek](#struktur-proyek)
- [Catatan Prisma ORM v7](#catatan-prisma-orm-v7)

## Fitur

- CRUD lengkap untuk data dosen (`GET`, `POST`, `PUT`, `DELETE`)
- Health check `GET /api/health` yang benar-benar mengecek koneksi database
- Validasi input (field wajib, panjang maksimal sesuai kolom, field tidak dikenal)
- Respons JSON yang konsisten: `{ success, message, data }`
- Penanganan `BigInt` saat serialisasi JSON (kolom `id` dikirim sebagai string)
- Error handling global yang **tidak membocorkan detail database**
- Seed idempotent berbasis kunci unik `nomor_registrasi`

## Prasyarat

- Node.js >= 20 (dikembangkan dan diuji di Node.js 24)
- npm
- Akun [Neon](https://neon.tech) (PostgreSQL serverless) atau PostgreSQL lain

## Setup Database Neon

1. Buat project di [Neon Console](https://console.neon.tech).
2. Buat database, misalnya `neondb`.
3. Buka **Connection Details** dan salin *pooled connection string* (host berakhiran `-pooler`) untuk `DATABASE_URL`.
4. Salin juga *direct connection string* (host **tanpa** `-pooler`) untuk `DIRECT_URL`. Direct connection dipakai Prisma CLI saat migrasi karena memerlukan koneksi non-transaksional.

> Kredensial jangan pernah di-commit. Semua rahasia hanya hidup di file `.env` yang di-ignore git.

Skema SQL referensi tersimpan di `sim_dosen.sql` (kolom tabel `dosen` yang menjadi acuan `prisma/schema.prisma`).

## Konfigurasi Environment

Salin `.env.example` menjadi `.env`, lalu isi nilainya:

```bash
cp .env.example .env
```

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | Koneksi aplikasi (boleh pooled / berakhiran `-pooler`) |
| `DIRECT_URL` | Opsional | Koneksi langsung untuk migrasi Prisma. Bila kosong, `prisma7.config.ts` memakai `DATABASE_URL` |
| `PORT` | Opsional | Port HTTP server (default `3000`) |
| `NODE_ENV` | Opsional | `development` / `production` |
| `CORS_ORIGIN` | Opsional | Origin yang diizinkan (default `*`) |

## Instalasi & Generate Prisma Client

```bash
npm install
npm run prisma:generate   # = prisma generate
```

`prisma generate` membaca `prisma/schema.prisma` lalu menghasilkan Prisma Client ke folder `generated/prisma/` (di-ignore git). Jalankan ulang setiap kali schema berubah.

## Migrasi Database

```bash
# Buat + terapkan migrasi baru (interaktif, untuk pengembangan)
npm run db:migrate -- --name init

# Terapkan migrasi yang sudah ada tanpa membuat baru (untuk produksi/CI)
npm run db:deploy

# Cek status migrasi
npx prisma migrate status

# Browse data di browser
npm run db:studio
```

Migrasi yang sudah dibuat tersimpan di `prisma/migrations/`. **Jangan pernah** menjalankan `prisma migrate reset` atau `prisma db push --force-reset` terhadap database berisi data produksi.

### Bila tabel `dosen` sudah ada sebelum migrasi (baseline)

Jika database sudah punya tabel `dosen` (misalnya dibuat dari `sim_dosen.sql`) dan belum tercatat di `_prisma_migrations`, lakukan baseline aman berikut:

```bash
# 1. Buat SQL migrasi dari schema (tanpa menjalankannya)
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql

# 2. Tandai migrasi itu sebagai sudah diterapkan
npx prisma migrate resolve --applied 0_init

# 3. Sisa perubahan (mis. index unik) diterapkan normal
npm run db:deploy
```

## Seed Data

```bash
npm run db:seed   # = prisma db seed -> node prisma/seed.js
```

Seed berisi 5 data dosen dummy dan **aman dijalankan berulang kali**: setiap baris di-upsert berdasarkan kolom unik `nomor_registrasi`, tidak ada data yang dihapus atau ditimpa. Menambahkan index unik `dosen_nomor_registrasi_key` pada kolom `nomor_registrasi` (NULL tetap diperbolehkan ganda, sesuai aturan PostgreSQL).

## Menjalankan Server

```bash
npm run dev    # development, auto-reload via nodemon
npm start      # production, node src/server.js
```

Server berjalan di `http://localhost:<PORT>/api` (default `http://localhost:3000/api`).

## Daftar Endpoint

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/health` | Health check + koneksi database |
| GET | `/api/dosen` | Ambil semua data dosen |
| GET | `/api/dosen/:id` | Ambil satu data dosen |
| POST | `/api/dosen` | Tambah data dosen (hanya `nama` wajib) |
| PUT | `/api/dosen/:id` | Perbarui data dosen (partial update) |
| DELETE | `/api/dosen/:id` | Hapus data dosen |

Kode status yang dipakai: `200` OK, `201` Created, `400` validasi gagal / id tidak valid / JSON rusak, `404` tidak ditemukan, `409` duplikat (`nomor_registrasi` unik), `413` payload terlalu besar, `500` kesalahan server (pesan generik).

Format sukses:

```json
{ "success": true, "message": "Daftar data dosen", "data": [] }
```

Format gagal:

```json
{ "success": false, "message": "Validasi gagal", "errors": { "nama": "nama wajib diisi" } }
```

Field yang tersedia pada resource dosen: `nomor_registrasi`, `nuptk`, `nama`, `nip`, `jabatan_fungsional`, `kepangkatan`, `pendidikan_terakhir`, `rumpun_ilmu`, `status_serdos`, `status_pegawai`, `ikatan_kerja`, `status_aktivitas`, `penempatan`. Selain `id` dan `nama`, semua kolom nullable.

## Pengujian dengan curl

```bash
BASE=http://localhost:3000/api

# Health check
curl -s $BASE/health

# Ambil semua data
curl -s $BASE/dosen

# Ambil satu data (id dikirim sebagai string karena BigInt)
curl -s $BASE/dosen/1

# Tambah data
curl -s -X POST $BASE/dosen \
  -H 'Content-Type: application/json' \
  -d '{"nama":"Dr. Contoh, M.T.","nomor_registrasi":"REG-2026-0099","penempatan":"Fakultas Teknik"}'

# Perbarui data (partial)
curl -s -X PUT $BASE/dosen/1 \
  -H 'Content-Type: application/json' \
  -d '{"jabatan_fungsional":"Lektor Kepala","status_aktivitas":"Aktif"}'

# Hapus data
curl -s -X DELETE $BASE/dosen/1

# Kasus gagal (validasi)
curl -s -X POST $BASE/dosen -H 'Content-Type: application/json' -d '{"nomor_registrasi":"X"}'
```

## Struktur Proyek

```text
.
├── prisma/
│   ├── migrations/          # Migration SQL yang sudah diterapkan
│   ├── schema.prisma        # Skema tabel `dosen`
│   └── seed.js              # Seed idempotent (ES Modules)
├── prisma7.config.ts        # Konfigurasi Prisma ORM v7 (wajib di v7)
├── src/
│   ├── app.js               # Konfigurasi Express (cors, json, routes)
│   ├── server.js            # Entry point + graceful shutdown
│   ├── config/database.js   # PrismaClient + driver adapter @prisma/adapter-pg
│   ├── controllers/dosen.controller.js
│   ├── middleware/
│   │   ├── error-handler.js # Error global tanpa bocoran detail DB
│   │   └── not-found.js
│   ├── routes/
│   │   ├── index.js         # /api/health + mount /api/dosen
│   │   └── dosen.routes.js
│   └── utils/
│       ├── json.js          # Serialisasi BigInt + helper respons
│       └── validate.js      # Validasi input dosen
├── sim_dosen.sql            # Skema SQL referensi
├── .env.example
└── package.json
```

## Catatan Prisma ORM v7

Proyek ini mengikuti perubahan besar Prisma ORM v7:

1. **`prisma7.config.ts`** menggantikan field `prisma` di `package.json`. Prisma v7 tidak lagi memuat `.env` otomatis, karena itu `import "dotenv/config"` ada di bagian atas konfigurasi.
2. **Driver adapter wajib.** Prisma v7 memakai query compiler berbasis JavaScript (tanpa binary engine), sehingga Prisma Client dibuat bersama `@prisma/adapter-pg` yang memakai `pg`:
   ```js
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   const prisma = new PrismaClient({ adapter });
   ```
3. **`directUrl` sudah dihapus.** Prisma v7 memakai satu `datasource.url` di `prisma7.config.ts`; proyek ini mengisinya dengan `DIRECT_URL || DATABASE_URL` sehingga migrasi memakai koneksi langsung bila tersedia, sedangkan aplikasi tetap memakai `DATABASE_URL`.
4. **Generator `prisma-client-js`.** Generator baru `prisma-client` Prisma v7 menghasilkan berkas TypeScript (bahkan dengan ekstensi `.js`) sehingga tidak bisa di-import Node ESM murni tanpa transpilasi. Karena proyek ini berupa JavaScript ES Modules, generator `prisma-client-js` dipakai untuk menghasilkan JS murni ke `generated/prisma/`.
5. **`npm run db:migrate -- --name init`** mendukung penambahan `--name <nama>` karena `npm` meneruskan argumen tambahan ke Prisma CLI.
