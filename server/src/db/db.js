import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_FILE = path.join(__dirname, "katalogwa.sqlite");

class SqliteDatabase {
  constructor() {
    this.db = new DatabaseSync(SQLITE_FILE);
    this.initTables();
    this.seedInitialData();
  }

  initTables() {
    // Enable foreign keys
    this.db.exec("PRAGMA foreign_keys = ON;");

    // 1. Categories Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Products Table (Relational with Foreign Key to categories)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        price INTEGER NOT NULL,
        stock_status TEXT NOT NULL DEFAULT 'Tersedia',
        description TEXT,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Settings Key-Value Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 4. Admin Authentication Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_status);
    `);
  }

  seedInitialData() {
    // Hapus data lama yang tidak relevan dan isi ulang dengan katalog baru.
    // Versi seed: jika bukan versi terbaru, bersihkan produk & kategori lama.
    const SEED_VERSION = "v2-relevant-2026";
    const seedRow = this.db
      .prepare("SELECT value FROM settings WHERE key = 'seedVersion' LIMIT 1")
      .get();
    if (!seedRow || seedRow.value !== SEED_VERSION) {
      this.db.exec("DELETE FROM products;");
      this.db.exec("DELETE FROM categories;");
      this.db
        .prepare(
          "INSERT INTO settings (key, value) VALUES ('seedVersion', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        )
        .run(SEED_VERSION);
    }

    // Seed Settings
    const existingSettings = this.db
      .prepare("SELECT COUNT(*) AS count FROM settings")
      .get();
    if (existingSettings.count <= 1) {
      const insertSetting = this.db.prepare(
        "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      );
      insertSetting.run("storeName", "Toko Vuebee");
      insertSetting.run("tagline", "Minimalist Luxury Skincare & Makeup");
      insertSetting.run("phone", "6282298656732");
      insertSetting.run("address", "Jakarta Selatan, Indonesia");
      insertSetting.run("currency", "Rp");
    }

    // Perbaiki setting lama yang masih kosong agar katalog tidak kosong
    this.db
      .prepare("UPDATE settings SET value = ? WHERE key = 'tagline' AND (value = '' OR value IS NULL)")
      .run("Minimalist Luxury Skincare & Makeup");
    this.db
      .prepare("UPDATE settings SET value = ? WHERE key = 'phone' AND (value = '' OR value IS NULL)")
      .run("6282298656732");
    this.db
      .prepare("UPDATE settings SET value = ? WHERE key = 'address' AND (value = '' OR value IS NULL)")
      .run("Jakarta Selatan, Indonesia");

    // Seed Admin
    const existingAdmin = this.db
      .prepare("SELECT COUNT(*) AS count FROM admins")
      .get();
    if (existingAdmin.count === 0) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      this.db
        .prepare(
          "INSERT INTO admins (id, name, email, password) VALUES (?, ?, ?, ?)",
        )
        .run(
          "admin-1",
          "Administrator Vuebee",
          "admin@katalogwa.com",
          hashedPassword,
        );
    }

    // Seed Categories
    const existingCategories = this.db
      .prepare("SELECT COUNT(*) AS count FROM categories")
      .get();
    if (existingCategories.count === 0) {
      const insertCat = this.db.prepare(
        "INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)",
      );
      insertCat.run("cat-1", "Makeup", "makeup");
      insertCat.run("cat-2", "Skincare", "skincare");
    }

    // Seed Products — data relevan makeup & skincare dengan foto Unsplash
    const existingProducts = this.db
      .prepare("SELECT COUNT(*) AS count FROM products")
      .get();
    if (existingProducts.count === 0) {
      const insertProduct = this.db.prepare(`
        INSERT INTO products (id, name, category_id, price, stock_status, description, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const initialProducts = [
        {
          id: "prod-1",
          name: "Vuebee Velvet Matte Lip Cream",
          categoryId: "cat-1",
          price: 59000,
          stockStatus: "Tersedia",
          description:
            "Lip cream dengan hasil akhir velvet matte — warna intens, ringan di bibir, dan tidak cepat kering. Pilihan shade natural sampai bold untuk harian maupun acara.",
          image:
            "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-2",
          name: "Vuebee Flawless Matte Foundation",
          categoryId: "cat-1",
          price: 89000,
          stockStatus: "Tersedia",
          description:
            "Foundation medium hingga full coverage untuk meratakan warna kulit dan menyamarkan noda. Hasil akhir matte natural yang awet hingga 12 jam.",
          image:
            "https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-3",
          name: "Vuebee Blush Pop Cream",
          categoryId: "cat-1",
          price: 45000,
          stockStatus: "Tersedia",
          description:
            "Cream blush dengan tekstur lembut dan mudah dibaurkan di pipi, hidung, maupun kelopak mata. Memberi rona segar yang terlihat natural.",
          image:
            "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-4",
          name: "Vuebee Glow Perfect Cushion SPF 40",
          categoryId: "cat-1",
          price: 99000,
          stockStatus: "Tersedia",
          description:
            "Cushion foundation dengan SPF 40 dan hasil dewy glow. Coverage ringan hingga sedang, mudah diaplikasikan ulang, dan cocok untuk kulit kering hingga normal.",
          image:
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-5",
          name: "Vuebee Dreamy Eyeshadow Palette",
          categoryId: "cat-1",
          price: 75000,
          stockStatus: "Tersedia",
          description:
            "Palet eyeshadow 12 warna: matte, satin, dan shimmer dalam nuansa cokelat-mocha. Pigmentasi halus, aman untuk makeup harian hingga glamor.",
          image:
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-6",
          name: "Vuebee Lash & Line Mascara",
          categoryId: "cat-1",
          price: 65000,
          stockStatus: "Habis",
          description:
            "Mascara sekaligus eyeliner cair dengan aplikator presisi untuk bulu mata lentik dan garis mata tajam. Tahan air dan tidak menggumpal.",
          image:
            "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-7",
          name: "Vuebee Niacinamide Bright Serum",
          categoryId: "cat-2",
          price: 119000,
          stockStatus: "Tersedia",
          description:
            "Serum niacinamide 10% dengan zinc untuk membantu mencerahkan, menyamarkan pori, dan mengontrol minyak. Tekstur watery, cepat meresap tanpa lengket.",
          image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-8",
          name: "Vuebee Hydra Glow Moisturizer",
          categoryId: "cat-2",
          price: 85000,
          stockStatus: "Tersedia",
          description:
            "Pelembap gel-cream dengan hyaluronic acid dan ceramide untuk hidrasi 72 jam. Kulit terasa kenyal, lembut, dan sehat bercahaya tanpa berminyak.",
          image:
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-9",
          name: "Vuebee Gentle Facial Cleanser",
          categoryId: "cat-2",
          price: 55000,
          stockStatus: "Tersedia",
          description:
            "Pembersih wajah pH balance dengan amino surfactant. Membersihkan debu, minyak, dan sisa makeup tanpa membuat kulit ketarik. Aman untuk kulit sensitif.",
          image:
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-10",
          name: "Vuebee Daily Sunscreen SPF 50 PA++++",
          categoryId: "cat-2",
          price: 69000,
          stockStatus: "Tersedia",
          description:
            "Sunscreen tekstur gel ringan, no white cast, dengan SPF 50 PA++++. Nyaman di bawah makeup dan tidak perih di mata. Wajib untuk pemakaian harian.",
          image:
            "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-11",
          name: "Vuebee Rose Hydra Toner Mist",
          categoryId: "cat-2",
          price: 48000,
          stockStatus: "Tersedia",
          description:
            "Toner mist mawar dan panthenol untuk menyegarkan sekaligus melembapkan kulit. Bisa dipakai sebelum serum atau untuk touch-up makeup di siang hari.",
          image:
            "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "prod-12",
          name: "Vuebee Clay Detox Mask",
          categoryId: "cat-2",
          price: 62000,
          stockStatus: "Habis",
          description:
            "Clay mask dengan kaolin dan salicylic acid untuk deep cleanse pori dan mengurangi komedo. Gunakan 2–3 kali seminggu untuk kulit lebih jernih.",
          image:
            "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
        },
      ];

      for (const p of initialProducts) {
        insertProduct.run(
          p.id,
          p.name,
          p.categoryId,
          p.price,
          p.stockStatus,
          p.description,
          p.image,
        );
      }
    }
  }

  // --- Settings SQL Operations ---
  getSettings() {
    const rows = this.db.prepare("SELECT key, value FROM settings").all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }

  updateSettings(newSettings) {
    const upsert = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, val] of Object.entries(newSettings)) {
      upsert.run(key, String(val));
    }
    return this.getSettings();
  }

  // --- Admin SQL Operations ---
  getAdmin() {
    return this.db
      .prepare("SELECT id, name, email, password FROM admins LIMIT 1")
      .get();
  }

  // --- Category SQL Operations ---
  getCategories() {
    // Relational SQL query with LEFT JOIN and COUNT
    return this.db
      .prepare(
        `
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.created_at AS createdAt,
        COUNT(p.id) AS productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `,
      )
      .all();
  }

  getCategoryById(id) {
    return this.db
      .prepare("SELECT id, name, slug FROM categories WHERE id = ?")
      .get(id);
  }

  addCategory(name) {
    const id = `cat-${Date.now()}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    this.db
      .prepare("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)")
      .run(id, name, slug);
    return { id, name, slug, productCount: 0 };
  }

  updateCategory(id, name) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const res = this.db
      .prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?")
      .run(name, slug, id);
    if (res.changes === 0) return null;
    return { id, name, slug };
  }

  deleteCategory(id) {
    const res = this.db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    return res.changes > 0;
  }

  // --- Product SQL Operations ---
  getProducts(filters = {}) {
    let sql = `
      SELECT 
        p.id, 
        p.name, 
        p.category_id AS categoryId, 
        c.name AS categoryName, 
        p.price, 
        p.stock_status AS stockStatus, 
        p.description, 
        p.image, 
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.categoryId) {
      sql += " AND p.category_id = ?";
      params.push(filters.categoryId);
    }

    if (filters.stockStatus) {
      sql += " AND p.stock_status = ?";
      params.push(filters.stockStatus);
    }

    if (filters.search) {
      sql += " AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)";
      const queryPattern = `%${filters.search.toLowerCase()}%`;
      params.push(queryPattern, queryPattern);
    }

    sql += " ORDER BY p.created_at DESC";

    return this.db.prepare(sql).all(...params);
  }

  getProductById(id) {
    return this.db
      .prepare(
        `
      SELECT 
        p.id, 
        p.name, 
        p.category_id AS categoryId, 
        c.name AS categoryName, 
        p.price, 
        p.stock_status AS stockStatus, 
        p.description, 
        p.image, 
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `,
      )
      .get(id);
  }

  addProduct(productData) {
    const id = `prod-${Date.now()}`;
    const price = Number(productData.price) || 0;
    const stockStatus = productData.stockStatus || "Tersedia";
    const description = productData.description || "";
    const image =
      productData.image ||
      "";

    this.db
      .prepare(
        `
      INSERT INTO products (id, name, category_id, price, stock_status, description, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        id,
        productData.name,
        productData.categoryId,
        price,
        stockStatus,
        description,
        image,
      );

    return this.getProductById(id);
  }

  updateProduct(id, productData) {
    const current = this.getProductById(id);
    if (!current) return null;

    const name =
      productData.name !== undefined ? productData.name : current.name;
    const categoryId =
      productData.categoryId !== undefined
        ? productData.categoryId
        : current.categoryId;
    const price =
      productData.price !== undefined
        ? Number(productData.price)
        : current.price;
    const stockStatus =
      productData.stockStatus !== undefined
        ? productData.stockStatus
        : current.stockStatus;
    const description =
      productData.description !== undefined
        ? productData.description
        : current.description;
    const image =
      productData.image !== undefined ? productData.image : current.image;

    this.db
      .prepare(
        `
      UPDATE products 
      SET name = ?, category_id = ?, price = ?, stock_status = ?, description = ?, image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      )
      .run(name, categoryId, price, stockStatus, description, image, id);

    return this.getProductById(id);
  }

  toggleStock(id) {
    const product = this.getProductById(id);
    if (!product) return null;

    const newStock = product.stockStatus === "Tersedia" ? "Habis" : "Tersedia";
    this.db
      .prepare(
        `
      UPDATE products 
      SET stock_status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      )
      .run(newStock, id);

    return this.getProductById(id);
  }

  deleteProduct(id) {
    const res = this.db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return res.changes > 0;
  }
}

export const db = new SqliteDatabase();
