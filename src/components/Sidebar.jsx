import React, { useState } from 'react';

const Sidebar = ({ stores, time, onStoreSelect, clickCounts = {} }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const allBrandsRaw = stores.filter(s =>
        (s.properties.type === 'retail' || s.properties.type === 'food' || s.properties.type === 'fun' || s.properties.type === 'banking') &&
        s.properties.name
    );

    const uniqueBrands = [];
    const seenNames = new Set();

    allBrandsRaw.forEach(store => {
        const brandName = store.properties.name.trim();
        if (!seenNames.has(brandName)) {
            uniqueBrands.push(store);
            seenNames.add(brandName);
        }
    });

    const filtered = uniqueBrands.filter(s =>
        s.properties.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getLogoName = (id) => {
        return id.replace(/-[0-9]$/, '');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            if (filtered.length > 0) {
                const firstStore = filtered[0];
                e.target.blur();
                
                setTimeout(() => {
                    onStoreSelect(firstStore.properties.id);
                }, 100);
            }
        }
    };

    return (
        <aside className="directory-section">
            <header className="directory-header">
                <div className="kiosk-time">{time}</div>
                <h1>STORES & DINING</h1>
                
                {/* Analytics moved to map - cleaner sidebar */}
                
                <div className="search-container">
                    <input
                        type="text"
                        id="store-search"
                        name="store-search"
                        placeholder="Search for brands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="search-input"
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery("")}>×</button>
                    )}
                </div>
            </header>

            <div className="store-list">
                {filtered.length > 0 ? (
                    filtered.map(store => {
                        const { id, name, type } = store.properties;
                        const logoFileName = getLogoName(id);
                        const clickCount = clickCounts[id] || 0;

                        return (
                            <div
                                key={id}
                                className="store-item"
                                onClick={() => onStoreSelect(id)}
                            >
                                <div className="logo-wrapper">
                                    <img
                                        src={`/assets/logos/${logoFileName}.png`}
                                        className="store-logo"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = '/assets/logos/default.png';
                                        }}
                                        alt={name}
                                    />
                                    {clickCount > 0 && (
                                        <span className="store-click-badge">{clickCount}</span>
                                    )}
                                </div>
                                <div className="store-info">
                                    <span className="store-name">{name}</span>
                                    <span className={`store-category-pill ${type}`}>
                                        {type === 'food' ? 'Dining' :
                                         type === 'fun' ? 'Entertainment' : 
                                         type === 'banking' ? 'Banking' : 'Fashion'}
                                    </span>
                                </div>
                                <div className="arrow-icon">→</div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-results">
                        <p>No brands found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;