import React, { useEffect, useState } from 'react';
import {
    ShoppingBag,
    Lock,
    LogOut,
    LayoutDashboard,
    Store,
    Menu,
    X,
    Sparkles
} from 'lucide-react';
import { VubeeLogo } from './VubeeLogo';

export const Header = ({
    storeSettings,
    isAdminView,
    setIsAdminView,
    adminUser,
    onOpenLogin,
    onLogout,
    activeSection,
    onNavigate
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const storeName = storeSettings?.storeName || 'Vuebee';

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleNavClick = (sectionId) => {
        if (onNavigate) onNavigate(sectionId);
        setIsAdminView(false);
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { key: 'beranda', label: 'Beranda' },
        { key: 'katalog', label: 'Katalog' },
        { key: 'tentang', label: 'Tentang Kami' }
    ];

    const handleItemClick = (key) => {
        if (key === 'tentang') {
            setIsMobileMenuOpen(false);
            if (onNavigate) {
                onNavigate('tentang');
                return;
            }
            setIsAdminView(false);
            requestAnimationFrame(() => {
                document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' });
            });
            return;
        }
        handleNavClick(key);
    };

    return (
        <>
            <div className="announcement-bar">
                <div className="announcement-track">
                    {[0, 1].map((dup) => (
                        <span className="announcement-item" key={dup} aria-hidden={dup === 1}>
                            <Sparkles size={13} />
                            <span>Free konsultasi kulit • Order cepat via WhatsApp • BPOM &amp; Halal</span>
                        </span>
                    ))}
                </div>
            </div>
            <header className={`site-header${isScrolled ? ' is-scrolled' : ''}`}>
                <div className="container header-container">
                    <div
                        className="brand-link"
                        onClick={() => handleNavClick('beranda')}
                        title={`${storeName} - Beranda`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNavClick('beranda'); }}
                    >
                        <VubeeLogo height={36} variant="default" />
                        <span className="brand-name-text">{storeName}</span>
                    </div>

                    <nav className="desktop-nav-links" aria-label="Navigasi utama">
                        {navItems.map((item) => (
                            <button
                                type="button"
                                key={item.key}
                                className={`nav-link-item ${activeSection === item.key && !isAdminView ? 'active' : ''}`}
                                onClick={() => handleItemClick(item.key)}
                                aria-current={activeSection === item.key ? 'page' : undefined}
                            >
                                <span className="nav-link-label">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="header-right-controls">
                        {adminUser ? (
                            <div className="admin-status-bar">
                                <span className="admin-badge" title={adminUser.name || 'Admin'}>
                                    <span className="admin-dot"></span>
                                    <span className="admin-name">{adminUser.name || 'Admin'}</span>
                                </span>

                                {isAdminView ? (
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setIsAdminView(false)}
                                        title="Kembali ke tampilan katalog"
                                    >
                                        <Store size={15} />
                                        <span className="hide-on-small">Lihat Toko</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setIsAdminView(true)}
                                        title="Buka Admin Dashboard"
                                    >
                                        <LayoutDashboard size={15} />
                                        <span className="hide-on-small">Dashboard</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-danger-soft btn-sm btn-icon-only"
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
                                    aria-label="Tutup menu"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mobile-nav-links">
                                <button
                                    type="button"
                                    className={`mobile-nav-link ${activeSection === 'beranda' && !isAdminView ? 'active' : ''}`}
                                    onClick={() => handleNavClick('beranda')}
                                >
                                    <span>Beranda</span>
                                    <Sparkles size={16} />
                                </button>

                                <button
                                    type="button"
                                    className={`mobile-nav-link ${activeSection === 'katalog' && !isAdminView ? 'active' : ''}`}
                                    onClick={() => handleNavClick('katalog')}
                                >
                                    <span>Katalog Produk</span>
                                    <ShoppingBag size={16} />
                                </button>

                                <button
                                    type="button"
                                    className="mobile-nav-link"
                                    onClick={() => handleItemClick('tentang')}
                                >
                                    <span>Tentang Kami</span>
                                </button>

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
        </>
    );
};

export default Header;
