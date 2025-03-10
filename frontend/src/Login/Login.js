import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import './Login.css';

/**
 * Login component
 * Handles user authentication and login process
 *
 * @param {Object} props - Component props
 * @param {Function} props.setIsAuthenticated - Function to update authentication state
 */
const Login = ({ setIsAuthenticated }) => {
    // Constants
    const TOKEN_KEY = 'jwtToken';
    const API_LOGIN_ENDPOINT = '/api/public/auth/authenticate';

    // State management
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Navigation hook
    const navigate = useNavigate();

    /**
     * Updates form data when input values change
     *
     * @param {Object} e - Event object
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    /**
     * Handles form submission and authentication
     *
     * @param {Object} e - Event object
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate input fields
        if (!formData.username || !formData.password) {
            setError('Please fill in all fields.');
            setIsLoading(false);
            return;
        }

        try {
            // Make API request to authenticate user
            const response = await axios.post(API_LOGIN_ENDPOINT, {
                email: formData.username,
                password: formData.password,
            });

            // Save token and update authentication state
            const { token } = response.data;
            localStorage.setItem(TOKEN_KEY, token);
            setIsAuthenticated(true);
            setError(null);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            // Handle authentication errors
            const errorMessage = err.response?.status === 403
                ? 'Invalid credentials. Please try again.'
                : 'An error occurred. Please try again later.';

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    /**
     * Renders the login information section
     * @returns {JSX.Element} - Login info column
     */
    const renderInfoSection = () => (
        <Col md={5} className="login-info-col">
            <div className="login-info">
                <div className="login-info-content">
                    <h1>Welcome Back</h1>
                    <p>
                        Log in to access your eco-friendly budgeting tools and track your environmental impact.
                    </p>
                    <div className="login-graphics">
                        <div className="login-circle"></div>
                        <div className="login-leaf">🌿</div>
                    </div>
                </div>
            </div>
        </Col>
    );

    /**
     * Renders the login form section
     * @returns {JSX.Element} - Login form column
     */
    const renderFormSection = () => (
        <Col md={7}>
            <div className="login-form-container">
                <h2 className="page-title">Log In</h2>

                {/* Error alert */}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    {/* Email input */}
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

                    {/* Password input */}
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

                    {/* Forgot password link */}
                    <div className="text-end mb-3">
                        <Link to="/forgot-password" className="forgot-password">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit button */}
                    <div className="login-button-wrapper">
                        <button
                            type="submit"
                            className="btn-eco-primary w-100"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>

                    {/* Register link */}
                    <div className="text-center mt-4">
                        <p className="register-link">
                            Don't have an account? <Link to="/register">Register here</Link>
                        </p>
                    </div>
                </Form>
            </div>
        </Col>
    );

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col md={11} lg={10} xl={9}>
                    <div className="login-container eco-card">
                        <Row className="g-0">
                            {renderInfoSection()}
                            {renderFormSection()}
                        </Row>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;