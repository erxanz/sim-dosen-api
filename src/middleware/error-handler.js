// Middleware penanganan error global.
// Tidak pernah membocorkan detail internal/database ke klien.

const PRISMA_ERRORS = {
  P2000: { status: 400, message: "Nilai terlalu panjang untuk kolom database" },
  P2002: { status: 409, message: "Data sudah ada (pelanggaran constraint unik)" },
  P2025: { status: 404, message: "Data tidak ditemukan" },
  P2021: { status: 500, message: "Tabel tidak ditemukan di database" },
  P2018: { status: 404, message: "Data tidak ditemukan" },
};

export default function errorHandler(err, _req, res, _next) {
  // Error JSON yang tidak valid dari body parser
  if (err?.type === "entity.parse.failed" || (err instanceof SyntaxError && "body" in err)) {
    return res.status(400).json({
      success: false,
      message: "Body JSON tidak valid",
    });
  }

  // Payload terlalu besar
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Payload terlalu besar",
    });
  }

  // Error Prisma yang sudah dikenal
  if (err?.code && PRISMA_ERRORS[err.code]) {
    const { status, message } = PRISMA_ERRORS[err.code];
    return res.status(status).json({ success: false, message });
  }

  // Error lain yang sudah membawa status HTTP (mis. dari middleware sendiri)
  const status = Number(err?.status || err?.statusCode);
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({
      success: false,
      message: err?.publicMessage || "Permintaan tidak valid",
    });
  }

  // Error tak dikenal: catat di server, kirim pesan generik ke klien.
  console.error("[error-handler]", err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
}
