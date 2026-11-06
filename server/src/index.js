import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import storeRoutes from "./routes/store.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS "],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadPath));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/stores", storeRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "KatalogVuebee API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to KatalogVuebee API",
    endpoints: {
      auth: "/api/auth",
      categories: "/api/categories",
      products: "/api/products",
      store: "/api/store",
      stores: "/api/stores",
      health: "/api/health",
    },
  });
});

// JSON 404 untuk route /api yang tidak dikenal (hindari HTML default).
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "endpoint tidak ditemukan",
  });
});

// Error handler JSON global (mis. body JSON tidak valid, error tak terduga).
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err && err.status ? err.status : 500;
  res.status(status).json({
    success: false,
    message: err?.message || "terjadi kesalahan server",
  });
});

app.listen(port, () => {
  console.log(
    `Server Vuebee is running on http://localhost:${port}`,
  );
});
