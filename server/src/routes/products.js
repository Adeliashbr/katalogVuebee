import express from "express";
import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { db } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExt = /\.(jpeg|jpg|png|webp|gif)$/i;
    const allowedMime = /^image\/(jpeg|jpg|png|webp|gif)$/i;
    const extOk = allowedExt.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowedMime.test(file.mimetype);
    if (extOk && mimeOk) {
      return cb(null, true);
    }
    cb(new Error("format file tidak didukung! Hanya Gambar JPEG,PNG,WEBP,GIF"));
  },
});

const router = express.Router();

router.get("/", (req, res) => {
  const { categoryId, search, stockStatus } = req.query;
  const products = db.getProducts({ categoryId, search, stockStatus });

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

router.get("/:id", (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "produk tidak ditemukan" });
  }
  res.json({ success: true, data: product });
});

router.post("/", authenticateToken, upload.single("photo"), (req, res) => {
  const { name, categoryId, price, stockStatus, description, imageUrl } =
    req.body;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "nama produk wajib diisi" });
  }
  if (!categoryId) {
    return res
      .status(400)
      .json({ success: false, message: "kategori produk wajib diisi" });
  }
  if (price === undefined || price === '' || isNaN(price) || Number(price) < 0) {
    return res
      .status(400)
      .json({ success: false, message: "harga produk harus angka positif" });
  }

  let finalImage = imageUrl;
  if (req.file) {
    finalImage = `/uploads/${req.file.filename}`;
  }

  const newProduct = db.addProduct({
    name: name.trim(),
    categoryId,
    price: Number(price),
    stockStatus: stockStatus || "Tersedia",
    description: description ? description.trim() : "",
    image: finalImage || "",
  });

  res.status(201).json({
    success: true,
    message: "produk berhasil ditambahkan",
    data: newProduct,
  });
});

router.put("/:id", authenticateToken, upload.single("photo"), (req, res) => {
  const { id } = req.params;
  const { name, categoryId, price, stockStatus, description, imageUrl } =
    req.body;

  const existing = db.getProductById(id);
  if (!existing) {
    return res
      .status(404)
      .json({ success: false, message: "produk tidak ditemukan" });
  }

  if (
    price !== undefined &&
    (price === '' || isNaN(price) || Number(price) < 0)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "harga produk harus angka positif" });
  }

  const updatePayload = {};
  if (name !== undefined) updatePayload.name = name.trim();
  if (categoryId !== undefined) updatePayload.categoryId = categoryId.trim();
  if (price !== undefined) updatePayload.price = Number(price);
  if (stockStatus !== undefined) updatePayload.stockStatus = stockStatus;
  if (description !== undefined) updatePayload.description = description.trim();

  if (req.file) {
    updatePayload.image = `/uploads/${req.file.filename}`;
  } else if (imageUrl !== undefined && imageUrl.trim()) {
    updatePayload.image = imageUrl.trim();
  }

  const updated = db.updateProduct(id, updatePayload);

  res.json({
    success: true,
    message: "produk berhasil diperbarui",
    data: updated,
  });
});

router.patch("/:id/stock", authenticateToken, (req, res) => {
  const { id } = req.params;
  const updated = db.toggleStock(id);

  if (!updated) {
    return res
      .status(404)
      .json({ success: false, message: "produk tidak ditemukan" });
  }
  res.json({
    success: true,
    message: `status stok diubah menjadi : ${updated.stockStatus}`,
    data: updated,
  });
});

router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteProduct(id);

  if (!deleted) {
    return res
      .status(404)
      .json({ success: false, message: "produk tidak ditemukan" });
  }

  res.json({
    success: true,
    message: "produk berhasil dihapus",
  });
});

// Tangkap error multer (file terlalu besar / format tidak didukung)
// agar client menerima JSON, bukan halaman HTML error.
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "ukuran file terlalu besar! Maksimal 5 MB"
          : err.message || "upload gagal",
    });
  }
  if (err && err.message && err.message.startsWith("format file")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  return res.status(500).json({
    success: false,
    message: err?.message || "terjadi kesalahan server",
  });
});

export default router;
