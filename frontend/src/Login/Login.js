import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const TOKEN_KEY = 'jwtToken';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.username || !formData.password) {
            setError('Please fill in all fields.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/public/auth/authenticate', {
                email: formData.username,
                password: formData.password,
            });

            const { token } = response.data;
            localStorage.setItem(TOKEN_KEY, token);
            setIsAuthenticated(true);
            setError(null);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.status === 403 ? 'Invalid credentials. Please try again.' : 'An error occurred. Please try again later.');
            setIsLoading(false);
        }
    };

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col md={11} lg={10} xl={9}>
                    <div className="login-container eco-card">
                        <Row className="g-0">
                            <Col md={5} className="login-info-col">
                                <div className="login-info">
                                    <div className="login-info-content">
                                        <h1>Welcome Back</h1>
                                        <p>Log in to access your eco-friendly budgeting tools and track your environmental impact.</p>
                                        <div className="login-graphics">
                                            <div className="login-circle"></div>
                                            <div className="login-leaf">🌿</div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col md={7}>
                                <div className="login-form-container">
                                    <h2 className="page-title">Log In</h2>
                                    {error && (
                                        <Alert variant="danger">{error}</Alert>
                                    )}
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="username">Email Address</Form.Label>
                                            <Form.Control
                                                type="email"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="Enter your email"
                                                required
                                                className="login-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label htmlFor="password">Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter your password"
                                                required
                                                className="login-input"
                                            />
                                        </Form.Group>
                                        <div className="text-end mb-3">
                                            <Link to="/forgot-password" className="forgot-password">
                                                Forgot Password?
                                            </Link>
                                        </div>
                                        <div className="login-button-wrapper">
                                            <button
                                                type="submit"
                                                className="btn-eco-primary w-100"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Logging in...' : 'Log In'}
                                            </button>
                                        </div>
                                        <div className="text-center mt-4">
                                            <p className="register-link">
                                                Don't have an account? <Link to="/register">Register here</Link>
                                            </p>
                                        </div>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;