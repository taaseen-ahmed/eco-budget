import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home/Home';
import Registration from './Registration/Registration';
import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';
import Spending from './Spending/Spending';
import Budget from './Budget/Budget';
import PrivateRoute from './PrivateRoute';
import CarbonFootprint from './CarbonFootprint/CarbonFootprint';
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
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Spinner animation="border" variant="primary" />
                </motion.div>
            </div>
        );
    }

    return (
        <Router>
            <div className="app-container">
                <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
                <footer className="footer">
                    <Container>
                        <p>&copy; Final Year Project 2025 Eco-Budget App. All rights reserved.</p>
                    </Container>
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
            <Navbar expand="lg" className="custom-navbar" fixed="top">
                <Container>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Navbar.Brand as={Link} to={isAuthenticated ? '/dashboard' : '/'} className="brand">
                            <span className="brand-icon">🌱</span> Eco-Budget
                        </Navbar.Brand>
                    </motion.div>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            {isAuthenticated ? (
                                <>
                                    <Nav.Link as={Link} to="/dashboard" className="nav-item">
                                        Dashboard
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/spending" className="nav-item">
                                        Spending
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/budget" className="nav-item">
                                        Budget
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/carbon-footprint" className="nav-item">
                                        Carbon Footprint
                                    </Nav.Link>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            variant="light"
                                            onClick={handleLogout}
                                            className="logout-button ms-3"
                                        >
                                            Log Out
                                        </Button>
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login" className="nav-item">
                                        Login
                                    </Nav.Link>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Nav.Link as={Link} to="/register" className="btn btn-light nav-button">
                                            Register
                                        </Nav.Link>
                                    </motion.div>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="content-container">
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={
                            <PageTransition>
                                <Home />
                            </PageTransition>
                        } />
                        <Route path="/register" element={
                            <PageTransition>
                                <Registration />
                            </PageTransition>
                        } />
                        <Route path="/login" element={
                            <PageTransition>
                                <Login setIsAuthenticated={setIsAuthenticated} />
                            </PageTransition>
                        } />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute
                                    element={
                                        <PageTransition>
                                            <Dashboard />
                                        </PageTransition>
                                    }
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        />
                        <Route
                            path="/spending"
                            element={
                                <PrivateRoute
                                    element={
                                        <PageTransition>
                                            <Spending />
                                        </PageTransition>
                                    }
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        />
                        <Route
                            path="/budget"
                            element={
                                <PrivateRoute
                                    element={
                                        <PageTransition>
                                            <Budget />
                                        </PageTransition>
                                    }
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        />
                        <Route
                            path="/carbon-footprint"
                            element={
                                <PrivateRoute
                                    element={
                                        <PageTransition>
                                            <CarbonFootprint />
                                        </PageTransition>
                                    }
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        />
                    </Routes>
                </AnimatePresence>
            </Container>
        </>
    );
}

// Page transition component
const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

export default App;