import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import './Registration.css';

/**
 * Registration component
 * Handles new user account creation
 */
const Registration = () => {
    // Constants
    const TOKEN_KEY = 'jwtToken';
    const API_REGISTER_ENDPOINT = '/api/public/auth/register';

    // State management
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
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
     * Handles form submission and user registration
     *
     * @param {Object} e - Event object
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Make API request to register user
            const response = await axios.post(API_REGISTER_ENDPOINT, formData);

            // Save authentication token and redirect to dashboard
            const { token } = response.data;
            localStorage.setItem(TOKEN_KEY, token);
            navigate('/dashboard');
        } catch (err) {
            // Handle registration errors
            setError('Registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    /**
     * Renders the registration information section
     * @returns {JSX.Element} - Registration info column
     */
    const renderInfoSection = () => (
        <Col md={5} className="registration-info-col">
            <div className="registration-info">
                <div className="registration-info-content">
                    <h1>Join Eco-Budget</h1>
                    <p>
                        Create an account to start tracking your eco-friendly budget and reduce your carbon footprint.
                    </p>
                    <div className="registration-graphics">
                        <div className="registration-circle"></div>
                        <div className="registration-leaf">🌱</div>
                    </div>
                </div>
            </div>
        </Col>
    );

    /**
     * Renders the registration form section
     * @returns {JSX.Element} - Registration form column
     */
    const renderFormSection = () => (
        <Col md={7}>
            <div className="registration-form-container">
                <h2 className="page-title">Create Account</h2>

                {/* Error alert */}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    {/* Name fields - first and last name */}
                    <Row>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="firstName">First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    required
                                    className="registration-input"
                                />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="lastName">Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    required
                                    className="registration-input"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Email input */}
                    <Form.Group className="mb-3">
                        <Form.Label htmlFor="email">Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your email address"
                            required
                            className="registration-input"
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
                            placeholder="Create a password"
                            required
                            className="registration-input"
                        />
                        <Form.Text className="text-muted">
                            Password should be at least 8 characters long
                        </Form.Text>
                    </Form.Group>

                    {/* Submit button */}
                    <div className="registration-button-wrapper">
                        <button
                            type="submit"
                            className="btn-eco-primary w-100"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>

                    {/* Login link */}
                    <div className="text-center mt-4">
                        <p className="login-link">
                            Already have an account? <Link to="/login">Log in here</Link>
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
                    <div className="registration-container eco-card">
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

export default Registration;