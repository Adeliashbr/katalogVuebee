import React, { useState, useEffect } from 'react';
import { X, MessageCircle, CheckCircle2, XCircle, Sparkles, ShieldCheck, Heart, Droplets } from 'lucide-react';

export const ProductDetailModal = ({
    product,
    allProducts = [],
    onClose,
    onOrderProduct
}) => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('desc'); // 'desc' | 'usage' | 'benefits'

    useEffect(() => {
        if (product) {
            setQuantity(1);
            setActiveTab('desc');
        }
    }, [product]);

    useEffect(() => {
        if (!product) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        document.body.classList.add('modal-open-locked');
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('modal-open-locked');
        };
    }, [product, onClose]);

    if (!product) return null;

    const isAvailable = product.stockStatus === 'Tersedia';

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num || 0);
    };

    const defaultImage = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
    const mainImgSrc = product.image || defaultImage;

    // Related products (same category or others)
    const relatedProducts = allProducts
        .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || !product.categoryId))
        .slice(0, 3);

    return (
        <div className="modal-overlay-backdrop" onClick={onClose}>
            <div
                className="modal-luxury-window animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '840px' }}
            >
                {/* Header */}
                <div className="modal-header-bar">
                    <div className="modal-header-titles">
                        <span className="detail-category-badge">{product.categoryName || 'Vuebee Collection'}</span>
                        <h2>Detail Produk</h2>
                    </div>
                    <button
                        type="button"
                        className="modal-close-icon-btn"
                        onClick={onClose}
                        title="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-inner-body">
                    <div className="product-detail-layout">
                        {/* Column 1: Gallery — satu foto utama saja */}
                        <div className="detail-gallery-col">
                            <div className="detail-main-image-box">
                                <img
                                    src={mainImgSrc}
                                    alt={product.name}
                                    className="detail-main-img"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                    }}
                                />
                            </div>
                        </div>

                        {/* Column 2: Info & Purchasing */}
                        <div className="detail-info-col">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span className={`card-stock-pill ${isAvailable ? 'available' : 'empty'}`}>
                                    {isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                    <span>{isAvailable ? 'Stok Tersedia' : 'Stok Habis'}</span>
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--color-sage)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                    <ShieldCheck size={14} /> BPOM & Halal Certified
                                </span>
                            </div>

                            <h1 className="detail-product-name">{product.name}</h1>

                            <div className="detail-price-status-row">
                                <div className="detail-price-text">
                                    {formatRupiah(product.price)}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    Harga Resmi Vuebee
                                </span>
                            </div>

                            {/* Structured Tabs */}
                            <div className="detail-tabs-nav">
                                <button
                                    type="button"
                                    className={`detail-tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('desc')}
                                >
                                    Deskripsi
                                </button>
                                <button
                                    type="button"
                                    className={`detail-tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('usage')}
                                >
                                    Cara Pakai
                                </button>
                                <button
                                    type="button"
                                    className={`detail-tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('benefits')}
                                >
                                    Keunggulan
                                </button>
                            </div>

                            <div className="detail-tab-content-box">
                                {activeTab === 'desc' && (
                                    <p>
                                        {product.description ||
                                            'Formula lembut dan mewah dari Vuebee dirancang khusus untuk memenuhi kebutuhan perawatan kulit Anda sehari-hari dengan hasil alami dan bercahaya.'}
                                    </p>
                                )}
                                {activeTab === 'usage' && (
                                    <div>
                                        <p style={{ marginBottom: '0.5rem' }}>
                                            <strong>Langkah Pemakaian:</strong>
                                        </p>
                                        <ol style={{ paddingLeft: '1.25rem', lineHeight: '1.7' }}>
                                            <li>Bersihkan wajah terlebih dahulu dengan cleanser lembut.</li>
                                            <li>Aplikasikan produk secukupnya secara merata pada area yang diinginkan.</li>
                                            <li>Tepuk perlahan hingga formula meresap sempurna. Gunakan rutin setiap hari untuk hasil optimal.</li>
                                        </ol>
                                    </div>
                                )}
                                {activeTab === 'benefits' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Sparkles size={16} color="var(--color-accent)" />
                                            <span>Memberikan hasil akhir mewah, natural, dan tahan lama</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Droplets size={16} color="var(--color-sage)" />
                                            <span>Menjaga kelembapan kulit secara optimal sepanjang hari</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Heart size={16} color="#E11D48" />
                                            <span>Non-comedogenic, cocok untuk semua jenis kulit</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quantity & Order Actions */}
                            <div className="detail-order-action-box">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                        Jumlah:
                                    </span>
                                    <div className="detail-qty-picker">
                                        <button
                                            type="button"
                                            className="qty-step-btn"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={!isAvailable}
                                        >
                                            -
                                        </button>
                                        <span className="qty-step-val">{quantity}</span>
                                        <button
                                            type="button"
                                            className="qty-step-btn"
                                            onClick={() => setQuantity(quantity + 1)}
                                            disabled={!isAvailable}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-wa"
                                    style={{ flex: 1, padding: '0.75rem 1.25rem' }}
                                    disabled={!isAvailable}
                                    onClick={() => onOrderProduct(product, quantity)}
                                >
                                    <MessageCircle size={18} />
                                    <span>{isAvailable ? 'Pesan Langsung via WhatsApp' : 'Stok Habis'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rekomendasi Produk Terkait */}
                    {relatedProducts.length > 0 && (
                        <div className="detail-recommended-section">
                            <h3 className="recommended-title">Rekomendasi Pilihan Lainnya</h3>
                            <div className="recommended-mini-grid">
                                {relatedProducts.map((rel) => (
                                    <div
                                        key={rel.id}
                                        className="mini-rec-card"
                                        onClick={() => {
                                            setQuantity(1);
                                            onOrderProduct(rel, 1, false); // opens new product detail
                                        }}
                                    >
                                        <img
                                            src={rel.image || defaultImage}
                                            alt={rel.name}
                                            className="mini-rec-img"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = defaultImage;
                                            }}
                                        />
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {rel.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                                                {formatRupiah(rel.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;

