import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';  // Correct path to the Home.css file from Home.js

const Home = () => {
    return (
        <div className="home">
            <div className="home-content">
                <h1>Welcome to the Eco-Budget App</h1>
                <p>Track your spending and monitor your carbon footprint.</p>
                <div className="home-links">
                    <Link to="/register" className="home-link">Register</Link>
                    <Link to="/login" className="home-link">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;