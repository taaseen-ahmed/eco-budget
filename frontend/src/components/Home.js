import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';  // Correct path to the Home.css file from Home.js

const Home = () => {
    return (
        <div className="home">
            <h1>Welcome to the Eco-Budget App</h1>
            <p>Track your spending and monitor your carbon footprint.</p>
            <Link to="/hello-test">Go to API Test</Link>
            <br/>
            <Link to="/register">Register</Link>
            <br/>
            <Link to="/login">Log In</Link>
        </div>
    );
};

export default Home;