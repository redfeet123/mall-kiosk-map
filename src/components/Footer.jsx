import React, { useState } from 'react';

const Footer = ({ 
  totalInteractions, 
  storeInteractions, 
  engagementRate, 
  topStore,
  allStores,
  clickCounts 
}) => {
  const [activeTab, setActiveTab] = useState(null); // null = collapsed

  // Toggle tab - click pe open/close
  const handleTabClick = (tabName) => {
    if (activeTab === tabName) {
      setActiveTab(null); // Same tab click = close
    } else {
      setActiveTab(tabName); // New tab = open
    }
  };

  // Get top 5 stores by clicks
  const getTopStores = () => {
    const entries = Object.entries(clickCounts);
    if (entries.length === 0) return [];
    
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([storeId, count]) => {
        const store = allStores.find(s => s.properties.id === storeId);
        return {
          id: storeId,
          name: store?.properties.name || storeId,
          count: count,
          floor: store?.properties.floor || 'unknown'
        };
      });
  };

  return (
    <footer className="kiosk-footer">
      {/* Tab Buttons */}
      <div className="footer-tabs">
        <button 
          className={`footer-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabClick('analytics')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Analytics</span>
          <span className="tab-arrow">{activeTab === 'analytics' ? '▼' : '▶'}</span>
        </button>
        
        <button 
          className={`footer-tab ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => handleTabClick('emergency')}
        >
          <span className="tab-icon">🚨</span>
          <span className="tab-label">Emergency</span>
          <span className="tab-arrow">{activeTab === 'emergency' ? '▼' : '▶'}</span>
        </button>
      </div>

      {/* Tab Content - Only show if tab is active */}
      {activeTab && (
        <div className="footer-content">
          {activeTab === 'analytics' && (
            <div className="analytics-panel">
              {/* Main Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">👆</div>
                  <div className="stat-info">
                    <div className="stat-value">{totalInteractions}</div>
                    <div className="stat-label">Total Interactions</div>
                  </div>
                </div>

                <div className="stat-card secondary">
                  <div className="stat-icon">🏪</div>
                  <div className="stat-info">
                    <div className="stat-value">{storeInteractions}</div>
                    <div className="stat-label">Stores Explored</div>
                  </div>
                </div>

                <div className="stat-card accent">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <div className="stat-value">{engagementRate}%</div>
                    <div className="stat-label">Engagement Rate</div>
                  </div>
                </div>

                <div className="stat-card highlight">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-info">
                    <div className="stat-value">{topStore.count}</div>
                    <div className="stat-label">{topStore.name}</div>
                  </div>
                </div>
              </div>

              {/* Top 5 Stores Table */}
              <div className="top-stores-section">
                <h3 className="section-title">🏆 Top 5 Most Explored Stores</h3>
                <div className="top-stores-table">
                  {getTopStores().length > 0 ? (
                    getTopStores().map((store, index) => (
                      <div key={store.id} className="top-store-row">
                        <div className="rank">#{index + 1}</div>
                        <div className="store-details">
                          <div className="store-name">{store.name}</div>
                          <div className="store-floor">{store.floor.replace('-', ' ').toUpperCase()}</div>
                        </div>
                        <div className="store-clicks">
                          <span className="clicks-badge">{store.count}</span>
                          <span className="clicks-text">clicks</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">No store data yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Tab */}
          {activeTab === 'emergency' && (
            <div className="emergency-panel" style={{ position: 'relative' }}>
              
              {/* ✅ COMING SOON OVERLAY */}
              <div className="coming-soon-overlay" style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  border: '2px solid #667eea'
                }}>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>🚧 COMING SOON</h2>
                  <p style={{ color: '#64748b', marginTop: '10px' }}>This module is currently under development.</p>
                </div>
              </div>

              <h3 className="section-title emergency-title">🚨 Emergency Contacts</h3>
              
              <div className="emergency-grid" style={{ filter: 'blur(2px)', opacity: 0.5 }}>
                {/* Security */}
                <div className="emergency-card">
                  <div className="emergency-icon security">👮</div>
                  <div className="emergency-info">
                    <h4>Security</h4>
                    <p className="emergency-number">Ext: 100</p>
                    <p className="emergency-desc">24/7 Mall Security</p>
                  </div>
                </div>

                {/* Medical */}
                <div className="emergency-card">
                  <div className="emergency-icon medical">🏥</div>
                  <div className="emergency-info">
                    <h4>Medical Emergency</h4>
                    <p className="emergency-number">Ext: 101</p>
                    <p className="emergency-desc">First Aid Available</p>
                  </div>
                </div>

                {/* Fire */}
                <div className="emergency-card">
                  <div className="emergency-icon fire">🚒</div>
                  <div className="emergency-info">
                    <h4>Fire Emergency</h4>
                    <p className="emergency-number">Ext: 102</p>
                    <p className="emergency-desc">Fire Safety Team</p>
                  </div>
                </div>

                {/* Lost & Found */}
                <div className="emergency-card">
                  <div className="emergency-icon lost">🔍</div>
                  <div className="emergency-info">
                    <h4>Lost & Found</h4>
                    <p className="emergency-number">Ext: 103</p>
                    <p className="emergency-desc">Customer Service Desk</p>
                  </div>
                </div>

                {/* Information */}
                <div className="emergency-card">
                  <div className="emergency-icon info">ℹ️</div>
                  <div className="emergency-info">
                    <h4>Information Desk</h4>
                    <p className="emergency-number">Ext: 104</p>
                    <p className="emergency-desc">General Inquiries</p>
                  </div>
                </div>

                {/* Management */}
                <div className="emergency-card">
                  <div className="emergency-icon management">👔</div>
                  <div className="emergency-info">
                    <h4>Mall Management</h4>
                    <p className="emergency-number">+92 123 456 7890</p>
                    <p className="emergency-desc">Office Hours: 9 AM - 6 PM</p>
                  </div>
                </div>
              </div>

              {/* Emergency Instructions */}
              <div className="emergency-instructions" style={{ filter: 'blur(2px)', opacity: 0.5 }}>
                <p>⚠️ In case of emergency, stay calm and contact the nearest staff member or use the help phones located throughout the mall.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </footer>
  );
};

export default Footer;