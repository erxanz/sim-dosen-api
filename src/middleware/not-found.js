// Middleware untuk rute yang tidak ditemukan.
export default function notFound(_req, res) {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
}
