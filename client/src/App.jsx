import React, { useState, useEffect } from 'react';

import {
  fetchProducts,
  fetchCategories,
  fetchStoreSettings,
  fetchAdminProfile,
  clearAuthToken,
  getAuthToken
} from './services/api';

import { Header } from './components/Header';
import { CategoriesPills } from './components/CategoryPills';
import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderModal } from './components/OrderModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';

import {
  Sparkles,
  MessageCircle,
  MapPin,
  Phone,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Heart,
  Droplets,
  Layers,
  ShoppingBag
} from 'lucide-react';

import { VubeeLogo } from './components/VubeeLogo';

export function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeSettings, setStoreSettings] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [search, setSearch] = useState('');

  // Navigation View: 'landing' | 'catalog'
  const [activeView, setActiveView] = useState('landing');

  // Modals
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [orderInitialQty, setOrderInitialQty] = useState(1);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminView, setAdminView] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [proRes, catRes, storeRes] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchStoreSettings()
      ]);

      if (proRes?.data) setProducts(proRes.data);
      if (catRes?.data) setCategories(catRes.data);
      if (storeRes?.data) setStoreSettings(storeRes.data);
    } catch (err) {
      console.error('Gagal mengambil data katalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const token = getAuthToken();
    if (token) {
      fetchAdminProfile()
        .then((res) => {
          if (res?.user) setAdminUser(res.user);
        })
        .catch(() => {
          clearAuthToken();
          setAdminUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setAdminUser(null);
    setAdminView(false);
  };

  const handleOpenOrder = (product, quantity = 1, isOrder = true) => {
    if (isOrder) {
      setSelectedProductForOrder(product);
      setOrderInitialQty(quantity);
      setSelectedProductForDetail(null);
    } else {
      setSelectedProductForDetail(product);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = !activeCategoryId || p.categoryId === activeCategoryId;
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(search.toLowerCase())) ||
      (p.categoryName &&
        p.categoryName.toLowerCase().includes(search.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="app-layout">
      {isAdminView && adminUser ? (
        <AdminDashboard
          products={products}
          categories={categories}
          storeSettings={storeSettings}
          adminUser={adminUser}
          onRefreshData={loadData}
          onBackToCatalog={() => setAdminView(false)}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <Header
            storeSettings={storeSettings}
            isAdminView={isAdminView}
            setIsAdminView={setAdminView}
            adminUser={adminUser}
            onOpenLogin={() => setIsAdminLoginOpen(true)}
            onLogout={handleLogout}
            activeView={activeView}
            setActiveView={setActiveView}
          />

          {/* VIEW A: LANDING PAGE */}
          {activeView === 'landing' && (
            <main className="landing-view animate-fade-in">
              {/* Hero Splash with Center Logo */}
              <section className="landing-hero-section">
                <div className="container">
                  <div className="landing-logo-center-wrapper">
                    <VubeeLogo height={72} variant="dark" className="landing-logo-center" />
                  </div>

                  <div className="landing-badge-pill">
                    <Sparkles size={14} />
                    <span>Pure Botanical Beauty • BPOM Certified</span>
                  </div>

                  <h1 className="landing-main-title">
                    Perawatan Kulit Mewah & Alami untuk Kilau Sempurnamu
                  </h1>

                  <p className="landing-tagline">
                    {storeSettings?.tagline ||
                      'Diformulasikan dengan ekstrak botanical terbaik dan bahan aktif premium. Temukan rangkaian skincare dan makeup elegan yang merawat kecantikan kulitmu secara alami.'}
                  </p>

                  <div className="landing-cta-row">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={() => {
                        setActiveView('catalog');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <ShoppingBag size={18} />
                      <span>Jelajahi Koleksi Produk</span>
                      <ArrowRight size={18} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-lg"
                      onClick={() => {
                        setActiveView('catalog');
                        const searchEl = document.getElementById('product-search-input');
                        if (searchEl) searchEl.focus();
                      }}
                    >
                      <span>Cari Produk Favorit</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Brand Values / Luxury Features */}
              <section className="container">
                <div className="landing-features-grid">
                  <div className="feature-luxury-card">
                    <div className="feature-icon-circle">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="feature-luxury-title">Bahan Alami Pilihan</h3>
                    <p className="feature-luxury-desc">
                      Ekstrak botani alami berkualitas tinggi yang ramah dan aman bagi lapisan pelindung kulit Anda.
                    </p>
                  </div>

                  <div className="feature-luxury-card">
                    <div className="feature-icon-circle">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="feature-luxury-title">BPOM & Halal Resmi</h3>
                    <p className="feature-luxury-desc">
                      Seluruh produk telah teruji secara dermatologis dan tersertifikasi resmi untuk keamanan harian.
                    </p>
                  </div>

                  <div className="feature-luxury-card">
                    <div className="feature-icon-circle">
                      <Droplets size={24} />
                    </div>
                    <h3 className="feature-luxury-title">Hidrasi Intensif</h3>
                    <p className="feature-luxury-desc">
                      Memberikan nutrisi mendalam untuk menjaga kelembapan kulit tampak segar bercahaya alami.
                    </p>
                  </div>

                  <div className="feature-luxury-card">
                    <div className="feature-icon-circle">
                      <MessageCircle size={24} />
                    </div>
                    <h3 className="feature-luxury-title">Pesan Cepat via WhatsApp</h3>
                    <p className="feature-luxury-desc">
                      Pemesanan instan langsung terhubung dengan admin WhatsApp tanpa repot registrasi akun.
                    </p>
                  </div>
                </div>
              </section>

              {/* Featured Showcase Preview */}
              {products.length > 0 && (
                <section style={{ backgroundColor: '#FFFFFF', padding: '4rem 0', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                      <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-accent)', fontWeight: 700 }}>
                        Koleksi Unggulan
                      </span>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.35rem' }}>
                        Pilihan Skincare & Makeup Terfavorit
                      </h2>
                    </div>

                    <div className="products-catalog-grid">
                      {products.slice(0, 4).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelectProduct={(p) => handleOpenOrder(p, 1, true)}
                          onViewDetail={(p) => setSelectedProductForDetail(p)}
                        />
                      ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-lg"
                        onClick={() => {
                          setActiveView('catalog');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <span>Lihat Semua {products.length} Produk Vuebee</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </main>
          )}

          {/* VIEW C: PRODUCT CATALOG VIEW */}
          {activeView === 'catalog' && (
            <main className="animate-fade-in" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
              {/* Catalog Hero Banner */}
              <section className="catalog-hero-wrapper">
                <div className="container catalog-hero-inner">
                  <div className="catalog-hero-text">
                    <div className="landing-badge-pill" style={{ marginBottom: '0.85rem' }}>
                      <Sparkles size={14} />
                      <span>Katalog Resmi Vuebee</span>
                    </div>

                    <h1>
                      Koleksi Skincare & Makeup Mewah
                    </h1>

                    <p>
                      Pilih produk perawatan favoritmu, klik untuk melihat rincian detail produk, atau langsung pesan via WhatsApp dengan mudah dan cepat.
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
                        ✨ Formula Ringan
                      </span>
                      <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
                        🌿 Halal & BPOM
                      </span>
                      <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
                        🚀 Chat WhatsApp Instan
                      </span>
                    </div>
                  </div>

                  <div className="catalog-hero-image-wrap">
                    <img
                      src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85"
                      alt="Koleksi Skincare & Makeup Premium Vuebee"
                      className="catalog-hero-img"
                      loading="eager"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85';
                      }}
                    />
                  </div>
                </div>
              </section>

              <div className="container">
                {/* Search Bar */}
                <SearchBar
                  search={search}
                  setSearch={setSearch}
                  placeholder="Cari produk disini... (cth: Lip Cream, Foundation, Moisturizer, Sunscreen)"
                />

                {/* Category Pills */}
                <CategoriesPills
                  categories={categories}
                  activeCategoryId={activeCategoryId}
                  onSelectCategory={setActiveCategoryId}
                  totalProductsCount={products.length}
                />

                {/* Loading State */}
                {isLoading ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '5rem 1rem',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    <RefreshCw
                      size={36}
                      className="animate-spin"
                      style={{ margin: '0 auto 1.25rem', color: 'var(--color-accent)' }}
                    />
                    <p style={{ fontSize: '1rem', fontWeight: 500 }}>
                      Memuat katalog produk Vuebee...
                    </p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  /* Products Grid */
                  <div className="products-catalog-grid animate-fade-in">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelectProduct={(p) => handleOpenOrder(p, 1, true)}
                        onViewDetail={(p) => setSelectedProductForDetail(p)}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="empty-catalog-state animate-fade-in">
                    <div className="empty-icon-circle">
                      <MessageCircle size={32} />
                    </div>

                    <h3 className="empty-state-title">
                      Produk Tidak Ditemukan
                    </h3>

                    <p className="empty-state-desc">
                      Tidak ada produk yang cocok dengan kata kunci "{search}" pada kategori yang dipilih.
                    </p>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSearch('');
                        setActiveCategoryId('');
                      }}
                    >
                      Tampilkan Semua Produk
                    </button>
                  </div>
                )}
              </div>
            </main>
          )}

          {/* VIEW D: PRODUCT DETAIL MODAL */}
          {selectedProductForDetail && (
            <ProductDetailModal
              product={selectedProductForDetail}
              allProducts={products}
              storeSettings={storeSettings}
              onClose={() => setSelectedProductForDetail(null)}
              onOrderProduct={(prod, qty, isOrder = true) => handleOpenOrder(prod, qty, isOrder)}
            />
          )}

          {/* ORDER CONFIRMATION MODAL */}
          {selectedProductForOrder && (
            <OrderModal
              product={selectedProductForOrder}
              storeSettings={storeSettings}
              initialQuantity={orderInitialQty}
              onClose={() => setSelectedProductForOrder(null)}
            />
          )}

          {/* FOOTER */}
          <footer className="site-luxury-footer" id="footer-section">
            <div className="container">
              <div className="footer-top-grid">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                    <VubeeLogo height={32} variant="light" />
                  </div>

                  <p className="footer-brand-desc">
                    {storeSettings?.tagline ||
                      'Minimalist Luxury Skincare & Makeup. Kami menghadirkan inovasi formulasi kecantikan terpercaya untuk pancaran kulit alami yang sehat dan bercahaya.'}
                  </p>
                </div>

                <div>
                  <h4 className="footer-col-title">Navigasi Cepat</h4>
                  <ul className="footer-links-list">
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        Beranda
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveView('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        Katalog Lengkap
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsAdminLoginOpen(true); }}>
                        Login Administrator
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="footer-col-title">Kontak & Lokasi</h4>
                  <ul className="footer-links-list">
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <MapPin size={16} style={{ flexShrink: 0, marginTop: '0.2rem', color: 'var(--color-accent)' }} />
                      <span>{storeSettings?.address || 'Jakarta Selatan, Indonesia'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} style={{ color: 'var(--color-wa)' }} />
                      <span>+{storeSettings?.phone || '6282298656732'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageCircle size={16} style={{ color: 'var(--color-wa)' }} />
                      <span>Layanan WhatsApp 09:00 - 21:00 WIB</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="footer-bottom-bar">
                <div>
                  © {new Date().getFullYear()} {storeSettings?.storeName || 'Vuebee'}. All rights reserved.
                </div>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <span>Minimalist Luxury Skincare</span>
                  <span>•</span>
                  <span>Pesan via WhatsApp</span>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={(user) => {
          setAdminUser(user);
          setAdminView(true);
        }}
      />
    </div>
  );
}

export default App;
