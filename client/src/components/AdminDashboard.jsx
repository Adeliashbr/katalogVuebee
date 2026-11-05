import React, { useState } from 'react';
import {
    Package,
    Layers,
    Settings,
    Plus,
    Edit2,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Store,
    LogOut,
    CheckCircle2,
    AlertCircle,
    Save,
    Search,
    ShoppingBag,
    Menu,
    X,
    Filter
} from 'lucide-react';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    createCategory,
    updateCategory,
    deleteCategory,
    updateStoreSettings
} from '../services/api';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmModal } from './ConfirmModal';
import { VubeeLogo } from './VubeeLogo';

export const AdminDashboard = ({
    products = [],
    categories = [],
    storeSettings,
    adminUser,
    onRefreshData,
    onBackToCatalog,
    onLogout
}) => {
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'settings'

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Category form
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');

    // Store settings form
    const [settingsForm, setSettingsForm] = useState({
        storeName: storeSettings?.storeName || 'Vuebee',
        tagline: storeSettings?.tagline || 'Minimalist Luxury Skincare & Makeup',
        phone: storeSettings?.phone || '6282298656732',
        address: storeSettings?.address || 'Jakarta Selatan, Indonesia'
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Filters
    const [adminSearch, setAdminSearch] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    };

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
                showFeedback('success', 'Produk berhasil diperbarui');
            } else {
                await createProduct(payload);
                showFeedback('success', 'Produk baru berhasil ditambahkan');
            }
            onRefreshData();
        } catch (err) {
            showFeedback('error', err.message || 'Gagal menyimpan produk');
            throw err;
        }
    };

    const handleToggleStock = async (product) => {
        try {
            await toggleProductStock(product.id);
            showFeedback('success', `Status stok "${product.name}" diubah`);
            onRefreshData();
        } catch (err) {
            showFeedback('error', err.message || 'Gagal mengubah status stok');
        }
    };

    const handleDeleteProduct = (product) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Produk',
            message: `Apakah Anda yakin ingin menghapus "${product.name}" dari katalog?`,
            onConfirm: async () => {
                try {
                    await deleteProduct(product.id);
                    showFeedback('success', 'Produk berhasil dihapus');
                    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                    onRefreshData();
                } catch (err) {
                    showFeedback('error', err.message || 'Gagal menghapus produk');
                }
            }
        });
    };

    // Category actions
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await createCategory(newCategoryName.trim());
            setNewCategoryName('');
            showFeedback('success', 'Kategori baru berhasil ditambahkan');
            onRefreshData();
        } catch (err) {
            showFeedback('error', err.message || 'Gagal menambahkan kategori');
        }
    };

    const handleUpdateCategory = async (id) => {
        if (!editCategoryName.trim()) return;

        try {
            await updateCategory(id, editCategoryName.trim());
            setEditingCategory(null);
            showFeedback('success', 'Nama kategori berhasil diubah');
            onRefreshData();
        } catch (err) {
            showFeedback('error', err.message || 'Gagal mengubah kategori');
        }
    };

    const handleDeleteCategory = (cat) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Kategori',
            message: `Hapus kategori "${cat.name}"? Pastikan tidak ada produk terkait.`,
            onConfirm: async () => {
                try {
                    await deleteCategory(cat.id);
                    showFeedback('success', 'Kategori berhasil dihapus');
                    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                    onRefreshData();
                } catch (err) {
                    showFeedback('error', err.message || 'Gagal menghapus kategori');
                }
            }
        });
    };

    // Settings actions
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            await updateStoreSettings(settingsForm);
            showFeedback('success', 'Pengaturan toko berhasil disimpan');
            onRefreshData();
        } catch (err) {
            showFeedback('error', err.message || 'Gagal menyimpan pengaturan');
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Filter
    const filteredProducts = products.filter((p) => {
        const matchesCat = !selectedCategoryFilter || p.categoryId === selectedCategoryFilter;
        const matchesSearch = !adminSearch ||
            p.name?.toLowerCase().includes(adminSearch.toLowerCase()) ||
            p.categoryName?.toLowerCase().includes(adminSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num || 0);
    };

    return (
        <div className="admin-layout-shell">
            {/* Desktop Sidebar */}
            <aside className="admin-sidebar-desktop">
                <div className="admin-sidebar-brand">
                    <VubeeLogo height={34} variant="light" />
                </div>

                <nav className="admin-sidebar-nav">
                    <button
                        type="button"
                        className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={18} />
                        <span>Kelola Produk</span>
                    </button>

                    <button
                        type="button"
                        className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        <Layers size={18} />
                        <span>Kategori</span>
                    </button>

                    <button
                        type="button"
                        className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={18} />
                        <span>Pengaturan Toko</span>
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.2rem' }}>
                        Masuk sebagai: <strong>{adminUser?.email || 'admin'}</strong>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onBackToCatalog}
                        style={{ width: '100%' }}
                    >
                        <Store size={15} />
                        <span>Lihat Katalog</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger-soft btn-sm"
                        onClick={onLogout}
                        style={{ width: '100%' }}
                    >
                        <LogOut size={15} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Stage */}
            <main className="admin-main-stage">
                {/* Mobile Top Bar */}
                <div className="admin-mobile-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <VubeeLogo height={26} variant="dark" />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}> Admin</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                            className="btn btn-danger-soft btn-sm"
                            onClick={onLogout}
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Tabs */}
                <div className="admin-mobile-tabs-strip">
                    <button
                        type="button"
                        className={`category-pill-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={14} />
                        <span>Produk ({products.length})</span>
                    </button>
                    <button
                        type="button"
                        className={`category-pill-btn ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        <Layers size={14} />
                        <span>Kategori ({categories.length})</span>
                    </button>
                    <button
                        type="button"
                        className={`category-pill-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={14} />
                        <span>Pengaturan</span>
                    </button>
                </div>

                {/* Feedback Toast */}
                {feedback.message && (
                    <div
                        className="animate-fade-in"
                        style={{
                            padding: '0.85rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: feedback.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                            color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            border: `1px solid ${feedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`
                        }}
                    >
                        {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{feedback.message}</span>
                    </div>
                )}

                {/* TAB 1: PRODUCTS */}
                {activeTab === 'products' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                            <div>
                                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                                    Manajemen Produk
                                </h1>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                    Kelola daftar produk, harga, dan ketersediaan stok katalog Vuebee.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleOpenAddProduct}
                            >
                                <Plus size={16} />
                                <span>Tambah Produk</span>
                            </button>
                        </div>

                        {/* Stats Deck */}
                        <div className="admin-stats-deck">
                            <div className="admin-stat-card">
                                <span className="stat-label-text">Total Koleksi</span>
                                <div className="stat-value-text">{products.length}</div>
                            </div>

                            <div className="admin-stat-card">
                                <span className="stat-label-text">Stok Tersedia</span>
                                <div className="stat-value-text" style={{ color: 'var(--color-success)' }}>
                                    {products.filter((p) => p.stockStatus === 'Tersedia').length}
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <span className="stat-label-text">Stok Habis</span>
                                <div className="stat-value-text" style={{ color: 'var(--color-danger)' }}>
                                    {products.filter((p) => p.stockStatus === 'Habis').length}
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <span className="stat-label-text">Kategori Aktif</span>
                                <div className="stat-value-text" style={{ color: 'var(--color-accent)' }}>
                                    {categories.length}
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Toolbar */}
                        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input-control"
                                    placeholder="Cari nama produk..."
                                    value={adminSearch}
                                    onChange={(e) => setAdminSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                                <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            </div>

                            <select
                                className="form-select-control"
                                value={selectedCategoryFilter}
                                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                                style={{ width: 'auto', minWidth: '180px' }}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Table */}
                        <div className="admin-table-container">
                            <div className="table-scroller">
                                <table className="luxury-data-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Kategori</th>
                                            <th>Harga</th>
                                            <th>Status Stok</th>
                                            <th style={{ textAlign: 'right' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--color-text-muted)' }}>
                                                    Tidak ada produk yang cocok dengan pencarian.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map((p) => (
                                                <tr key={p.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                            <img
                                                                src={p.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80'}
                                                                alt={p.name}
                                                                style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                                                            />
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{p.name}</div>
                                                                {p.description && (
                                                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                        {p.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                                                            {p.categoryName || '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <strong style={{ color: 'var(--color-primary)' }}>{formatRupiah(p.price)}</strong>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStock(p)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                                                            title="Ubah ketersediaan stok"
                                                        >
                                                            <span className={`card-stock-pill ${p.stockStatus === 'Tersedia' ? 'available' : 'empty'}`}>
                                                                {p.stockStatus}
                                                            </span>
                                                            {p.stockStatus === 'Tersedia' ? (
                                                                <ToggleRight size={20} color="var(--color-success)" />
                                                            ) : (
                                                                <ToggleLeft size={20} color="var(--color-danger)" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => handleOpenEditProduct(p)}
                                                                title="Edit Produk"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger-soft btn-sm"
                                                                onClick={() => handleDeleteProduct(p)}
                                                                title="Hapus Produk"
                                                            >
                                                                <Trash2 size={14} />
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
                    </div>
                )}

                {/* TAB 2: CATEGORIES */}
                {activeTab === 'categories' && (
                    <div>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                                Manajemen Kategori
                            </h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                Kelola pengelompokan produk pada katalog Vuebee.
                            </p>
                        </div>

                        {/* Add category form */}
                        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-subtle)' }}>
                            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '240px' }}>
                                    <label className="form-label-title">Tambah Kategori Baru</label>
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
                                    style={{ height: '44px' }}
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
                                            <th style={{ textAlign: 'right' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((c) => (
                                            <tr key={c.id}>
                                                <td>
                                                    {editingCategory === c.id ? (
                                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                            <input
                                                                type="text"
                                                                className="form-input-control"
                                                                value={editCategoryName}
                                                                onChange={(e) => setEditCategoryName(e.target.value)}
                                                                style={{ padding: '0.35rem 0.6rem' }}
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
                                                <td><code>{c.slug || c.id}</code></td>
                                                <td>
                                                    <span style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-subtle)', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                        {c.productCount ?? 0} Produk
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {editingCategory !== c.id && (
                                                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => {
                                                                    setEditingCategory(c.id);
                                                                    setEditCategoryName(c.name);
                                                                }}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger-soft btn-sm"
                                                                onClick={() => handleDeleteCategory(c)}
                                                            >
                                                                <Trash2 size={14} />
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
                {activeTab === 'settings' && (
                    <div>
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                                Pengaturan Toko
                            </h1>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                Atur profil toko, nomor WhatsApp pesanan, dan alamat gerai Vuebee.
                            </p>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', maxWidth: '640px', boxShadow: 'var(--shadow-subtle)' }}>
                            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="form-label-title">Nama Brand / Toko</label>
                                    <input
                                        type="text"
                                        className="form-input-control"
                                        value={settingsForm.storeName}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="form-label-title">Tagline / Slogan</label>
                                    <input
                                        type="text"
                                        className="form-input-control"
                                        value={settingsForm.tagline}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="form-label-title">Nomor WhatsApp Official (Awali 62, contoh: 6282298656732)</label>
                                    <input
                                        type="text"
                                        className="form-input-control"
                                        value={settingsForm.phone}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="form-label-title">Alamat Gerai / Kantor</label>
                                    <textarea
                                        rows="3"
                                        className="form-textarea-control"
                                        value={settingsForm.address}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSavingSettings}
                                    style={{ alignSelf: 'flex-start' }}
                                >
                                    <Save size={16} />
                                    <span>{isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
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
                onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
            />
        </div>
    );
};

export default AdminDashboard;
