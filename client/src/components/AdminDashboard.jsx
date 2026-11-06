import React, { useEffect, useRef, useState } from "react";
import {
  Package,
  Layers,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Store,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Search,
  FileText,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Wallet,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
  createCategory,
  updateCategory,
  deleteCategory,
  updateStoreSettings,
} from "../services/api";
import { ProductFormModal } from "./ProductFormModal";
import { ConfirmModal } from "./ConfirmModal";
import { VubeeLogo } from "./VubeeLogo";

export const AdminDashboard = ({
  products = [],
  categories = [],
  storeSettings,
  adminUser,
  onRefreshData,
  onBackToCatalog,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'categories' | 'settings'

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const feedbackTimerRef = useRef(null);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const selectTab = (tab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Category form
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // Store settings form
  const [settingsForm, setSettingsForm] = useState({
    storeName: storeSettings?.storeName || "Vuebee",
    tagline: storeSettings?.tagline || "Minimalist Luxury Skincare & Makeup",
    phone: storeSettings?.phone || "6282298656732",
    address: storeSettings?.address || "Jakarta Selatan, Indonesia",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Filters
  const [adminSearch, setAdminSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [adminPage, setAdminPage] = useState(1);

  // Sinkronkan form settings saat data toko berubah (hindari data basi).
  useEffect(() => {
    setSettingsForm({
      storeName: storeSettings?.storeName || "Vuebee",
      tagline: storeSettings?.tagline || "Minimalist Luxury Skincare & Makeup",
      phone: storeSettings?.phone || "6282298656732",
      address: storeSettings?.address || "Jakarta Selatan, Indonesia",
    });
  }, [storeSettings]);

  useEffect(() => {
    setAdminPage(1);
  }, [adminSearch, selectedCategoryFilter]);

  useEffect(() => {
    document.body.classList.toggle("modal-open-locked", isMobileSidebarOpen);
    return () => document.body.classList.remove("modal-open-locked");
  }, [isMobileSidebarOpen]);

  const hideFeedback = () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback({ type: "", message: "" });
  };

  const showFeedback = (type, message) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback({ type, message });
    feedbackTimerRef.current = setTimeout(
      () => setFeedback({ type: "", message: "" }),
      4000,
    );
  };

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    },
    [],
  );

  // Product actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (payload, id) => {
    try {
      if (id) {
        await updateProduct(id, payload);
        showFeedback("success", "Produk berhasil diperbarui");
      } else {
        await createProduct(payload);
        showFeedback("success", "Produk baru berhasil ditambahkan");
      }
      onRefreshData();
    } catch (err) {
      showFeedback("error", err.message || "Gagal menyimpan produk");
      throw err;
    }
  };

  const handleToggleStock = async (product) => {
    try {
      await toggleProductStock(product.id);
      showFeedback("success", `Status stok "${product.name}" diubah`);
      onRefreshData();
    } catch (err) {
      showFeedback("error", err.message || "Gagal mengubah status stok");
    }
  };

  const handleDeleteProduct = (product) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Produk",
      message: `Apakah Anda yakin ingin menghapus "${product.name}" dari katalog?`,
      onConfirm: async () => {
        try {
          await deleteProduct(product.id);
          showFeedback("success", "Produk berhasil dihapus");
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          });
          onRefreshData();
        } catch (err) {
          showFeedback("error", err.message || "Gagal menghapus produk");
        }
      },
    });
  };

  // Category actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName("");
      showFeedback("success", "Kategori baru berhasil ditambahkan");
      onRefreshData();
    } catch (err) {
      showFeedback("error", err.message || "Gagal menambahkan kategori");
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editCategoryName.trim()) return;

    try {
      await updateCategory(id, editCategoryName.trim());
      setEditingCategory(null);
      showFeedback("success", "Nama kategori berhasil diubah");
      onRefreshData();
    } catch (err) {
      showFeedback("error", err.message || "Gagal mengubah kategori");
    }
  };

  const handleDeleteCategory = (cat) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Kategori",
      message: `Hapus kategori "${cat.name}"? Pastikan tidak ada produk terkait.`,
      onConfirm: async () => {
        try {
          await deleteCategory(cat.id);
          showFeedback("success", "Kategori berhasil dihapus");
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          });
          onRefreshData();
        } catch (err) {
          showFeedback("error", err.message || "Gagal menghapus kategori");
        }
      },
    });
  };

  // Settings actions
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateStoreSettings(settingsForm);
      showFeedback("success", "Pengaturan toko berhasil disimpan");
      onRefreshData();
    } catch (err) {
      showFeedback("error", err.message || "Gagal menyimpan pengaturan");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filter
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      !selectedCategoryFilter || p.categoryId === selectedCategoryFilter;
    const matchesSearch =
      !adminSearch ||
      p.name?.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const ADMIN_PER_PAGE = 8;
  const adminTotalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ADMIN_PER_PAGE),
  );
  const pagedProducts = filteredProducts.slice(
    (adminPage - 1) * ADMIN_PER_PAGE,
    adminPage * ADMIN_PER_PAGE,
  );
  const adminStats = [
    { label: "Total Produk", value: products.length, color: undefined },
    {
      label: "Stok Tersedia",
      value: products.filter((p) => p.stockStatus === "Tersedia").length,
      color: "var(--color-success)",
    },
    {
      label: "Stok Habis",
      value: products.filter((p) => p.stockStatus === "Habis").length,
      color: "var(--color-danger)",
    },
    {
      label: "Kategori Aktif",
      value: categories.length,
      color: "var(--color-accent)",
    },
  ];
  const tabTitles = {
    summary: "Ringkasan Keseluruhan",
    products: "Manajemen Produk",
    categories: "Manajemen Kategori",
    settings: "Pengaturan Toko",
  };

  // Ringkasan keseluruhan dari data asli (hitung client-side, tanpa klaim palsu).
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  const summary = (() => {
    const total = products.length;
    const available = products.filter(
      (p) => p.stockStatus === "Tersedia",
    ).length;
    const out = products.filter((p) => p.stockStatus !== "Tersedia").length;
    const catalogValue = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0),
      0,
    );
    const perCategory = categories
      .map((c) => ({
        name: c.name,
        count: products.filter((p) => p.categoryId === c.id).length,
      }))
      .sort((a, b) => b.count - a.count);
    return {
      total,
      available,
      out,
      catalogValue,
      perCategory,
      outOfStockProducts: products.filter((p) => p.stockStatus !== "Tersedia"),
      missingImageProducts: products.filter((p) => !p.image),
    };
  })();

  return (
    <div className={`admin-layout-shell${isDesktopCollapsed ? " sidebar-collapsed" : ""}${isMobileSidebarOpen ? " mobile-sidebar-open" : ""}`}>
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} aria-hidden="true" />
      )}
      {/* Desktop Sidebar — bisa dilipat */}
      <aside className="admin-sidebar-desktop">
        <div className="admin-sidebar-brand">
          <button
            type="button"
            className="admin-sidebar-toggle"
            onClick={() => setIsDesktopCollapsed((v) => !v)}
            aria-label={isDesktopCollapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
            aria-expanded={!isDesktopCollapsed}
            title={isDesktopCollapsed ? "Tampilkan menu" : "Sembunyikan menu"}
          >
            {isDesktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          {isDesktopCollapsed ? (
            <VubeeLogo height={38} variant="light" iconOnly />
          ) : (
            <VubeeLogo height={52} variant="light" />
          )}
          <div className="admin-brand-text">
            <strong>Admin Panel</strong>
            <span>{storeSettings?.storeName || "Vuebee"}</span>
          </div>
        </div>

        <span className="admin-nav-label">Menu</span>
        <nav className="admin-sidebar-nav">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => selectTab("summary")}
            title="Ringkasan"
          >
            <FileText size={18} />
            <span>Ringkasan</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => selectTab("products")}
            title="Kelola Produk"
          >
            <Package size={18} />
            <span>Kelola Produk</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => selectTab("categories")}
            title="Kategori"
          >
            <Layers size={18} />
            <span>Kategori</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => selectTab("settings")}
            title="Pengaturan Toko"
          >
            <Settings size={18} />
            <span>Pengaturan Toko</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-nav-label">Akun</span>
          <div className="admin-user-hint">
            Masuk sebagai{" "}
            <strong>{adminUser?.name || adminUser?.email || "admin"}</strong>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBackToCatalog}
            title="Lihat Katalog"
          >
            <Store size={15} />
            <span>Lihat Katalog</span>
          </button>

          <button
            type="button"
            className="btn btn-danger-soft btn-sm"
            onClick={onLogout}
            title="Keluar"
          >
            <LogOut size={15} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="admin-main-stage">
        {/* Mobile Top Bar */}
        <div className="admin-mobile-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              className="admin-mobile-menu-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </button>
            <VubeeLogo height={26} variant="dark" />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              {" "}
              Admin
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBackToCatalog}
            >
              <Store size={14} />
              <span>Katalog</span>
            </button>
            <button
              type="button"
              className="btn btn-danger-soft btn-sm btn-icon-only"
              onClick={onLogout}
              aria-label="Keluar"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Page header (breadcrumb + judul per tab) */}
        <div className="admin-page-header">
          <div className="admin-page-header-text">
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <button
                type="button"
                className="admin-header-toggle"
                onClick={() => setIsDesktopCollapsed((v) => !v)}
                aria-label={isDesktopCollapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
                title={isDesktopCollapsed ? "Tampilkan menu" : "Sembunyikan menu"}
              >
                <Menu size={16} />
              </button>
              <span className="admin-breadcrumb">
                Dashboard / {tabTitles[activeTab]}
              </span>
            </div>
            <h1>{tabTitles[activeTab]}</h1>
          </div>
          {activeTab === "products" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddProduct}
            >
              <Plus size={16} />
              <span>Tambah Produk</span>
            </button>
          )}
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="admin-mobile-tabs-strip">
          <button
            type="button"
            className={`category-pill-btn ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            <FileText size={14} />
            <span>Ringkasan</span>
          </button>
          <button
            type="button"
            className={`category-pill-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={14} />
            <span>Produk ({products.length})</span>
          </button>
          <button
            type="button"
            className={`category-pill-btn ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <Layers size={14} />
            <span>Kategori ({categories.length})</span>
          </button>
          <button
            type="button"
            className={`category-pill-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={14} />
            <span>Pengaturan</span>
          </button>
        </div>

        {/* Feedback Toast — fixed, tidak menggeser konten */}
        {feedback.message && (
          <div
            className={`admin-toast ${feedback.type === "success" ? "success" : "error"}`}
            role="alert"
            aria-live="assertive"
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="toast-msg">{feedback.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={hideFeedback}
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* TAB: RINGKASAN */}
        {activeTab === "summary" && (
          <div className="summary-tab animate-fade-in">
            <p className="summary-intro">
              Pantau kondisi katalog {storeSettings?.storeName || "Vuebee"} dalam satu tempat: stok, kategori, dan nilai katalog.
            </p>

            <div className="admin-stats-deck summary-kpi-deck">
              <div className="admin-stat-card kpi-plain">
                <span className="kpi-icon neutral">
                  <Package size={20} />
                </span>
                <div className="kpi-body">
                  <span className="stat-label-text">Total Produk</span>
                  <span className="stat-value-text">{summary.total}</span>
                  <span className="kpi-sub">Semua di katalog</span>
                </div>
              </div>
              <div className="admin-stat-card kpi-plain">
                <span className="kpi-icon green">
                  <PackageCheck size={20} />
                </span>
                <div className="kpi-body">
                  <span className="stat-label-text">Tersedia</span>
                  <span
                    className="stat-value-text"
                    style={{ color: "var(--color-success)" }}
                  >
                    {summary.available}
                  </span>
                  <span className="kpi-sub">Siap dipesan</span>
                </div>
              </div>
              <div className="admin-stat-card kpi-plain">
                <span className="kpi-icon red">
                  <PackageX size={20} />
                </span>
                <div className="kpi-body">
                  <span className="stat-label-text">Habis</span>
                  <span
                    className="stat-value-text"
                    style={{
                      color: summary.out ? "var(--color-danger)" : undefined,
                    }}
                  >
                    {summary.out}
                  </span>
                  <span className="kpi-sub">
                    {summary.out ? "Perlu restock" : "Tidak ada stok habis"}
                  </span>
                </div>
              </div>
              <div className="admin-stat-card kpi-plain">
                <span className="kpi-icon gold">
                  <Layers size={20} />
                </span>
                <div className="kpi-body">
                  <span className="stat-label-text">Kategori</span>
                  <span
                    className="stat-value-text"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {categories.length}
                  </span>
                  <span className="kpi-sub">Pengelompokan aktif</span>
                </div>
              </div>
              <div className="admin-stat-card kpi-plain">
                <span className="kpi-icon gold">
                  <Wallet size={20} />
                </span>
                <div className="kpi-body">
                  <span className="stat-label-text">Nilai Katalog</span>
                  <span
                    className="stat-value-text"
                    style={{ fontSize: "1.15rem", lineHeight: 1.35 }}
                  >
                    {formatRupiah(summary.catalogValue)}
                  </span>
                  <span className="kpi-sub">Total harga semua produk</span>
                </div>
              </div>
            </div>

            <div className="summary-grid">
              <div className="admin-table-container">
                <div className="table-title-bar">
                  <strong>Per Kategori</strong>
                  <span>{summary.perCategory.length} kategori</span>
                </div>
                <table className="luxury-data-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Jumlah Produk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.perCategory.length === 0 && (
                      <tr>
                        <td
                          colSpan="2"
                          style={{
                            textAlign: "center",
                            color: "var(--color-text-muted)",
                            padding: "2rem",
                          }}
                        >
                          Belum ada kategori.
                        </td>
                      </tr>
                    )}
                    {summary.perCategory.map((c) => {
                      const maxCount = summary.perCategory[0]?.count || 1;
                      const pct = Math.min(
                        100,
                        Math.round((c.count / maxCount) * 100),
                      );
                      return (
                        <tr key={c.name}>
                          <td>
                            <strong>{c.name}</strong>
                          </td>
                          <td>
                            <div className="bar-cell">
                              <span>{c.count} produk</span>
                              <span className="bar-track">
                                <span
                                  className="bar-fill"
                                  style={{ width: `${pct}%` }}
                                />
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="admin-table-container">
                <div className="table-title-bar">
                  <strong>Perhatian</strong>
                  <span>perlu tindakan</span>
                </div>
                <div className="summary-alerts summary-alerts-clean">
                  {summary.outOfStockProducts.length > 0 ? (
                    <div className="summary-alert warn">
                      <span className="alert-icon">
                        <AlertTriangle size={16} />
                      </span>
                      <div className="alert-body">
                        <strong>
                          {summary.outOfStockProducts.length} produk Habis
                        </strong>
                        <span>
                          {summary.outOfStockProducts
                            .slice(0, 3)
                            .map((p) => p.name)
                            .join(", ")}
                          {summary.outOfStockProducts.length > 3
                            ? ` +${summary.outOfStockProducts.length - 3} lainnya`
                            : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="alert-action"
                        onClick={() => setActiveTab("products")}
                      >
                        Kelola <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="summary-alert ok">
                      <span className="alert-icon">
                        <CheckCircle2 size={16} />
                      </span>
                      <div className="alert-body">
                        <strong>Semua produk Tersedia</strong>
                        <span>Tidak ada stok habis saat ini.</span>
                      </div>
                    </div>
                  )}
                  {summary.missingImageProducts.length > 0 ? (
                    <div className="summary-alert warn">
                      <span className="alert-icon">
                        <AlertTriangle size={16} />
                      </span>
                      <div className="alert-body">
                        <strong>
                          {summary.missingImageProducts.length} produk tanpa
                          foto
                        </strong>
                        <span>
                          {summary.missingImageProducts
                            .slice(0, 3)
                            .map((p) => p.name)
                            .join(", ")}
                          {summary.missingImageProducts.length > 3
                            ? ` +${summary.missingImageProducts.length - 3} lainnya`
                            : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="alert-action"
                        onClick={() => setActiveTab("products")}
                      >
                        Perbaiki <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="summary-alert ok">
                      <span className="alert-icon">
                        <CheckCircle2 size={16} />
                      </span>
                      <div className="alert-body">
                        <strong>Semua produk punya foto</strong>
                        <span>Tampilan katalog lengkap.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: PRODUCTS */}
        {activeTab === "products" && (
          <div>
            <p className="admin-page-desc">
              Kelola daftar produk, harga, dan ketersediaan stok untuk katalog {storeSettings?.storeName || "Vuebee"}.
            </p>

            {/* Stats Deck */}
            <div className="admin-stats-deck">
              {adminStats.map((s) => (
                <div className="admin-stat-card" key={s.label}>
                  <span className="stat-label-text">{s.label}</span>
                  <div
                    className="stat-value-text"
                    style={s.color ? { color: s.color } : undefined}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="admin-toolbar-card">
              <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
                <input
                  type="text"
                  className="form-input-control"
                  placeholder="Cari nama produk atau kategori..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  style={{ paddingLeft: "2.5rem" }}
                />
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-muted)",
                  }}
                />
              </div>

              <select
                className="form-select-control"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                style={{ width: "auto", minWidth: "180px" }}
                aria-label="Filter kategori"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {(adminSearch || selectedCategoryFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setAdminSearch("");
                    setSelectedCategoryFilter("");
                  }}
                >
                  Reset
                </button>
              )}
              <span className="admin-result-count">
                {filteredProducts.length} dari {products.length} produk
              </span>
            </div>

            {/* Table */}
            <div className="admin-table-container admin-products-table">
              <div className="table-title-bar">
                <strong>Daftar Produk</strong>
                <span>{filteredProducts.length} dari {products.length} produk</span>
              </div>
              <div className="table-scroller">
                <table className="luxury-data-table">
                  <thead>
                    <tr>
                      <th className="col-product">Produk</th>
                      <th className="col-category">Kategori</th>
                      <th className="col-price">Harga</th>
                      <th className="col-stock">Status Stok</th>
                      <th className="col-actions">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--color-text-muted)" }}>
                          <div className="empty-icon-circle" style={{ margin: "0 auto 1rem" }}><Search size={26} /></div>
                          <p style={{ fontWeight: 700, color: "var(--color-primary)", marginBottom: "0.35rem" }}>Tidak ada produk ditemukan</p>
                          <p style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>Coba ubah kata kunci atau reset filter kategori.</p>
                          {(adminSearch || selectedCategoryFilter) && (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setAdminSearch(""); setSelectedCategoryFilter(""); }}>Reset pencarian &amp; filter</button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      pagedProducts.map((p) => (
                        <tr key={p.id} className="product-row">
                          <td className="col-product">
                            <div className="prod-cell">
                              <span className="prod-thumb">
                                <img
                                  src={
                                    p.image ||
                                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80"
                                  }
                                  alt={p.name}
                                  loading="lazy"
                                />
                              </span>
                              <span className="prod-info">
                                <span className="prod-name" title={p.name}>
                                  {p.name}
                                </span>
                                {p.description && (
                                  <span className="prod-desc" title={p.description}>
                                    {p.description}
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="col-category">
                            <span className="cat-pill">
                              {p.categoryName || "Tanpa kategori"}
                            </span>
                          </td>
                          <td className="col-price">
                            <strong style={{ color: "var(--color-primary)" }}>
                              {formatRupiah(p.price)}
                            </strong>
                          </td>
                          <td className="col-stock">
                            <button
                              type="button"
                              className={`stock-toggle ${p.stockStatus === "Tersedia" ? "on" : "off"}`}
                              onClick={() => handleToggleStock(p)}
                              title="Klik untuk mengubah status stok"
                              aria-pressed={p.stockStatus === "Tersedia"}
                              aria-label={`Ubah status stok ${p.name} menjadi ${p.stockStatus === "Tersedia" ? "Habis" : "Tersedia"}`}
                            >
                              <span className="stock-toggle-track">
                                <span className="stock-toggle-knob" />
                              </span>
                              <span className="stock-toggle-label">
                                {p.stockStatus}
                              </span>
                            </button>
                          </td>
                          <td className="col-actions">
                            <div className="row-actions">
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm row-btn"
                                onClick={() => handleOpenEditProduct(p)}
                                title="Edit Produk"
                                aria-label={`Edit ${p.name}`}
                              >
                                <Edit2 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger-soft btn-sm row-btn"
                                onClick={() => handleDeleteProduct(p)}
                                title="Hapus Produk"
                                aria-label={`Hapus ${p.name}`}
                              >
                                <Trash2 size={14} />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {adminTotalPages > 1 && (
              <nav className="pagination-bar" aria-label="Pagination admin">
                <button type="button" className="btn btn-secondary btn-sm" disabled={adminPage === 1} onClick={() => setAdminPage((v) => Math.max(1, v - 1))} aria-label="Halaman sebelumnya">Sebelumnya</button>
                <span className="pagination-info" aria-live="polite">
                  Halaman {adminPage} dari {adminTotalPages}
                </span>
                <div className="pagination-pages">
                  {Array.from({ length: adminTotalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        type="button"
                        key={page}
                        className={`pagination-page ${page === adminPage ? "active" : ""}`}
                        aria-current={page === adminPage ? "page" : undefined}
                        onClick={() => setAdminPage(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button type="button" className="btn btn-secondary btn-sm" disabled={adminPage === adminTotalPages} onClick={() => setAdminPage((v) => Math.min(adminTotalPages, v + 1))} aria-label="Halaman berikutnya">Berikutnya</button>
              </nav>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === "categories" && (
          <div>
            <p className="admin-page-desc">
              Kelola pengelompokan produk untuk katalog {storeSettings?.storeName || "Vuebee"}.
            </p>

            {/* Add category form */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "1.5rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
                marginBottom: "1.5rem",
                boxShadow: "var(--shadow-subtle)",
              }}
            >
              <form
                onSubmit={handleAddCategory}
                style={{
                  display: "flex",
                  gap: "0.85rem",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <label className="form-label-title">
                    Tambah Kategori Baru
                  </label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="Contoh: Serum Wajah, Lip Care..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ height: "44px" }}
                >
                  <Plus size={16} />
                  <span>Simpan Kategori</span>
                </button>
              </form>
            </div>

            {/* Categories table */}
            <div className="admin-table-container">
              <div className="table-scroller">
                <table className="luxury-data-table">
                  <thead>
                    <tr>
                      <th>Nama Kategori</th>
                      <th>Slug</th>
                      <th>Jumlah Produk</th>
                      <th style={{ textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td>
                          {editingCategory === c.id ? (
                            <div
                              style={{
                                display: "flex",
                                gap: "0.4rem",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="text"
                                className="form-input-control"
                                value={editCategoryName}
                                onChange={(e) =>
                                  setEditCategoryName(e.target.value)
                                }
                                style={{ padding: "0.35rem 0.6rem" }}
                                autoFocus
                              />
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUpdateCategory(c.id)}
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingCategory(null)}
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <strong>{c.name}</strong>
                          )}
                        </td>
                        <td>
                          <code>{c.slug || c.id}</code>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "var(--radius-full)",
                              backgroundColor: "var(--color-surface-subtle)",
                              color: "var(--color-primary)",
                              fontWeight: 600,
                            }}
                          >
                            {c.productCount ?? 0} Produk
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {editingCategory !== c.id && (
                            <div
                              style={{ display: "inline-flex", gap: "0.35rem" }}
                            >
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm row-btn"
                                title="Ubah nama kategori"
                                aria-label={`Ubah nama kategori ${c.name}`}
                                onClick={() => {
                                  setEditingCategory(c.id);
                                  setEditCategoryName(c.name);
                                }}
                              >
                                <Edit2 size={14} />
                                <span>Ubah</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger-soft btn-sm row-btn"
                                title="Hapus kategori"
                                aria-label={`Hapus kategori ${c.name}`}
                                onClick={() => handleDeleteCategory(c)}
                              >
                                <Trash2 size={14} />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === "settings" && (
          <div className="settings-tab">
            <p className="admin-page-desc settings-desc">
              Atur profil toko, nomor WhatsApp pesanan, dan alamat gerai {storeSettings?.storeName || "Vuebee"}.
            </p>

            <div className="settings-card">
              <div className="settings-card-header">
                <span className="settings-badge">
                  <Store size={15} />
                  Profil Toko
                </span>
                <h2>Profil Toko</h2>
                <p>Perubahan langsung tampil di katalog dan halaman publik. Nomor WhatsApp digunakan untuk tombol pesan pelanggan.</p>
              </div>
              <form
                onSubmit={handleSaveSettings}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <label className="form-label-title">Nama Brand / Toko</label>
                  <input
                    type="text"
                    className="form-input-control"
                    value={settingsForm.storeName}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        storeName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="form-label-title">Tagline / Slogan</label>
                  <input
                    type="text"
                    className="form-input-control"
                    value={settingsForm.tagline}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        tagline: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="form-label-title">
                    Nomor WhatsApp Official (awali 62, contoh: 6282298656732)
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    className="form-input-control"
                    placeholder="6282298656732"
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        phone: e.target.value.replace(/[^\d]/g, ""),
                      })
                    }
                    required
                  />
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.35rem" }}>Hanya angka, tanpa +62 atau spasi. Pelanggan diarahkan ke nomor ini saat memesan.</p>
                </div>

                <div>
                  <label className="form-label-title">
                    Alamat Gerai / Kantor
                  </label>
                  <textarea
                    rows="3"
                    className="form-textarea-control"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary settings-save-btn"
                  disabled={isSavingSettings}
                >
                  <Save size={16} />
                  <span>
                    {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        categories={categories}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
      />
    </div>
  );
};

export default AdminDashboard;
