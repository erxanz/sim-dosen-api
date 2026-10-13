// Konfigurasi Express app (tanpa binding port).
import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
