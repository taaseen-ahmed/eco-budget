import React from 'react';
import {Routes, Route, BrowserRouter as Router, Link} from 'react-router-dom';
import Home from './Home/Home';  // Import Home component
import Registration from './Registration/Registration';
import Login from './Login/Login';
import './styles/App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Eco-Budget</h1>
                    <nav className="navbar">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                        <Link to="/login" className="nav-link">Log In</Link>
                    </nav>
                </header>

                {/* Define Routes */}
                <Routes>
                    <Route path="/" element={<Home />} />  {/* Homepage route */}
                    <Route path="/register" element={<Registration />} />  {/* Registration route */}
                    <Route path="/login" element={<Login />} />  {/* Login route */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;