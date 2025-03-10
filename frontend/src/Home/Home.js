import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Row, Col } from 'react-bootstrap';
import './Home.css';

/**
 * Home page component
 * Landing page with hero section and features
 */
const Home = () => {
    // Animation variants for staggered animations
    const animations = {
        // Fade in from bottom animation for text elements
        fadeInUp: {
            hidden: { opacity: 0, y: 30 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6 }
            }
        },

        // Container for staggered children animations
        staggerContainer: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.2
                }
            }
        }
    };

    // Feature card data for mapping
    const features = [
        {
            icon: '💸',
            title: 'Track Expenses',
            description: 'Easily monitor your spending habits with our intuitive dashboard and detailed categorization.',
            ariaLabel: 'Track Expenses',
            delay: 0.1
        },
        {
            icon: '🌍',
            title: 'Reduce Carbon Footprint',
            description: 'See the environmental impact of your purchases and get personalized suggestions to reduce your carbon footprint.',
            ariaLabel: 'Carbon Footprint',
            delay: 0.2
        },
        {
            icon: '📊',
            title: 'Set Budgets',
            description: 'Plan your budget with preset or custom categories and receive alerts when you\'re close to your limits.',
            ariaLabel: 'Set Budgets',
            delay: 0.3
        }
    ];

    /**
     * Renders a feature card with animation
     * @param {Object} feature - Feature data object
     * @param {number} index - Index for key prop
     * @returns {JSX.Element} - Feature card component
     */
    const renderFeatureCard = (feature, index) => (
        <Col lg={4} md={6} className="mb-4" key={index}>
            <motion.div
                className="feature-card eco-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ y: -10 }}
            >
                <div className="feature-icon">
                    <span role="img" aria-label={feature.ariaLabel}>{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
            </motion.div>
        </Col>
    );

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero-section">
                <Container>
                    <motion.div
                        className="hero-content text-center"
                        initial="hidden"
                        animate="visible"
                        variants={animations.staggerContainer}
                    >
                        <motion.h1 variants={animations.fadeInUp} className="hero-title">
                            Smart Budgeting for a <span className="text-accent">Greener</span> Tomorrow
                        </motion.h1>

                        <motion.p variants={animations.fadeInUp} className="hero-subtitle">
                            Track your spending and reduce your carbon footprint with our all-in-one eco-friendly budgeting app.
                        </motion.p>

                        <motion.div
                            variants={animations.fadeInUp}
                            className="home-cta d-flex justify-content-center gap-3"
                        >
                            {/* Register button with hover animation */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link to="/register" className="btn-eco-primary home-link">Get Started</Link>
                            </motion.div>

                            {/* Login button with hover animation */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link to="/login" className="btn-eco-secondary home-link">Log In</Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <Container>
                    {/* Section header with scroll animation */}
                    <motion.div
                        className="text-center section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="page-title">Why Choose Eco-Budget?</h2>
                        <p className="feature-lead">
                            Our platform helps you stay on top of your finances while keeping your environmental impact minimal.
                        </p>
                    </motion.div>

                    {/* Feature cards */}
                    <Row className="features-container">
                        {features.map(renderFeatureCard)}
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Home;