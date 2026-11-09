import React, { useState, useEffect } from 'react';
import { X, PackageMinus, AlertCircle, Save, Minus, Plus } from 'lucide-react';

export const StockAdjustModal = ({ product, onClose, onConfirm }) => {
    const [amount, setAmount] = useState(1);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentStock = product
        ? (product.stock !== undefined && product.stock !== null
            ? Number(product.stock)
            : (product.stockStatus === 'Habis' ? 0 : 10))
        : 0;

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

    useEffect(() => {
        // Reset form setiap kali modal dibuka untuk produk lain.
        setAmount(1);
        setErrorMsg('');
        setIsSubmitting(false);
    }, [product]);

    if (!product) return null;

    const amountNum = Number(amount) || 0;
    const remainingStock = Math.max(0, currentStock - amountNum);

    const stepAmount = (delta) => {
        setErrorMsg('');
        const next = amountNum + delta;
        if (next < 1 || next > currentStock) return;
        setAmount(next);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const qty = parseInt(amount, 10);
        if (isNaN(qty) || qty < 1) {
            setErrorMsg('Jumlah terjual harus minimal 1 unit.');
            return;
        }
        if (qty > currentStock) {
            setErrorMsg(`Jumlah terjual melebihi stok tersedia (${currentStock} unit).`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onConfirm(qty);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Gagal mencatat penjualan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay-backdrop" onClick={onClose} style={{ zIndex: 150 }}>
            <div
                className="modal-luxury-window animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '460px' }}
                role="dialog"
                aria-modal="true"
                aria-label={`Catat terjual ${product.name}`}
            >
                <div className="modal-header-bar">
                    <div className="modal-header-titles">
                        <h2>Catat Terjual</h2>
                        <p>Kurangi stok setelah transaksi terkonfirmasi di WhatsApp</p>
                    </div>
                    <button
                        type="button"
                        className="modal-close-icon-btn"
                        onClick={onClose}
                        title="Tutup"
                        aria-label="Tutup"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-inner-body">
                        {errorMsg && (
                            <div className="form-alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '0.85rem',
                            alignItems: 'center',
                            backgroundColor: 'var(--color-surface-subtle)',
                            padding: '0.9rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            marginBottom: '1.25rem',
                        }}>
                            <span style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden',
                                border: '1px solid var(--color-border)',
                            }}>
                                {product.image ? (
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <PackageMinus size={20} color="var(--color-text-muted)" />
                                )}
                            </span>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {product.name}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                    Stok saat ini: <strong>{currentStock} unit</strong>
                                </div>
                            </div>
                        </div>

                        {currentStock === 0 ? (
                            <p style={{ fontSize: '0.88rem', color: 'var(--color-danger)', margin: 0 }}>
                                Stok produk ini sudah habis, tidak ada unit yang bisa dicatat sebagai terjual.
                            </p>
                        ) : (
                            <>
                                <div className="form-group-item" style={{ marginBottom: '0.75rem' }}>
                                    <label className="form-label-title" htmlFor="sold-qty-input">
                                        <span>Jumlah Terjual</span>
                                        <span style={{ color: 'var(--color-danger)', marginLeft: '0.2rem' }}>*</span>
                                    </label>
                                    {/* Stepper: target sentuh 44px, font ≥16px agar tidak auto-zoom di iOS */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => stepAmount(-1)}
                                            disabled={amountNum <= 1 || isSubmitting}
                                            aria-label="Kurangi jumlah terjual"
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--color-border)',
                                                backgroundColor: amountNum <= 1 ? 'var(--color-surface-subtle)' : '#FFFFFF',
                                                color: amountNum <= 1 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                                cursor: amountNum <= 1 ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <input
                                                id="sold-qty-input"
                                                type="number"
                                                className="form-input-control"
                                                min="1"
                                                max={currentStock}
                                                step="1"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                autoComplete="off"
                                                value={amount === '' ? '' : amount}
                                                onChange={(e) => {
                                                    setErrorMsg('');
                                                    const raw = e.target.value;
                                                    setAmount(raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0));
                                                }}
                                                onBlur={() => {
                                                    // Kembalikan ke 1 bila kosong / tidak valid agar tidak terkirim 0.
                                                    if (amount === '' || isNaN(amount)) setAmount(1);
                                                    else if (Number(amount) > currentStock) setAmount(currentStock);
                                                }}
                                                required
                                                style={{
                                                    textAlign: 'center',
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    color: 'var(--color-primary)',
                                                    paddingRight: '3.25rem',
                                                    height: '44px',
                                                }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                right: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                color: 'var(--color-text-muted)',
                                                pointerEvents: 'none',
                                            }}>
                                                Unit
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => stepAmount(1)}
                                            disabled={amountNum >= currentStock || isSubmitting}
                                            aria-label="Tambah jumlah terjual"
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--color-border)',
                                                backgroundColor: amountNum >= currentStock ? 'var(--color-surface-subtle)' : '#FFFFFF',
                                                color: amountNum >= currentStock ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                                cursor: amountNum >= currentStock ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 0' }}>
                                    Sisa stok setelah dicatat: <strong style={{ color: 'var(--color-primary)' }}>{remainingStock} unit</strong>
                                    {remainingStock === 0 ? ' (otomatis berstatus Habis)' : ''}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="modal-bottom-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || currentStock === 0}
                        >
                            <Save size={16} />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Catat Terjual'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustModal;
