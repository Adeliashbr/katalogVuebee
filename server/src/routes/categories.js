import express from "express";
import { db } from "../db/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  const categories = db.getCategories();
  return res.json({
    success: true,
    data: categories,
  });
});

router.post("/", authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Nama Kategori wajib diisi" });
  }

  const existing = db
    .getCategories()
    .find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (existing) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Kategori dengan nama tersebut sudah ada",
      });
  }
  try {
    const newCat = db.addCategory(name.trim());
    res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: newCat,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Nama Kategori wajib diisi" });
  }

  try {
    const updated = db.updateCategory(id, name.trim());
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Kategori tidak ditemukan" });
    }
    res.json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const products = db.getProducts({ categoryId: id });

  if (products.length > 0) {
    return res.status(400).json({
      success: false,
      message: `tidak dapat menghapus kategori karena masih memiliki ${products.length} produk terkait.Hapus atau pindahkan produk terlebih dahulu.`,
    });
  }
  const deleted = db.deleteCategory(id);
  if (!deleted) {
    return res
      .status(404)
      .json({ success: false, message: "Kategori tidak ditemukan" });
  }

  res.json({
    success: true,
    message: "kategori berhasil dihapus",
  });
});

export default router;
