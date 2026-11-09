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
  Droplets,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
  Heart,
  ArrowUp
} from 'lucide-react';

import { VubeeLogo } from './components/VubeeLogo';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS
} from './data/initialProducts';

export function App() {
  const ADMIN_VIEW_KEY = 'vuebee_admin_view';
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [storeSettings, setStoreSettings] = useState(INITIAL_STORE_SETTINGS);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [search, setSearch] = useState('');

  // Single-page sections (navbar hanya scroll ke anchor).
  // aktif untuk highlight navbar; ada juga scrollspy sederhana via scroll.
  const [activeSection, setActiveSection] = useState('beranda');

  const scrollToSection = (id) => {
    setActiveSection(id);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  useEffect(() => {
    const onScroll = () => {
      const ids = ['tentang', 'cara-order', 'katalog', 'beranda'];
      for (const sectionId of ids) {
        const el = document.getElementById(sectionId);
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveSection(sectionId);
          return;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Modals
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [orderInitialQty, setOrderInitialQty] = useState(1);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminView, setAdminView] = useState(() => {
    try {
      return sessionStorage.getItem(ADMIN_VIEW_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      const [proRes, catRes, storeRes] = await Promise.allSettled([
        fetchProducts(),
        fetchCategories(),
        fetchStoreSettings()
      ]);

      if (proRes.status === 'fulfilled' && proRes.value?.data?.length > 0) {
        setProducts(proRes.value.data);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.data?.length > 0) {
        setCategories(catRes.value.data);
      }
      if (storeRes.status === 'fulfilled' && storeRes.value?.data) {
        setStoreSettings(storeRes.value.data);
      }
    } catch (err) {
      console.warn('API backend belum terhubung, menggunakan data katalog Vuebee:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simpan pilihan tampilan admin agar refresh tidak pindah ke katalog
  useEffect(() => {
    try {
      if (isAdminView) {
        sessionStorage.setItem(ADMIN_VIEW_KEY, '1');
      } else {
        sessionStorage.removeItem(ADMIN_VIEW_KEY);
        loadData(); // Selalu segarkan data katalog saat beralih ke tampilan toko
      }
    } catch {
      // abaikan bila storage tidak tersedia
    }
  }, [isAdminView]);

  useEffect(() => {
    loadData();

    const token = getAuthToken();
    if (token) {
      const wantsAdminView = (() => {
        try {
          return sessionStorage.getItem(ADMIN_VIEW_KEY) === '1';
        } catch {
          return false;
        }
      })();
      if (wantsAdminView) setIsCheckingAdmin(true);
      fetchAdminProfile()
        .then((res) => {
          if (res?.user) {
            setAdminUser(res.user);
          } else {
            clearAuthToken();
            setAdminUser(null);
            setAdminView(false);
          }
        })
        .catch(() => {
          clearAuthToken();
          setAdminUser(null);
          setAdminView(false);
        })
        .finally(() => {
          setIsCheckingAdmin(false);
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

  const filteredProducts = products
    .map((p) => {
      if (!p.categoryName && p.categoryId) {
        const cat = categories.find((c) => c.id === p.categoryId);
        return cat ? { ...p, categoryName: cat.name } : p;
      }
      return p;
    })
    .filter((p) => {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategoryId]);

  const PRODUCTS_PER_PAGE = 12;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  // Rakit halaman pagination (dengan ellipsis saat banyak halaman)
  const getPaginationPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('…');
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Statistik dari data asli katalog.
  const catalogStats = [
    { label: 'Produk Tersedia', value: products.filter((p) => p.stockStatus === 'Tersedia').length },
    { label: 'Kategori', value: categories.length },
    { label: 'Semua Produk', value: products.length },
  ];

  return (
    <div className="app-layout">
      {isAdminView && adminUser ? (
        <AdminDashboard
          products={products}
          categories={categories}
          storeSettings={storeSettings}
          adminUser={adminUser}
          onUpdateAdminUser={setAdminUser}
          onRefreshData={loadData}
          onBackToCatalog={() => setAdminView(false)}
          onLogout={handleLogout}
        />
      ) : isAdminView && isCheckingAdmin ? (
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Memuat Dashboard Admin...</p>
        </main>
      ) : (
        <>
          <Header
            storeSettings={storeSettings}
            isAdminView={isAdminView}
            setIsAdminView={setAdminView}
            adminUser={adminUser}
            onOpenLogin={() => setIsAdminLoginOpen(true)}
            onLogout={handleLogout}
            activeSection={activeSection}
            onNavigate={scrollToSection}
          />

          {/* BERANDA (single page) */}
          <main className="landing-view animate-fade-in">
            <section className="landing-hero-section" id="beranda" style={{ scrollMarginTop: '110px' }}>
                <div className="container">
                  <div className="landing-logo-center-wrapper">
                    <VubeeLogo height={72} variant="dark" className="landing-logo-center" />
                  </div>

                  <div className="landing-badge-pill">
                    <Sparkles size={14} />
                    <span>Pure Botanical Beauty • BPOM Certified</span>
                  </div>

                  <h1 className="landing-main-title">
                    Perawatan Kulit <em>Mewah &amp; Alami</em> untuk Kilau Sempurnamu
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
                        scrollToSection('katalog');
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
                        scrollToSection('katalog');
                        setTimeout(() => {
                          document.getElementById('product-search-input')?.focus();
                        }, 350);
                      }}
                    >
                      <span>Cari Produk Favorit</span>
                    </button>
                  </div>
                </div>
              </section>

          {/* KATALOG (single page) */}
          <section id="katalog" style={{ scrollMarginTop: '110px', minHeight: 'calc(100vh - var(--header-height))' }}>
            <div className="animate-fade-in">
              {/* Catalog Hero Banner */}
              <div className="catalog-hero-wrapper">
                <div className="container catalog-hero-inner">
                  <div className="catalog-hero-text">
                    <div className="landing-badge-pill" style={{ marginBottom: '0.85rem' }}>
                      <Sparkles size={14} />
                      <span>Katalog Resmi Vuebee</span>
                    </div>

                    <h1>
                      Koleksi Skincare &amp; Makeup <em>Mewah</em>
                    </h1>

                    <p>
                      Pilih produk perawatan favoritmu, klik untuk melihat rincian detail produk, atau langsung pesan via WhatsApp dengan mudah dan cepat.
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontWeight: 500 }}>
                        Formula Ringan
                      </span>
                      <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontWeight: 500 }}>
                        Halal & BPOM
                      </span>
                      <span style={{ fontSize: '0.8rem', background: '#FFFFFF', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontWeight: 500 }}>
                        Chat WhatsApp Instan
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
              </div>

              <div className="container">
                <div className="section-heading" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                  <h2 className="section-heading-title" style={{ fontSize: '1.6rem' }}>
                    Jelajahi <em>Katalog</em>
                  </h2>
                  <p className="catalog-count-label">
                    Menampilkan {filteredProducts.length > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0}–{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} dari {filteredProducts.length} produk
                  </p>
                </div>
                <div className="sticky-toolbar">
                  <div className="sticky-toolbar-inner">
                    {/* Search Bar */}
                    <SearchBar
                      search={search}
                      setSearch={setSearch}
                      placeholder="Cari produk skincare atau makeup..."
                    />

                    {/* Category Pills */}
                    <CategoriesPills
                      categories={categories}
                      activeCategoryId={activeCategoryId}
                      onSelectCategory={setActiveCategoryId}
                      totalProductsCount={products.length}
                    />
                  </div>
                </div>

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
                  /* Products Grid (paginated, 12 / halaman) */
                  <>
                    <div className="products-catalog-grid animate-fade-in" key={currentPage}>
                      {paginatedProducts.map((product, idx) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          index={idx}
                          onSelectProduct={(p) => handleOpenOrder(p, 1, true)}
                          onViewDetail={(p) => setSelectedProductForDetail(p)}
                        />
                      ))}
                    </div>
                    <nav className="pagination-bar" aria-label="Pagination katalog">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={currentPage === 1}
                          onClick={() => goToPage(currentPage - 1)}
                          aria-label="Halaman sebelumnya"
                        >
                          <ChevronLeft size={15} /> <span>Sebelumnya</span>
                        </button>
                        <div className="pagination-pages">
                          {getPaginationPages().map((page, idx) =>
                            page === '…' ? (
                              <span className="pagination-ellipsis" key={`ellipsis-${idx}`} aria-hidden="true">…</span>
                            ) : (
                              <button
                                type="button"
                                key={page}
                                className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                                aria-current={page === currentPage ? 'page' : undefined}
                                aria-label={`Halaman ${page}`}
                                onClick={() => goToPage(page)}
                              >
                                {page}
                              </button>
                            )
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={currentPage === totalPages}
                          onClick={() => goToPage(currentPage + 1)}
                          aria-label="Halaman berikutnya"
                        >
                          <span>Berikutnya</span> <ChevronRight size={15} />
                        </button>
                    </nav>
                  </>
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
            </div>
          </section>

          {/* CTA WHATSAPP (section pemisah sebelum tentang) */}
          <section className="cta-band">
            <div className="container cta-band-inner">
              <div>
                <span className="section-heading-eyebrow" style={{ color: 'var(--color-accent)' }}>
                  Butuh Bantuan Pilih?
                </span>
                <h2 className="cta-title">Bingung Pilih Produk? <em>Chat Admin Sekarang</em></h2>
                <p className="cta-desc">
                  Ceritakan tipe kulit dan kebutuhanmu — dibantu rekomendasi yang paling cocok, tanpa biaya.
                </p>
              </div>
              <a
                className="btn btn-wa btn-lg"
                href={`https://wa.me/${(storeSettings?.phone || '6282298656732').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo, saya mau konsultasi produk skincare/makeup yang cocok.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                <span>Chat WhatsApp Admin</span>
              </a>
            </div>
          </section>

          {/* TENTANG KAMI (paling bawah) */}
          <section className="container" id="tentang" style={{ scrollMarginTop: '120px', paddingBottom: '4rem' }}>
            <div className="section-heading" style={{ marginTop: '3.5rem' }}>
              <span className="section-heading-eyebrow">Tentang Kami</span>
              <h2 className="section-heading-title">Kenapa <em>Vuebee</em>?</h2>
              <p className="section-heading-desc">
                {storeSettings?.tagline ||
                  'Diformulasikan dengan ekstrak botanical terbaik dan bahan aktif premium untuk kilau sehat alami.'}
              </p>
            </div>
            <div className="landing-features-grid" style={{ paddingTop: '1rem' }}>
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

          {/* CARA ORDER + STATISTIK (data asli dari katalog) */}
          <section className="section-alt" id="cara-order" style={{ scrollMarginTop: '120px' }}>
            <div className="container">
              <div className="section-heading">
                <span className="section-heading-eyebrow">Cara Order</span>
                <h2 className="section-heading-title">Pesan dalam <em>3 Langkah</em></h2>
                <p className="section-heading-desc">
                  Tanpa registrasi akun — langsung terhubung ke admin via WhatsApp.
                </p>
              </div>
              <div className="howto-grid">
                <div className="howto-card">
                  <div className="howto-step">1</div>
                  <Search size={20} />
                  <h3>Pilih Produk</h3>
                  <p>Telusuri katalog, gunakan pencarian &amp; filter kategori untuk menemukan produk favoritmu.</p>
                </div>
                <div className="howto-card">
                  <div className="howto-step">2</div>
                  <MessageCircle size={20} />
                  <h3>Klik Pesan WA</h3>
                  <p>Isi nama dan jumlah di modal order — pesan otomatis terformat rapi untuk admin.</p>
                </div>
                <div className="howto-card">
                  <div className="howto-step">3</div>
                  <Package size={20} />
                  <h3>Konfirmasi &amp; Pengiriman</h3>
                  <p>Admin mengonfirmasi ketersediaan dan total harga langsung di chat WhatsApp.</p>
                </div>
              </div>

              <div className="stats-strip">
                {catalogStats.map((s) => (
                  <div className="stat-box" key={s.label}>
                    <span className="stat-num">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DETAIL MODAL */}
          {selectedProductForDetail && (
            <ProductDetailModal
              product={products.find((p) => p.id === selectedProductForDetail.id) || selectedProductForDetail}
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

          {/* FLOATING WHATSAPP + BACK TO TOP */}
          </main>
          <button
            type="button"
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Kembali ke atas"
            aria-label="Kembali ke atas"
          >
            <ArrowUp size={20} />
          </button>
          <a
            className="whatsapp-float"
            href={`https://wa.me/${(storeSettings?.phone || '6282298656732').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo, saya mau tanya produk Vuebee.')}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat WhatsApp"
            aria-label="Chat WhatsApp"
          >
            <MessageCircle size={26} />
          </a>
          {/* FOOTER */}
          <footer className="site-luxury-footer footer-premium" id="footer-section" style={{ scrollMarginTop: '100px' }}>
            <div className="footer-gold-line" aria-hidden="true" />
            <div className="container">
              <div className="footer-top-grid">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                    <VubeeLogo height={32} variant="light" />
                    <span className="footer-brand-name">
                      {storeSettings?.storeName || 'Vuebee'}
                    </span>
                  </div>

                  <p className="footer-brand-desc">
                    {storeSettings?.tagline ||
                      'Minimalist Luxury Skincare & Makeup. Kami menghadirkan inovasi formulasi kecantikan terpercaya untuk pancaran kulit alami yang sehat dan bercahaya.'}
                  </p>

                  <div className="footer-trust-strip">
                    <span className="trust-badge"><ShieldCheck size={13} /> BPOM</span>
                    <span className="trust-badge"><Heart size={13} /> Halal</span>
                    <span className="trust-badge"><MessageCircle size={13} /> WA Cepat</span>
                  </div>
                </div>

                <div>
                  <h4 className="footer-col-title">Navigasi Cepat</h4>
                  <ul className="footer-links-list">
                    <li>
                      <a href="#beranda" onClick={(e) => { e.preventDefault(); scrollToSection('beranda'); }}>
                        Beranda
                      </a>
                    </li>
                    <li>
                      <a href="#katalog" onClick={(e) => { e.preventDefault(); scrollToSection('katalog'); }}>
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
                  <h4 className="footer-col-title">Kategori</h4>
                  <ul className="footer-links-list">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <a
                          href="#katalog"
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveCategoryId(cat.id);
                            scrollToSection('katalog');
                          }}
                        >
                          {cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="footer-col-title">Kontak &amp; Lokasi</h4>
                  <ul className="footer-links-list">
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <MapPin size={16} style={{ flexShrink: 0, marginTop: '0.2rem', color: 'var(--color-accent)' }} />
                      <span>{storeSettings?.address || 'Jakarta Selatan, Indonesia'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
                      <span>+{storeSettings?.phone || '6282298656732'}</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageCircle size={16} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
                      <span>Layanan WhatsApp 09:00 - 21:00 WIB</span>
                    </li>
                  </ul>
                  <a
                    className="btn btn-wa btn-sm"
                    style={{ marginTop: '1rem', textDecoration: 'none' }}
                    href={`https://wa.me/${(storeSettings?.phone || '6282298656732').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} />
                    <span>Chat WhatsApp</span>
                  </a>
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
