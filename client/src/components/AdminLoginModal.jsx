import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { loginAdmin, setAuthToken } from '../services/api';
import { VubeeLogo } from './VubeeLogo';

export const AdminLoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    if (!isOpen) return null;

    const handleFillDemo = () => {
        setEmail('admin@katalogwa.com');
        setPassword('admin123');
        setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!email.trim() || !password.trim()) {
            setErrorMsg('Email dan Password wajib diisi.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await loginAdmin(email.trim(), password);
            setAuthToken(result.token);
            onSuccess(result.user);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Email atau Password salah.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay-backdrop" onClick={onClose}>
            <div
                className="modal-luxury-window animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '440px', background: '#FFFFFF' }}
            >
                {/* Header */}
                <div className="modal-header-bar" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <VubeeLogo height={28} variant="dark" />
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
                    <div className="modal-inner-body" style={{ paddingTop: '0.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                            <div style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-surface-subtle)',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                <Lock size={22} />
                            </div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
                                Login Admin Portal
                            </h2>
                            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
                                Masuk untuk mengelola katalog produk dan pengaturan toko Vuebee.
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="form-alert-error animate-fade-in">
                                <AlertCircle size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="form-group-item">
                            <label className="form-label-title" htmlFor="admin-email-input">
                                Alamat Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="admin-email-input"
                                    type="email"
                                    className="form-input-control"
                                    placeholder="admin@katalogwa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                    autoFocus
                                    required
                                />
                                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            </div>
                        </div>

                        <div className="form-group-item">
                            <label className="form-label-title" htmlFor="admin-password-input">
                                Kata Sandi
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="admin-password-input"
                                    type="password"
                                    className="form-input-control"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                    required
                                />
                                <KeyRound size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                            disabled={isLoading}
                        >
                            <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
                            <ArrowRight size={16} />
                        </button>

                        {/* Quick Demo Fill */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '0.85rem',
                            backgroundColor: 'var(--color-surface-subtle)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed var(--color-border)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                                Akun demo evaluator:
                            </p>
                            <button
                                type="button"
                                onClick={handleFillDemo}
                                style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--color-accent)',
                                    fontWeight: 700,
                                    textDecoration: 'underline'
                                }}
                            >
                                Klik untuk mengisi otomatis (admin@katalogwa.com / admin123)
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginModal;
