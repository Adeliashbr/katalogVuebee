import React, { useEffect, useState } from 'react';
import {
    ShoppingBag,
    LogIn,
    LogOut,
    LayoutDashboard,
    Store,
    Menu,
    X,
    Sparkles,
    UserRound
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
                            <div className="admin-status-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                {/* Foto Profil Admin + Nama Admin */}
                                <div
                                    className="admin-profile-pill"
                                    title={`Masuk sebagai ${adminUser.name || 'Admin'}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.65rem 0.25rem 0.35rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: 'var(--color-surface-subtle)',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'default'
                                    }}
                                >
                                    {adminUser.avatar ? (
                                        <img
                                            src={adminUser.avatar}
                                            alt={adminUser.name || 'Admin'}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '1.5px solid var(--color-accent)'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--color-accent)',
                                            color: '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            fontWeight: 700
                                        }}>
                                            {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : <UserRound size={14} />}
                                        </div>
                                    )}
                                    <span
                                        className="admin-name hide-on-small"
                                        style={{
                                            fontSize: '0.82rem',
                                            fontWeight: 600,
                                            color: 'var(--color-primary)',
                                            maxWidth: '120px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {adminUser.name || 'Administrator'}
                                    </span>
                                </div>

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
                                    aria-label="Keluar"
                                >
                                    <LogOut size={15} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={onOpenLogin}
                                id="admin-login-trigger"
                                title="Masuk ke Portal Administrator"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    padding: '0.45rem 1rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    borderRadius: 'var(--radius-full)'
                                }}
                            >
                                <LogIn size={15} />
                                <span>Masuk</span>
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

                                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                                    {adminUser ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                            {/* Mobile Admin Profile Box */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.65rem',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: 'var(--radius-md)',
                                                backgroundColor: 'var(--color-surface-subtle)',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                {adminUser.avatar ? (
                                                    <img
                                                        src={adminUser.avatar}
                                                        alt={adminUser.name || 'Admin'}
                                                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--color-accent)',
                                                        color: '#FFFFFF',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700
                                                    }}>
                                                        {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : <UserRound size={18} />}
                                                    </div>
                                                )}
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                                                        {adminUser.name || 'Administrator'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                        {adminUser.email || 'Admin Vuebee'}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                style={{ width: '100%', padding: '0.75rem' }}
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
                                                style={{ width: '100%', padding: '0.75rem' }}
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
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem',
                                                fontWeight: 600
                                            }}
                                            onClick={() => {
                                                onOpenLogin();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <LogIn size={16} />
                                            <span>Masuk</span>
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
