import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import Home from './Home/Home';
import Registration from './Registration/Registration';
import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';
import Spending from './Spending/Spending';
import Budget from './Budget/Budget'; // Import Budget page
import PrivateRoute from './PrivateRoute';
import './styles/App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        </Router>
    );
}

function AppContent({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <div className="App">
            <header className="App-header">
                <div className="logo">
                    <Link to={isAuthenticated ? '/dashboard' : '/'} className="logo-link">
                        <h1>Eco-Budget</h1>
                    </Link>
                </div>
                {isAuthenticated && (
                    <button className="logout-button" onClick={handleLogout}>
                        Log Out
                    </button>
                )}
                {isAuthenticated && (
                    <nav className="navbar">
                        <Link to="/spending" className="nav-link">Spending</Link>
                        <Link to="/budget" className="nav-link">Budget</Link>
                    </nav>
                )}
            </header>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route
                    path="/dashboard"
                    element={<PrivateRoute element={<Dashboard />} isAuthenticated={isAuthenticated} />}
                />
                <Route
                    path="/spending"
                    element={<PrivateRoute element={<Spending />} isAuthenticated={isAuthenticated} />}
                />
                <Route
                    path="/budget"
                    element={<PrivateRoute element={<Budget />} isAuthenticated={isAuthenticated} />} // Protected Budget route
                />
            </Routes>
        </div>
    );
}

export default App;