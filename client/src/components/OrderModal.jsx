import React, { useState } from 'react';
import { X, MessageCircle, AlertCircle, Send, Check } from 'lucide-react';

export const OrderModal = ({ product, storeSettings, onClose, initialQuantity = 1 }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [quantity, setQuantity] = useState(initialQuantity || 1);
    const [showError, setShowError] = useState(false);

    if (!product) return null;

    const storeName = storeSettings?.storeName || 'Vuebee';
    const storePhone = (storeSettings?.phone || '6282298656732').replace(/[^0-9]/g, '');

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num || 0);
    };

    const totalPrice = (product.price || 0) * quantity;

    // Build Formatted WhatsApp message
    const generateMessage = () => {
        const nameStr = customerName.trim() ? customerName.trim() : '(Nama Pemesan)';
        const notesStr = customerNotes.trim() ? customerNotes.trim() : '-';

        return `Halo ${storeName}, saya ${nameStr} ingin memesan produk berikut:
- Produk: ${product.name}
- Jumlah: ${quantity} item
- Total Harga: ${formatRupiah(totalPrice)}
- Catatan / Alamat: ${notesStr}

Mohon konfirmasi ketersediaan dan proses pemesanan saya. Terima kasih!`;
    };

    const handleSubmitOrder = (e) => {
        e.preventDefault();

        if (!customerName.trim()) {
            setShowError(true);
            const input = document.getElementById('customer-name-input');
            if (input) input.focus();
            return;
        }

        setShowError(false);
        const finalMessage = generateMessage();
        const encodedText = encodeURIComponent(finalMessage);
        const waUrl = `https://wa.me/${storePhone}?text=${encodedText}`;

        window.open(waUrl, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const defaultImage = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80';

    return (
        <div className="modal-overlay-backdrop" onClick={onClose}>
            <div
                className="modal-luxury-window animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '540px' }}
            >
                {/* Modal Header */}
                <div className="modal-header-bar">
                    <div className="modal-header-titles">
                        <h2>Konfirmasi Pesanan WhatsApp</h2>
                        <p>Pesan langsung ke WhatsApp Official {storeName}</p>
                    </div>

                    <button
                        type="button"
                        className="modal-close-icon-btn"
                        onClick={onClose}
                        title="Tutup"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitOrder}>
                    <div className="modal-inner-body">
                        {/* Summary Box */}
                        <div className="order-product-summary">
                            <img
                                src={product.image || defaultImage}
                                alt={product.name}
                                className="summary-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultImage;
                                }}
                            />

                            <div className="summary-details">
                                <span className="summary-category">
                                    {product.categoryName || 'Vuebee'}
                                </span>

                                <h4 className="summary-name" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                    {product.name}
                                </h4>

                                <div className="summary-price-row">
                                    <span className="summary-unit-price">
                                        {formatRupiah(product.price)} / item
                                    </span>

                                    <div className="quantity-control">
                                        <button
                                            type="button"
                                            className="qty-btn"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="qty-number">{quantity}</span>
                                        <button
                                            type="button"
                                            className="qty-btn"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Price Banner */}
                        <div className="order-total-bar">
                            <span>Perkiraan Total:</span>
                            <span className="total-amount">
                                {formatRupiah(totalPrice)}
                            </span>
                        </div>

                        {/* Validation Error */}
                        {showError && (
                            <div className="form-alert-error animate-fade-in" id="name-validation-alert">
                                <AlertCircle size={16} />
                                <span>Nama lengkap wajib diisi untuk memesan via WhatsApp.</span>
                            </div>
                        )}

                        {/* Input Customer Name */}
                        <div className="form-group-item">
                            <label className="form-label-title" htmlFor="customer-name-input">
                                <span>Nama Lengkap Anda</span>
                                <span style={{ color: 'var(--color-danger)', marginLeft: '0.2rem' }}>*</span>
                            </label>
                            <input
                                id="customer-name-input"
                                type="text"
                                className="form-input-control"
                                placeholder="Contoh: Budi Pratama"
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    if (e.target.value.trim()) setShowError(false);
                                }}
                                autoFocus
                            />
                        </div>

                        {/* Input Notes / Address */}
                        <div className="form-group-item">
                            <label className="form-label-title" htmlFor="customer-notes-input">
                                <span>Catatan Khusus / Alamat Pengiriman (Opsional)</span>
                            </label>
                            <textarea
                                id="customer-notes-input"
                                rows="2"
                                className="form-textarea-control"
                                placeholder="Contoh: Shade Natural Beige, alamat kirim ke Jakarta Barat..."
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                            />
                        </div>

                        {/* Live WhatsApp Preview */}
                        <div className="wa-preview-box">
                            <div className="wa-preview-header">
                                <MessageCircle size={14} />
                                <span>PREVIEW PESAN OTOMATIS:</span>
                            </div>
                            <div className="wa-bubble">
                                {generateMessage()}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-bottom-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            className="btn btn-wa"
                            id="submit-wa-order-btn"
                        >
                            <Send size={15} />
                            <span>Kirim ke WhatsApp</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;
