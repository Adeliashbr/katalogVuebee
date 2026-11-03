import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { authenticateToken, JWT_SECRET } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi",
    });
  }

  const admin = db.getAdmin();

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Admin tidak ditemukan",
    });
  }

  if (email.trim().toLowerCase() !== admin.email.toLowerCase()) {
    return res.status(401).json({
      success: false,
      message: "Email atau password salah",
    });
  }

  const isMatch = bcrypt.compareSync(password, admin.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Email atau password salah",
    });
  }

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );

  return res.json({
    success: true,
    message: "Login berhasil",
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
  });
});

export default router;
