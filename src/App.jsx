import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FloorMap from './components/FloorMap';
import Footer from './components/Footer';
// ResetAnalytics import hata diya gaya hai
import './App.css';

const App = () => {
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [activeFloor, setActiveFloor] = useState('ground-floor');
  const [allStores, setAllStores] = useState([]);
  const [showRoute, setShowRoute] = useState(false);
  
  // ✅ Permanent Analytics State - Refresh se reset nahi hoga
  const [clickCounts, setClickCounts] = useState(() => {
    const saved = localStorage.getItem('kiosk_clickCounts');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [storeInteractions, setStoreInteractions] = useState(() => {
    const saved = localStorage.getItem('kiosk_storeInteractions');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [totalInteractions, setTotalInteractions] = useState(() => {
    const saved = localStorage.getItem('kiosk_totalInteractions');
    return saved ? parseInt(saved, 10) : 0;
  });

  // ✅ Auto-Save logic: Jab bhi state change hogi, localStorage update ho jayega
  useEffect(() => {
    localStorage.setItem('kiosk_clickCounts', JSON.stringify(clickCounts));
    localStorage.setItem('kiosk_storeInteractions', storeInteractions.toString());
    localStorage.setItem('kiosk_totalInteractions', totalInteractions.toString());
  }, [clickCounts, storeInteractions, totalInteractions]);

  // Scaling Logic (Window Resize)
  useEffect(() => {
    const handleScaling = () => {
      const baseWidth = 1920; 
      const currentWidth = window.innerWidth;
      const scale = currentWidth / baseWidth;
      const wrapper = document.querySelector('.kiosk-wrapper');
      if (wrapper) {
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = 'top left';
        wrapper.style.width = `${baseWidth}px`;
        wrapper.style.height = `${window.innerHeight / scale}px`;
      }
    };
    window.addEventListener('resize', handleScaling);
    handleScaling();
    return () => window.removeEventListener('resize', handleScaling);
  }, []);

  // Fetching Store Data & Clock
  useEffect(() => {
    const floors = ['ground-floor', 'first-floor', 'restaurant-floor'];
    Promise.all(floors.map(floor => fetch(`/assets/maps/${floor}.json`).then(res => res.json())))
      .then(dataArray => {
        let combined = [];
        dataArray.forEach((data, index) => {
          const floorName = floors[index];
          const features = data.features
            .filter(f => {
              const type = f.properties.type;
              const id = f.properties.id.toLowerCase();
              return (type === 'retail' || type === 'food' || type === 'fun' || type === 'banking') && 
                     !id.includes('e-shop') && !id.includes('wall') && !id.includes('corridor');
            })
            .map(f => ({ ...f, properties: { ...f.properties, floor: floorName } }));
          combined = [...combined, ...features];
        });

        const uniqueStoresMap = new Map();
        combined.forEach(store => {
          if (!uniqueStoresMap.has(store.properties.id)) uniqueStoresMap.set(store.properties.id, store);
        });
        setAllStores(Array.from(uniqueStoresMap.values()));
      });

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStoreClick = (id) => {
    setTotalInteractions(prev => prev + 1);
    
    if (!id) {
      setSelectedStoreId(null);
      setShowRoute(false);
      return;
    }

    const store = allStores.find(s => s.properties.id === id);
    setStoreInteractions(prev => prev + 1);
    setClickCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    
    if (store) {
      setActiveFloor(store.properties.floor);
      setSelectedStoreId(id);
      setShowRoute(false);
    } else {
      setSelectedStoreId(id);
      setShowRoute(true);
    }
  };

  const getMostClickedStore = () => {
    const entries = Object.entries(clickCounts);
    if (entries.length === 0) return { name: "—", count: 0 };
    const [storeId, count] = entries.reduce((a, b) => b[1] > a[1] ? b : a);
    const store = allStores.find(s => s.properties.id === storeId);
    return { name: store?.properties.name || "—", count: count };
  };

  const engagementRate = totalInteractions > 0 
    ? Math.round((storeInteractions / totalInteractions) * 100) 
    : 0;

  const selectedStoreData = allStores.find(s => s.properties.id === selectedStoreId);

  return (
    <div className="kiosk-wrapper">
      <section className="map-section" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div className="floor-switcher">
          {['restaurant-floor', 'first-floor', 'ground-floor'].map(f => (
            <button
              key={f}
              className={`floor-btn ${activeFloor === f ? 'active' : ''}`}
              onClick={() => { setActiveFloor(f); setSelectedStoreId(null); setShowRoute(false); }}
            >
              {f === 'ground-floor' ? 'GF' : f === 'first-floor' ? '1F' : 'RF'}
            </button>
          ))}
        </div>

        <div className="canvas-container-wrapper" style={{ width: '100%', height: '94%' }}>
          <FloorMap
            key={activeFloor}
            floor={activeFloor}
            selectedId={selectedStoreId}
            onMapClick={handleStoreClick}
            showRoute={showRoute}
          />
          {/* ✅ ResetAnalytics component yahan se hata diya gaya hai */}
        </div>

        {selectedStoreId && selectedStoreData && (
          <div className="store-details-panel">
            <button className="close-panel-btn" onClick={() => { setSelectedStoreId(null); setShowRoute(false); }}>×</button>
            <div className="panel-header">
              <div className="panel-logo-bg">
                <img
                  src={`/assets/logos/${selectedStoreId.replace(/-[0-9]$/, '')}.png`}
                  onError={(e) => e.target.src = '/assets/logos/default.png'}
                  alt="logo"
                />
              </div>
              <h2>{selectedStoreData.properties.name}</h2>
              <span className="category-tag">{selectedStoreData.properties.type}</span>
              <div className="click-counter-badge">Clicks: {clickCounts[selectedStoreId] || 0}</div>
            </div>
            <div className="panel-body">
              <p className="description-text">
                {selectedStoreData.properties.description || `Visit ${selectedStoreData.properties.name} on the ${activeFloor.replace('-', ' ')}.`}
              </p>
            </div>
            <div className="panel-footer">
              {!showRoute ? (
                <button className="btn-directions" onClick={() => setShowRoute(true)}>GET DIRECTIONS</button>
              ) : (
                <button className="btn-clear" onClick={() => setShowRoute(false)}>CLEAR ROUTE</button>
              )}
            </div>
          </div>
        )}

        <Footer 
          totalInteractions={totalInteractions}
          storeInteractions={storeInteractions}
          engagementRate={engagementRate}
          topStore={getMostClickedStore()}
          allStores={allStores}
          clickCounts={clickCounts}
        />
      </section>

      <Sidebar 
        stores={allStores} 
        time={currentTime} 
        onStoreSelect={handleStoreClick}
        clickCounts={clickCounts}
      />
    </div>
  );
};

export default App;