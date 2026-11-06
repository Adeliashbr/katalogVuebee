import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';

const PRESET_SKINCARE_IMAGES = [
    { label: 'Velvet Lip Cream', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80' },
    { label: 'Matte Foundation', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Blush Pop Cream', url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80' },
    { label: 'Glow Cushion', url: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=800&q=80' },
    { label: 'Eyeshadow Palette', url: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=800&q=80' },
    { label: 'Precision Brow Pencil', url: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&w=800&q=80' },
    { label: 'Hydra Glow Moisturizer', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Gentle Cleanser', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80' },
    { label: 'Daily Sun Protection', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80' }
];

export const ProductFormModal = ({ isOpen, onClose, onSave, editingProduct, categories }) => {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [stockStatus, setStockStatus] = useState('Tersedia');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewSrc, setPreviewSrc] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name || '');
            setCategoryId(editingProduct.categoryId || (categories[0]?.id || ''));
            setPrice(editingProduct.price ? String(editingProduct.price) : '');
            setStockStatus(editingProduct.stockStatus || 'Tersedia');
            setDescription(editingProduct.description || '');
            setImageUrl(editingProduct.image || '');
            setPreviewSrc(editingProduct.image || '');
            setSelectedFile(null);
        } else {
            setName('');
            setCategoryId(categories[0]?.id || '');
            setPrice('');
            setStockStatus('Tersedia');
            setDescription('');
            setImageUrl(PRESET_SKINCARE_IMAGES[0].url);
            setPreviewSrc(PRESET_SKINCARE_IMAGES[0].url);
            setSelectedFile(null);
        }
        setErrorMsg('');
    }, [editingProduct, categories, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewSrc(objectUrl);
        }
    };

    const handleSelectPreset = (url) => {
        setSelectedFile(null);
        setImageUrl(url);
        setPreviewSrc(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!name.trim()) {
            setErrorMsg('Nama produk wajib diisi.');
            return;
        }
        if (!categoryId) {
            setErrorMsg('Kategori produk wajib dipilih.');
            return;
        }
        if (!price || isNaN(price) || Number(price) <= 0) {
            setErrorMsg('Harga produk harus angka positif.');
            return;
        }

        setIsSubmitting(true);
        try {
            let payload;
            if (selectedFile) {
                payload = new FormData();
                payload.append('name', name.trim());
                payload.append('categoryId', categoryId);
                payload.append('price', price);
                payload.append('stockStatus', stockStatus);
                payload.append('description', description.trim());
                payload.append('photo', selectedFile);
            } else {
                payload = {
                    name: name.trim(),
                    categoryId,
                    price: Number(price),
                    stockStatus,
                    description: description.trim(),
                    imageUrl: previewSrc || imageUrl
                };
            }

            await onSave(payload, editingProduct?.id);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Gagal menyimpan produk.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay-backdrop" onClick={onClose}>
            <div
                className="modal-luxury-window animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '620px' }}
            >
                <div className="modal-header-bar">
                    <div className="modal-header-titles">
                        <h2>
                            {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                        </h2>
                        <p>
                            Lengkapi data produk untuk katalog Vuebee
                        </p>
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

                <form onSubmit={handleSubmit}>
                    <div className="modal-inner-body">
                        {errorMsg && (
                            <div className="form-alert-error animate-fade-in">
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Image Preview & Selector */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            backgroundColor: 'var(--color-surface-subtle)',
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: '1.5rem',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '84px',
                                    height: '84px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: '#FFFFFF',
                                    overflow: 'hidden',
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {previewSrc ? (
                                        <img src={previewSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ImageIcon size={28} color="var(--color-text-muted)" />
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', marginBottom: '0.4rem' }}>
                                        <Upload size={14} />
                                        <span>Unggah Foto dari Perangkat</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        Format JPG, PNG, atau WebP. Maks 5MB.
                                    </p>
                                </div>
                            </div>

                            {/* Preset images */}
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', display: 'block', marginBottom: '0.4rem' }}>
                                    Atau pilih sampel foto skincare cepat:
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                    {PRESET_SKINCARE_IMAGES.map((preset, idx) => (
                                        <button
                                            type="button"
                                            key={idx}
                                            onClick={() => handleSelectPreset(preset.url)}
                                            style={{
                                                width: '46px',
                                                height: '46px',
                                                borderRadius: 'var(--radius-sm)',
                                                overflow: 'hidden',
                                                border: previewSrc === preset.url ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                                flexShrink: 0,
                                                padding: 0
                                            }}
                                            title={preset.label}
                                        >
                                            <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Product Name */}
                        <div className="form-group-item">
                            <label className="form-label-title">
                                <span>Nama Produk</span>
                                <span style={{ color: 'var(--color-danger)', marginLeft: '0.2rem' }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input-control"
                                placeholder="Contoh: Vuebee Velvet Matte Lip Cream"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Category & Price */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label className="form-label-title">
                                    <span>Kategori</span>
                                    <span style={{ color: 'var(--color-danger)', marginLeft: '0.2rem' }}>*</span>
                                </label>
                                <select
                                    className="form-select-control"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label-title">
                                    <span>Harga (Rp)</span>
                                    <span style={{ color: 'var(--color-danger)', marginLeft: '0.2rem' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-input-control"
                                    placeholder="85000"
                                    min="0"
                                    step="500"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className="form-group-item">
                            <label className="form-label-title">
                                <span>Status Ketersediaan Stok</span>
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: stockStatus === 'Tersedia' ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
                                    backgroundColor: stockStatus === 'Tersedia' ? 'var(--color-success-bg)' : '#FFFFFF',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="radio"
                                        name="stockStatus"
                                        value="Tersedia"
                                        checked={stockStatus === 'Tersedia'}
                                        onChange={() => setStockStatus('Tersedia')}
                                    />
                                    <div>
                                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>Tersedia</strong>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', margin: 0 }}>Dapat dipesan pelanggan</p>
                                    </div>
                                </label>

                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: stockStatus === 'Habis' ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                                    backgroundColor: stockStatus === 'Habis' ? 'var(--color-danger-bg)' : '#FFFFFF',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="radio"
                                        name="stockStatus"
                                        value="Habis"
                                        checked={stockStatus === 'Habis'}
                                        onChange={() => setStockStatus('Habis')}
                                    />
                                    <div>
                                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-danger)' }}>Stok Habis</strong>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', margin: 0 }}>Tombol dinonaktifkan</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-group-item">
                            <label className="form-label-title">
                                <span>Deskripsi Produk</span>
                            </label>
                            <textarea
                                rows="3"
                                className="form-textarea-control"
                                placeholder="Jelaskan manfaat, tekstur, kandungan utama, atau hasil akhir produk..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-bottom-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            <Save size={16} />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
