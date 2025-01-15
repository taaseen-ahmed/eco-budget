import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home/Home';
import Registration from './Registration/Registration';
import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';
import Spending from './Spending/Spending';
import Budget from './Budget/Budget';
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
        return (
            <div className="loading-container">
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    return (
        <Router>
            <div className="app-container">
                <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
                <footer className="footer">
                    <p>&copy; Final Year Project 2025 Eco-Budget App. All rights reserved.</p>
                </footer>
            </div>
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
        <>
            <Navbar expand="lg" className="custom-navbar">
                <Container>
                    <Navbar.Brand as={Link} to={isAuthenticated ? '/dashboard' : '/'} className="brand">
                        🌱 Eco-Budget
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            {isAuthenticated ? (
                                <>
                                    <Nav.Link as={Link} to="/dashboard">
                                        Dashboard
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/spending">
                                        Spending
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/budget">
                                        Budget
                                    </Nav.Link>
                                    <Button variant="outline-danger" size="sm" onClick={handleLogout} className="ms-3" >
                                        Log Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login">
                                        Login
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/register">
                                        Register
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="content-container">
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
                        element={<PrivateRoute element={<Budget />} isAuthenticated={isAuthenticated} />}
                    />
                </Routes>
            </Container>
        </>
    );
}

export default App;