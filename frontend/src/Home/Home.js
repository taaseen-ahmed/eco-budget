import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Row, Col } from 'react-bootstrap';
import './Home.css';

const Home = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="home">
            <section className="hero-section">
                <Container>
                    <motion.div
                        className="hero-content text-center"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.h1 variants={fadeInUp} className="hero-title">
                            Smart Budgeting for a <span className="text-accent">Greener</span> Tomorrow
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="hero-subtitle">
                            Track your spending and reduce your carbon footprint with our all-in-one eco-friendly budgeting app.
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="home-cta d-flex justify-content-center gap-3"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link to="/register" className="btn-eco-primary home-link">Get Started</Link>
                            </motion.div>
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

            <section className="features-section">
                <Container>
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

                    <Row className="features-container">
                        <Col lg={4} md={6} className="mb-4">
                            <motion.div
                                className="feature-card eco-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="feature-icon">
                                    <span role="img" aria-label="Track Expenses">💸</span>
                                </div>
                                <h3>Track Expenses</h3>
                                <p>Easily monitor your spending habits with our intuitive dashboard and detailed categorization.</p>
                            </motion.div>
                        </Col>

                        <Col lg={4} md={6} className="mb-4">
                            <motion.div
                                className="feature-card eco-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="feature-icon">
                                    <span role="img" aria-label="Carbon Footprint">🌍</span>
                                </div>
                                <h3>Reduce Carbon Footprint</h3>
                                <p>See the environmental impact of your purchases and get personalized suggestions to reduce your carbon footprint.</p>
                            </motion.div>
                        </Col>

                        <Col lg={4} md={6} className="mb-4">
                            <motion.div
                                className="feature-card eco-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="feature-icon">
                                    <span role="img" aria-label="Set Budgets">📊</span>
                                </div>
                                <h3>Set Budgets</h3>
                                <p>Plan your budget with preset or custom categories and receive alerts when you're close to your limits.</p>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Home;