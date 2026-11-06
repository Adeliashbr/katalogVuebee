import React from 'react';
import { MessageCircle, CheckCircle2, XCircle, Eye } from 'lucide-react';

export const ProductCard = ({ product, onSelectProduct, onViewDetail, index = 0 }) => {
    const isAvailable = product.stockStatus === 'Tersedia';

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    const defaultImage = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80';

    const handleCardClick = (e) => {
        // If clicking directly on WA button, don't trigger detail
        if (e.target.closest('.card-wa-btn')) return;
        if (onViewDetail) {
            onViewDetail(product);
        } else if (onSelectProduct) {
            onSelectProduct(product);
        }
    };

    return (
        <div
            className={`product-luxury-card card-anim-card ${!isAvailable ? 'is-out-of-stock' : ''}`}
            style={{ '--card-delay': `${index * 60}ms` }}
            id={`product-${product.id}`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e); }}
        >
            <div className="card-image-wrapper">
                <img
                    src={product.image || defaultImage}
                    alt={product.name}
                    className="card-product-img"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                    }}
                />

                <div className="card-shine" aria-hidden="true" />

                <span className="card-category-tag">
                    {product.categoryName || 'Vuebee'}
                </span>

                <span className={`card-stock-pill ${isAvailable ? 'available' : 'empty'}`}>
                    {isAvailable ? (
                        <>
                            <CheckCircle2 size={11} />
                            <span>Tersedia</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={11} />
                            <span>Habis</span>
                        </>
                    )}
                </span>

                <span className="card-hover-action" aria-hidden="true">
                    <Eye size={15} />
                    <span>Detail Produk</span>
                </span>
            </div>

            <div className="card-body-content">
                <h3 className="card-product-name" title={product.name}>
                    {product.name}
                </h3>

                {product.description && (
                    <p className="card-product-desc">
                        {product.description}
                    </p>
                )}

                <div className="card-bottom-actions">
                    <div className="card-price-block">
                        <span className="card-price-label">Harga</span>
                        <span className="card-price-value">{formatRupiah(product.price)}</span>
                    </div>

                    <button
                        type="button"
                        className="btn btn-wa card-wa-btn"
                        disabled={!isAvailable}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(product);
                        }}
                        id={`btn-order-${product.id}`}
                        title={isAvailable ? 'Pesan produk ini via WhatsApp' : 'Produk saat ini habis'}
                    >
                        <MessageCircle size={14} />
                        <span>{isAvailable ? 'Pesan WA' : 'Habis'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
