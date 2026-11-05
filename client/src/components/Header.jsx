import React, { useState } from 'react';
import {
    ShoppingBag,
    Lock,
    LogOut,
    LayoutDashboard,
    Store,
    Menu,
    X,
    Sparkles,
    Shield
} from 'lucide-react';
import { VubeeLogo } from './VubeeLogo';

export const Header = ({
    storeSettings,
    isAdminView,
    setIsAdminView,
    adminUser,
    onOpenLogin,
    onLogout,
    activeView = 'catalog',
    setActiveView
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavClick = (view) => {
        if (setActiveView) setActiveView(view);
        setIsAdminView(false);
        setIsMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <header className="site-header">
            <div className="container header-container">
                {/* Brand Logo & Name */}
                <div
                    className="brand-link"
                    onClick={() => handleNavClick('landing')}
                    title="Vuebee - Beranda"
                >
                    <VubeeLogo height={38} variant="default" />
                </div>

                {/* Desktop Nav Links */}
                <nav className="desktop-nav-links">
                    <button
                        type="button"
                        className={`nav-link-item ${activeView === 'landing' && !isAdminView ? 'active' : ''}`}
                        onClick={() => handleNavClick('landing')}
                    >
                        Beranda
                    </button>
                    <button
                        type="button"
                        className={`nav-link-item ${activeView === 'catalog' && !isAdminView ? 'active' : ''}`}
                        onClick={() => handleNavClick('catalog')}
                    >
                        Katalog Produk
                    </button>
                    <button
                        type="button"
                        className="nav-link-item"
                        onClick={() => {
                            handleNavClick('catalog');
                            const searchEl = document.getElementById('product-search-input');
                            if (searchEl) searchEl.focus();
                        }}
                    >
                        Pencarian
                    </button>
                    <a
                        href="#footer-section"
                        className="nav-link-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Kontak
                    </a>
                </nav>

                {/* Right Controls */}
                <div className="header-right-controls">
                    {adminUser ? (
                        <div className="admin-status-bar">
                            <span className="admin-badge">
                                <span className="admin-dot"></span>
                                <span>{adminUser.name || 'Admin'}</span>
                            </span>

                            {isAdminView ? (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setIsAdminView(false)}
                                    title="Kembali ke tampilan katalog"
                                >
                                    <Store size={15} />
                                    <span>Lihat Toko</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setIsAdminView(true)}
                                    title="Buka Admin Dashboard"
                                >
                                    <LayoutDashboard size={15} />
                                    <span>Dashboard</span>
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn btn-danger-soft btn-sm"
                                onClick={onLogout}
                                title="Keluar dari akun admin"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onOpenLogin}
                            id="admin-login-trigger"
                            title="Masuk sebagai Administrator"
                        >
                            <Lock size={14} />
                            <span>Login Admin</span>
                        </button>
                    )}

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        className="hamburger-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="mobile-nav-backdrop"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="mobile-nav-panel open animate-slide-up">
                        <div className="mobile-nav-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <VubeeLogo height={30} variant="default" />
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mobile-nav-links">
                            <button
                                type="button"
                                className={`mobile-nav-link ${activeView === 'landing' && !isAdminView ? 'active' : ''}`}
                                onClick={() => handleNavClick('landing')}
                            >
                                <span>Beranda</span>
                                <Sparkles size={16} />
                            </button>

                            <button
                                type="button"
                                className={`mobile-nav-link ${activeView === 'catalog' && !isAdminView ? 'active' : ''}`}
                                onClick={() => handleNavClick('catalog')}
                            >
                                <span>Katalog Produk</span>
                                <ShoppingBag size={16} />
                            </button>

                            <a
                                href="#footer-section"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span>Kontak & Lokasi</span>
                            </a>

                            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                                {adminUser ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ width: '100%' }}
                                            onClick={() => {
                                                setIsAdminView(true);
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <LayoutDashboard size={16} />
                                            <span>Buka Admin Dashboard</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger-soft"
                                            style={{ width: '100%' }}
                                            onClick={() => {
                                                onLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <LogOut size={16} />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ width: '100%' }}
                                        onClick={() => {
                                            onOpenLogin();
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <Lock size={16} />
                                        <span>Login Admin</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;
