// Validasi input sederhana tanpa dependency tambahan.

// Batas panjang harus sama dengan definisi kolom di prisma/schema.prisma.
export const DOSEN_FIELDS = {
  nomor_registrasi: 50,
  nuptk: 30,
  nama: 150,
  nip: 30,
  jabatan_fungsional: 100,
  kepangkatan: 100,
  pendidikan_terakhir: 100,
  rumpun_ilmu: 150,
  status_serdos: 50,
  status_pegawai: 50,
  ikatan_kerja: 100,
  status_aktivitas: 50,
  penempatan: 150,
};

const ID_MAX = 9223372036854775807n; // BIGINT (8 byte) di PostgreSQL

/**
 * Memilih hanya field yang dikenal, membuang nilai kosong (diubah jadi null),
 * dan memvalidasi panjang maksimal. Mengembalikan { data, errors }.
 */
export function sanitizeDosenInput(body, { requireNama = false } = {}) {
  const data = {};
  const errors = {};

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { data, errors: { _body: "Body harus berupa objek JSON" } };
  }

  for (const key of Object.keys(body)) {
    if (!(key in DOSEN_FIELDS)) {
      errors[key] = "Field tidak dikenal";
      continue;
    }

    const value = body[key];
    if (value === undefined || value === null || value === "") {
      if (requireNama && key === "nama") {
        errors.nama = "nama wajib diisi";
      } else {
        data[key] = null; // nullable: "" dan null diseragamkan jadi null
      }
      continue;
    }

    if (typeof value !== "string") {
      errors[key] = `${key} harus berupa teks`;
      continue;
    }

    const trimmed = value.trim();
    if (trimmed === "") {
      if (requireNama && key === "nama") errors.nama = "nama wajib diisi";
      else data[key] = null;
      continue;
    }

    if (trimmed.length > DOSEN_FIELDS[key]) {
      errors[key] = `${key} maksimal ${DOSEN_FIELDS[key]} karakter`;
      continue;
    }

    data[key] = trimmed;
  }

  if (requireNama && errors.nama === undefined && data.nama === undefined) {
    errors.nama = "nama wajib diisi";
  }

  return { data, errors };
}

/** Parse :id menjadi BigInt, atau null bila bukan angka positif yang valid. */
export function parseId(raw) {
  if (typeof raw !== "string" || !/^\d{1,19}$/.test(raw)) return null;
  const value = BigInt(raw);
  if (value < 1n || value > ID_MAX) return null;
  return value;
}
