import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FloorMap from './components/FloorMap';
import './App.css';

const App = () => {
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [activeFloor, setActiveFloor] = useState('ground-floor');
  const [allStores, setAllStores] = useState([]);
  const [showRoute, setShowRoute] = useState(false);

  // --- 1. Master Store List Loading ---
  useEffect(() => {
    const floors = ['ground-floor', 'first-floor', 'restaurant-floor'];

    Promise.all(floors.map(floor =>
      fetch(`/assets/maps/${floor}.json`).then(res => res.json())
    ))
      .then(dataArray => {
        let combined = [];
        dataArray.forEach((data, index) => {
          const floorName = floors[index];
          const features = data.features
            .filter(f => {
              const type = f.properties.type;
              const id = f.properties.id.toLowerCase();
              const isValidType = (type === 'retail' || type === 'food' || type === 'fun' || type === 'banking');
              const isNotPlaceholder = !id.includes('e-shop') && !id.includes('wall') && !id.includes('corridor');
              return isValidType && isNotPlaceholder;
            })
            .map(f => ({
              ...f,
              properties: { ...f.properties, floor: floorName }
            }));
          combined = [...combined, ...features];
        });

        // Unique Stores Logic (Duplicates khatam karne ke liye)
        const uniqueStoresMap = new Map();
        combined.forEach(store => {
          const id = store.properties.id;
          if (!uniqueStoresMap.has(id)) {
            uniqueStoresMap.set(id, store);
          }
        });

        setAllStores(Array.from(uniqueStoresMap.values()));
      })
      .catch(err => console.error("Error loading master store list:", err));

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- 2. Handlers ---
  const handleStoreClick = (id) => {
    if (!id) {
      setSelectedStoreId(null);
      setShowRoute(false);
      return;
    }

    const store = allStores.find(s => s.properties.id === id);
    
    if (store) {
      setActiveFloor(store.properties.floor);
      setSelectedStoreId(id);
      setShowRoute(false);
    } else {
      // Elevator, Restroom, Stairs sab yahan handle honge
      setSelectedStoreId(id);
      setShowRoute(true);
    }
  };

  // Selected store ka data nikalna panel mein dikhane ke liye
  const selectedStoreData = allStores.find(s => s.properties.id === selectedStoreId);

  return (
    <div className="kiosk-wrapper">
      <section className="map-section" style={{ position: 'relative', width: '100%', height: '100%' }}>

        {/* Floor Switcher UI */}
        <div className="floor-switcher">
          {['restaurant-floor', 'first-floor', 'ground-floor'].map(f => (
            <button
              key={f}
              className={`floor-btn ${activeFloor === f ? 'active' : ''}`}
              onClick={() => {
                setActiveFloor(f);
                setSelectedStoreId(null);
                setShowRoute(false);
              }}
            >
              {f === 'ground-floor' ? 'GF' : f === 'first-floor' ? '1F' : 'RF'}
            </button>
          ))}
        </div>

        {/* --- ✅ UNIFIED 3D MAP RENDERER --- */}
        <div className="canvas-container-wrapper" style={{ width: '100%', height: '100%' }}>
          <FloorMap
            key={activeFloor}
            floor={activeFloor}
            selectedId={selectedStoreId}
            onMapClick={handleStoreClick}
            showRoute={showRoute}
          />
        </div>

        {/* --- RIGHT SIDE STORE PANEL --- */}
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
            </div>

            <div className="panel-body">
              <p className="description-text">
                {selectedStoreData.properties.description || (() => {
                  const type = selectedStoreData.properties.type;
                  const name = selectedStoreData.properties.name;
                  const floor = activeFloor.replace('-', ' ');
                  
                  if (type === 'food') {
                    return `Experience delicious dining at ${name}. Visit us on the ${floor}.`;
                  } else if (type === 'fun') {
                    return `Enjoy exciting entertainment at ${name}. Visit us on the ${floor}.`;
                  } else if (type === 'banking') {
                    return `Banking services available at ${name}. Visit us on the ${floor}.`;
                  } else {
                    return `Experience premium shopping at ${name}. Visit us on the ${floor}.`;
                  }
                })()}
              </p>
            </div>

            <div className="panel-footer">
              {!showRoute ? (
                <button className="btn-directions" onClick={() => setShowRoute(true)}>
                  GET DIRECTIONS
                </button>
              ) : (
                <button className="btn-clear" onClick={() => setShowRoute(false)}>
                  CLEAR ROUTE
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Sidebar Component */}
      <Sidebar stores={allStores} time={currentTime} onStoreSelect={handleStoreClick} />
    </div>
  );
};

export default App;