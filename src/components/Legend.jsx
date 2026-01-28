import React from 'react';

const Legend = () => {
    // Definining the items here makes it easy to add/remove icons later
    const legendItems = [
        { id: 'elevator', label: 'Elevator' },
        { id: 'entry', label: 'Entry' },
        { id: 'escalator_up', label: 'Escalator (Up)' },
        { id: 'escalator_down', label: 'Escalator (Down)' },
        { id: 'exit', label: 'Exit' },
        { id: 'parking', label: 'Parking' },
        { id: 'stairs', label: 'Stairs' },
        { id: 'male-restroom', label: 'Male Restroom' },
        { id: 'female-restroom', label: 'Female Restroom' }
    ];

    return (
        <div id="map-legend">
            {/* This fixes the missing heading you mentioned */}
            <h3 style={{ 
                fontSize: '20px', 
                marginBottom: '15px', 
                color: '#334155',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '8px'
            }}>
                Mall Directory
            </h3>
            
            <div className="legend-group">
                {legendItems.map((item) => (
                    <div key={item.id} className="legend-item">
                        <img 
                            src={`/assets/icons/${item.id}.svg`} 
                            className="legend-icon" 
                            alt={item.label} 
                            // Fallback if an icon is missing
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Legend;