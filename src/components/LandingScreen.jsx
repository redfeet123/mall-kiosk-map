import React from 'react';
import '../App.css';  // ✅ Ek folder upar jaao

const LandingScreen = ({ onStart }) => {
    return (
        <div className="landing-screen">
            <div className="landing-content">
                <img 
                    src="/public/assets/logos/default.png" 
                    alt="The North Walk"
                    className="landing-logo"
                />
                <h1 className="landing-title">WELCOME TO THE NORTH WALK</h1>
                <p className="landing-subtitle">Your Shopping Destination</p>
                
                <button 
                    className="wayfinder-button"
                    onClick={onStart}
                >
                    <span className="button-icon">📍</span>
                    OPEN WAYFINDER
                </button>
                
                <div className="tap-instruction">Tap anywhere to start exploring</div>
            </div>
        </div>
    );
};

export default LandingScreen;