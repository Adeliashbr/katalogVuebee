import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Save, AlertCircle, Plus, Minus, CheckCircle2 } from 'lucide-react';

export const ProductFormModal = ({
    isOpen,
    onClose,
    onSave,
    onRefreshData,
    editingProduct,
    categories
}) => {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState(10);
    const [stockStatus, setStockStatus] = useState('Tersedia');
    const [description, setDescription] = useState('');
    const [imageSourceMode, setImageSourceMode] = useState('upload'); // 'upload' | 'url'
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewSrc, setPreviewSrc] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        document.body.classList.add('modal-open-locked');
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('modal-open-locked');
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name || '');
            setCategoryId(editingProduct.categoryId || (categories[0]?.id || ''));
            setPrice(editingProduct.price ? String(editingProduct.price) : '');
            const currentStock = editingProduct.stock !== undefined && editingProduct.stock !== null
                ? Number(editingProduct.stock)
                : (editingProduct.stockStatus === 'Habis' ? 0 : 10);
            setStock(currentStock);
            setStockStatus(currentStock > 0 ? 'Tersedia' : 'Habis');
            setDescription(editingProduct.description || '');

            const isUploaded = (editingProduct.image || '').startsWith('/uploads/');
            setImageSourceMode(isUploaded ? 'upload' : (editingProduct.image ? 'url' : 'upload'));
            setImageUrl(isUploaded ? '' : (editingProduct.image || ''));
            setPreviewSrc(editingProduct.image || '');
            setSelectedFile(null);
        } else {
            setName('');
            setCategoryId(categories[0]?.id || '');
            setPrice('');
            setStock(10);
            setStockStatus('Tersedia');
            setDescription('');
            setImageSourceMode('upload');
            setImageUrl('');
            setPreviewSrc('');
            setSelectedFile(null);
        }
        setErrorMsg('');
    }, [editingProduct, categories, isOpen]);

    if (!isOpen) return null;

    // Helper untuk membuang leading zero (mencegah "012")
    const parseCleanInt = (val) => {
        if (val === '' || val === null || val === undefined) return 0;
        const cleanStr = String(val).replace(/^0+(?=\d)/, '');
        const n = parseInt(cleanStr, 10);
        return isNaN(n) ? 0 : Math.max(0, n);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImageSourceMode('upload');
            const objectUrl = URL.createObjectURL(file);
            setPreviewSrc(objectUrl);
        }
    };

    const handleImageUrlChange = (value) => {
        setImageUrl(value);
        if (imageSourceMode === 'url') {
            setPreviewSrc(value);
        }
    };

    const handleSelectImageMode = (mode) => {
        setImageSourceMode(mode);
        if (mode === 'upload') {
            if (selectedFile) {
                setPreviewSrc(URL.createObjectURL(selectedFile));
            } else if (editingProduct?.image && editingProduct.image.startsWith('/uploads/')) {
                setPreviewSrc(editingProduct.image);
            } else {
                setPreviewSrc('');
            }
        } else {
            setPreviewSrc(imageUrl || (editingProduct?.image && !editingProduct.image.startsWith('/uploads/') ? editingProduct.image : ''));
        }
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
        if (stock === '' || isNaN(stock) || Number(stock) < 0) {
            setErrorMsg('Jumlah stok harus berupa bilangan bulat minimal 0.');
            return;
        }

        const computedStatus = Number(stock) > 0 ? 'Tersedia' : 'Habis';

        setIsSubmitting(true);
        try {
            let payload;
            if (imageSourceMode === 'upload' && selectedFile) {
                payload = new FormData();
                payload.append('name', name.trim());
                payload.append('categoryId', categoryId);
                payload.append('price', price);
                payload.append('stock', stock);
                payload.append('stockStatus', computedStatus);
                payload.append('description', description.trim());
                payload.append('photo', selectedFile);
            } else {
                const finalImgUrl = imageSourceMode === 'url' ? imageUrl.trim() : (editingProduct?.image || '');
                payload = {
                    name: name.trim(),
                    categoryId,
                    price: Number(price),
                    stock: Number(stock),
                    stockStatus: computedStatus,
                    description: description.trim(),
                    imageUrl: finalImgUrl
                };
            }

            await onSave(payload, editingProduct?.id);
            if (onRefreshData) onRefreshData();
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Gagal menyimpan produk.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay-backdrop" onClick={onClose} style={{ zIndex: 150 }}>
            <div
                className="modal-luxury-window animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '660px', maxHeight: '88vh', overflowY: 'auto' }}
            >
                <div className="modal-header-bar">
                    <div className="modal-header-titles">
                        <h2>
                            {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                        </h2>
                        <p>
                            Lengkapi data produk dan kelola stok untuk katalog Vuebee
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
                            <div className="form-alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* PEMISAHAN UPLOAD GAMBAR vs URL EKSTERNAL */}
                        <div style={{
                            backgroundColor: 'var(--color-surface-subtle)',
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: '1.5rem',
                            border: '1px solid var(--color-border)'
                        }}>
                            <label className="form-label-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>Foto Produk</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                                    Pilih salah satu metode
                                </span>
                            </label>

                            {/* Pilihan Metode Gambar */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => handleSelectImageMode('upload')}
                                    style={{
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: imageSourceMode === 'upload' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                        backgroundColor: imageSourceMode === 'upload' ? '#FFFFFF' : 'transparent',
                                        color: imageSourceMode === 'upload' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        fontWeight: imageSourceMode === 'upload' ? 700 : 500,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.45rem'
                                    }}
                                >
                                    <Upload size={14} />
                                    <span>1. Upload dari Perangkat</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSelectImageMode('url')}
                                    style={{
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: imageSourceMode === 'url' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                        backgroundColor: imageSourceMode === 'url' ? '#FFFFFF' : 'transparent',
                                        color: imageSourceMode === 'url' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        fontWeight: imageSourceMode === 'url' ? 700 : 500,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.45rem'
                                    }}
                                >
                                    <ImageIcon size={14} />
                                    <span>2. Gunakan URL Eksternal</span>
                                </button>
                            </div>

                            {/* Preview + Input Container */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '88px',
                                    height: '88px',
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
                                    {imageSourceMode === 'upload' ? (
                                        <div>
                                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', marginBottom: '0.4rem' }}>
                                                <Upload size={14} />
                                                <span>Pilih Gambar dari Perangkat</span>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                {selectedFile ? `File terpilih: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)` : 'Format JPG, PNG, atau WebP. Maksimal 5MB.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="url"
                                                className="form-input-control"
                                                placeholder="https://example.com/images/product.jpg"
                                                value={imageUrl}
                                                onChange={(e) => handleImageUrlChange(e.target.value)}
                                            />
                                            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                                                Tempel link gambar dari web luar (harus diawali http:// atau https://).
                                            </p>
                                        </div>
                                    )}
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

                        {/* ============================================================== */}
                        {/* FITUR PENGELOLAAN STOK TERPADU & RAPI (TIDAK BERANTAKAN)        */}
                        {/* ============================================================== */}
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.25rem',
                            marginBottom: '1.25rem',
                            boxShadow: '0 2px 6px rgba(10, 15, 35, 0.04)'
                        }}>
                            {/* Baris Judul & Badge Status */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                                <div>
                                    <label className="form-label-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>Jumlah Stok Produk</span>
                                        <span style={{ color: 'var(--color-danger)' }}>*</span>
                                    </label>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                        Kelola ketersediaan unit untuk ditampilkan di katalog pelanggan
                                    </p>
                                </div>
                                <span className={`badge ${Number(stock) > 0 ? 'badge-success' : 'badge-danger'}`} style={{
                                    fontWeight: 700,
                                    padding: '0.35rem 0.85rem',
                                    fontSize: '0.82rem',
                                    borderRadius: 'var(--radius-full)'
                                }}>
                                    {Number(stock) > 0 ? `Tersedia (${stock} Unit)` : 'Stok Habis'}
                                </span>
                            </div>

                            {/* Stepper Bar: Minus (-) | Input Angka | Plus (+) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = Number(stock) || 0;
                                        const next = Math.max(0, current - 1);
                                        setStock(next);
                                        setStockStatus(next > 0 ? 'Tersedia' : 'Habis');
                                    }}
                                    disabled={Number(stock) <= 0}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: Number(stock) <= 0 ? 'var(--color-surface-subtle)' : '#FFFFFF',
                                        color: Number(stock) <= 0 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                        cursor: Number(stock) <= 0 ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.2rem',
                                        transition: 'all 0.15s ease',
                                        flexShrink: 0
                                    }}
                                    title="Kurangi 1 unit"
                                >
                                    <Minus size={18} />
                                </button>

                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type="number"
                                        className="form-input-control"
                                        min="0"
                                        step="1"
                                        value={stock === 0 ? '0' : (stock || '')}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === '') {
                                                setStock('');
                                                return;
                                            }
                                            const n = parseCleanInt(raw);
                                            setStock(n);
                                            setStockStatus(n > 0 ? 'Tersedia' : 'Habis');
                                        }}
                                        onBlur={() => {
                                            if (stock === '' || isNaN(stock)) {
                                                setStock(0);
                                                setStockStatus('Habis');
                                            }
                                        }}
                                        placeholder="0"
                                        required
                                        style={{
                                            textAlign: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: 'var(--color-primary)',
                                            padding: '0.45rem 3.5rem 0.45rem 1rem',
                                            height: '44px'
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
                                        pointerEvents: 'none'
                                    }}>
                                        Unit
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = Number(stock) || 0;
                                        const next = current + 1;
                                        setStock(next);
                                        setStockStatus(next > 0 ? 'Tersedia' : 'Habis');
                                    }}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        backgroundColor: '#FFFFFF',
                                        color: 'var(--color-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.2rem',
                                        transition: 'all 0.15s ease',
                                        flexShrink: 0
                                    }}
                                    title="Tambah 1 unit"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Tombol Pintas / Quick Presets */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                gap: '0.45rem',
                                paddingTop: '0.75rem',
                                borderTop: '1px dashed var(--color-border-subtle)'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginRight: '0.2rem' }}>
                                    Ubah Cepat:
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                                    onClick={() => {
                                        const next = (Number(stock) || 0) + 5;
                                        setStock(next);
                                        setStockStatus('Tersedia');
                                    }}
                                >
                                    +5 Unit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                                    onClick={() => {
                                        const next = (Number(stock) || 0) + 10;
                                        setStock(next);
                                        setStockStatus('Tersedia');
                                    }}
                                >
                                    +10 Unit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                                    onClick={() => {
                                        const next = Math.max(0, (Number(stock) || 0) - 5);
                                        setStock(next);
                                        setStockStatus(next > 0 ? 'Tersedia' : 'Habis');
                                    }}
                                    disabled={Number(stock) < 5}
                                >
                                    -5 Unit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    style={{
                                        padding: '0.25rem 0.65rem',
                                        fontSize: '0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: 'var(--color-danger-bg)',
                                        color: 'var(--color-danger)',
                                        border: '1px solid var(--color-danger-border)',
                                        fontWeight: 600,
                                        marginLeft: 'auto'
                                    }}
                                    onClick={() => {
                                        setStock(0);
                                        setStockStatus('Habis');
                                    }}
                                >
                                    Set Stok Habis (0)
                                </button>
                            </div>

                            {/* Keterangan Sistem */}
                            <p style={{
                                margin: '0.75rem 0 0',
                                fontSize: '0.75rem',
                                color: 'var(--color-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                            }}>
                                <CheckCircle2 size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                <span>Stok &gt; 0 otomatis berstatus <strong>Tersedia</strong>, stok 0 otomatis berstatus <strong>Habis</strong>.</span>
                            </p>
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
