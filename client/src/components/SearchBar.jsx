import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
    search,
    setSearch,
    placeholder = 'Cari produk skincare atau makeup favoritmu...'
}) => {
    return (
        <div className="search-bar-section">
            <div className="search-input-wrapper">
                <Search size={18} className="search-icon-fixed" />
                <input
                    type="text"
                    className="search-input-field"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    id="product-search-input"
                />
                {search && (
                    <button
                        type="button"
                        className="search-clear-action"
                        onClick={() => setSearch('')}
                        title="Hapus pencarian"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
