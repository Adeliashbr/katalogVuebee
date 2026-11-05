import React from 'react';
import { Layers, Sparkles, Heart } from 'lucide-react';

export const CategoriesPills = ({
    categories = [],
    activeCategoryId = '',
    onSelectCategory,
    totalProductsCount = 0
}) => {
    const getCategoryIcon = (name) => {
        if (!name) return <Sparkles size={14} />;
        const lower = name.toLowerCase();
        if (lower.includes('makeup')) return <Sparkles size={14} />;
        if (lower.includes('skincare')) return <Heart size={14} />;
        return <Sparkles size={14} />;
    };

    return (
        <div className="category-pills-container">
            <div className="category-pills-scroller">
                <button
                    type="button"
                    className={`category-pill-btn ${activeCategoryId === '' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('')}
                    id="cat-pill-all"
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
    );
};

export default CategoriesPills;
