import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GroundFloorMap from './components/GroundFloorMap';
import FirstFloorMap from './components/FirstFloorMap';
import RestaurantFloorMap from './components/RestaurantFloorMap';
import './App.css';

const App = () => {
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [activeFloor, setActiveFloor] = useState('ground-floor');
  const [allStores, setAllStores] = useState([]);
  const [showRoute, setShowRoute] = useState(false); // Route dikhane ke liye state

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
              const isValidType = (type === 'retail' || type === 'food' || type === 'fun');
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

  // Sidebar ya Map click par kya hoga
 const handleStoreClick = (id) => { // 'id' parameter hai
    if (!id) {
      setSelectedStoreId(null);
      setShowRoute(false);
      return;
    }

    // Yahan check karein ke parameter name (id) aur find ke andar wala name same ho
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

        {/* --- 3D MAP RENDERER --- */}
        <div className="canvas-container-wrapper" style={{ width: '100%', height: '100%' }}>
          {activeFloor === 'ground-floor' && (
            <GroundFloorMap
              selectedId={selectedStoreId}
              onMapClick={handleStoreClick}
              showRoute={showRoute}
            />
          )}

          {activeFloor === 'first-floor' && (
            <FirstFloorMap
              selectedId={selectedStoreId}
              onMapClick={handleStoreClick}
              showRoute={showRoute}
            />
          )}

          {activeFloor === 'restaurant-floor' && (
            typeof RestaurantFloorMap !== 'undefined' ?
              <RestaurantFloorMap
                selectedId={selectedStoreId}
                onMapClick={handleStoreClick}
                showRoute={showRoute}
              /> :
              <div className="coming-soon">Coming Soon</div>
          )}
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
                {selectedStoreData.properties.description || "Experience premium shopping at " + selectedStoreData.properties.name + ". Visit us on the " + activeFloor.replace('-', ' ') + "."}
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