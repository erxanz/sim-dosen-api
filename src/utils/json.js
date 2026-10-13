// Utilitas serialisasi JSON yang aman untuk tipe BigInt (kolom id BigInt).
// JSON.stringify menolak BigInt, jadi nilainya dikonversi menjadi string.

export function toPlain(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, val) =>
      typeof val === "bigint" ? val.toString() : val
    )
  );
}

export function ok(res, { status = 200, message = "OK", data = null }) {
  const body = { success: true, message };
  if (data !== null) body.data = toPlain(data);
  return res.status(status).json(body);
}

export function fail(res, { status = 400, message = "Permintaan tidak valid", errors = undefined }) {
  const body = { success: false, message };
  if (errors && Object.keys(errors).length > 0) body.errors = errors;
  return res.status(status).json(body);
}
