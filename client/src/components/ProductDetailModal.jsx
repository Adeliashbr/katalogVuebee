import React, { useState, useEffect } from 'react';
import { X, MessageCircle, CheckCircle2, XCircle, Sparkles, ShieldCheck, Heart, Droplets, PackageCheck, PackageX } from 'lucide-react';

export const ProductDetailModal = ({
    product,
    onClose,
    onOrderProduct
}) => {
    const [activeTab, setActiveTab] = useState('desc'); // 'desc' | 'usage' | 'benefits'

    useEffect(() => {
        if (product) {
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

    // Kuantitas stok aktual dari database
    const actualStock = product.stock !== undefined && product.stock !== null
        ? Math.max(0, Number(product.stock))
        : (product.stockStatus === 'Tersedia' ? 10 : 0);

    const isAvailable = actualStock > 0 && product.stockStatus !== 'Habis';

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num || 0);
    };

    const defaultImage = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80';
    const mainImgSrc = product.image || defaultImage;

    return (
        <div
            className="modal-overlay-backdrop product-detail-backdrop"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 150,
                backgroundColor: 'rgba(10, 15, 35, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 1rem',
                overflowY: 'auto'
            }}
        >
            <div
                className="modal-luxury-window animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '820px',
                    width: '100%',
                    margin: 'auto',
                    maxHeight: '84vh',
                    borderRadius: '24px',
                    boxShadow: '0 25px 60px -15px rgba(10, 15, 35, 0.4), 0 0 0 1px rgba(197, 168, 128, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div className="modal-header-bar" style={{ padding: '1.25rem 1.75rem', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div className="modal-header-titles">
                        <span className="detail-category-badge">{product.categoryName || 'Vuebee Collection'}</span>
                        <h2 style={{ fontSize: '1.4rem' }}>Detail Produk</h2>
                    </div>
                    <button
                        type="button"
                        className="modal-close-icon-btn"
                        onClick={onClose}
                        title="Tutup"
                        aria-label="Tutup detail produk"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-inner-body" style={{ padding: '1.75rem', overflowY: 'auto' }}>
                    <div className="product-detail-layout" style={{ gap: '2rem' }}>
                        {/* Column 1: Gallery */}
                        <div className="detail-gallery-col">
                            <div className="detail-main-image-box" style={{ borderRadius: '18px', overflow: 'hidden' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                                <span className={`card-stock-pill ${isAvailable ? 'available' : 'empty'}`}>
                                    {isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                    <span>{isAvailable ? `Stok Tersedia: ${actualStock} Unit` : 'Stok Habis'}</span>
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--color-sage)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                                    <ShieldCheck size={14} /> BPOM &amp; Halal Certified
                                </span>
                            </div>

                            <h1 className="detail-product-name" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{product.name}</h1>

                            <div className="detail-price-status-row" style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                                <div className="detail-price-text" style={{ fontSize: '1.55rem', color: 'var(--color-primary)' }}>
                                    {formatRupiah(product.price)}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    Harga Resmi Vuebee
                                </span>
                            </div>

                            {/* Structured Tabs */}
                            <div className="detail-tabs-nav" style={{ marginBottom: '1rem' }}>
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

                            <div className="detail-tab-content-box" style={{ minHeight: '90px', marginBottom: '1.5rem' }}>
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

                            {/* FITUR 1: AREA INFORMASI STOK & TOMBOL WHATSAPP (TANPA INPUT JUMLAH PEMESANAN) */}
                            <div className="detail-order-action-box" style={{
                                backgroundColor: 'var(--color-surface-subtle)',
                                padding: '1.15rem',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.85rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                        Ketersediaan Produk:
                                    </span>
                                    {isAvailable ? (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            fontWeight: 700,
                                            fontSize: '0.88rem',
                                            color: 'var(--color-success)',
                                            backgroundColor: 'var(--color-success-bg)',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: 'var(--radius-full)'
                                        }}>
                                            <PackageCheck size={16} />
                                            <span>Stok Tersedia: {actualStock} Unit</span>
                                        </span>
                                    ) : (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            fontWeight: 700,
                                            fontSize: '0.88rem',
                                            color: 'var(--color-danger)',
                                            backgroundColor: 'var(--color-danger-bg)',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: 'var(--radius-full)'
                                        }}>
                                            <PackageX size={16} />
                                            <span>Stok Habis</span>
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-wa"
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1.25rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.55rem'
                                    }}
                                    disabled={!isAvailable}
                                    onClick={() => onOrderProduct(product, 1)}
                                >
                                    <MessageCircle size={18} />
                                    <span>{isAvailable ? 'Pesan Langsung via WhatsApp' : 'Stok Habis'}</span>
                                </button>
                                {isAvailable && (
                                    <p style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                                        Jumlah pesanan dapat Anda diskusikan langsung melalui percakapan WhatsApp dengan admin kami.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
