import React, { useRef, useState, useEffect } from 'react';
import { Layers, Sparkles, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

export const CategoriesPills = ({
    categories = [],
    activeCategoryId = '',
    onSelectCategory,
    totalProductsCount = 0
}) => {
    const scrollerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (!scrollerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    };

    useEffect(() => {
        checkScroll();
        const scroller = scrollerRef.current;
        if (scroller) {
            scroller.addEventListener('scroll', checkScroll, { passive: true });
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (scroller) scroller.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [categories]);

    const handleScroll = (direction) => {
        if (!scrollerRef.current) return;
        const offset = direction === 'left' ? -220 : 220;
        scrollerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    };

    const getCategoryIcon = (name) => {
        if (!name) return <Sparkles size={14} />;
        const lower = name.toLowerCase();
        if (lower.includes('makeup')) return <Sparkles size={14} />;
        if (lower.includes('skincare')) return <Heart size={14} />;
        return <Sparkles size={14} />;
    };

    return (
        <div
            className="category-pills-wrapper"
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* Tombol Panah Kiri */}
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => handleScroll('left')}
                    aria-label="Geser kategori ke kiri"
                    className="category-nav-arrow left"
                    style={{
                        position: 'absolute',
                        left: '-12px',
                        zIndex: 3,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--color-primary)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ChevronLeft size={18} />
                </button>
            )}

            <div
                className="category-pills-container"
                style={{
                    width: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                }}
            >
                <div
                    className="category-pills-scroller"
                    ref={scrollerRef}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.65rem',
                        overflowX: 'auto',
                        padding: '0.4rem 0.5rem',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        margin: '0 auto',
                        width: '100%'
                    }}
                >
                    <button
                        type="button"
                        className={`category-pill-btn ${activeCategoryId === '' ? 'active' : ''}`}
                        onClick={() => onSelectCategory('')}
                        id="cat-pill-all"
                        style={{ flexShrink: 0 }}
                    >
                        <Layers size={15} />
                        <span>Semua Produk</span>
                        <span className="category-count-badge">{totalProductsCount}</span>
                    </button>

                    {categories.map((cat) => {
                        const isActive = activeCategoryId === cat.id;
                        const count = cat.productCount ?? cat.ProductsCount;
                        return (
                            <button
                                type="button"
                                key={cat.id}
                                className={`category-pill-btn ${isActive ? 'active' : ''}`}
                                onClick={() => onSelectCategory(cat.id)}
                                id={`cat-pill-${cat.slug || cat.id}`}
                                style={{ flexShrink: 0 }}
                            >
                                {getCategoryIcon(cat.name)}
                                <span>{cat.name}</span>
                                {count !== undefined && (
                                    <span className="category-count-badge">{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tombol Panah Kanan */}
            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => handleScroll('right')}
                    aria-label="Geser kategori ke kanan"
                    className="category-nav-arrow right"
                    style={{
                        position: 'absolute',
                        right: '-12px',
                        zIndex: 3,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--color-primary)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
    );
};

export default CategoriesPills;
