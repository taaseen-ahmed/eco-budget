import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home">
            <section className="hero-section">
                <div className="hero-content text-center">
                    <h1>Welcome to Eco-Budget</h1>
                    <p className="lead">Track your spending and monitor your carbon footprint.</p>
                    <p className="text-muted">Powered by ChatGPT</p>
                    <div className="home-links d-flex justify-content-center gap-3">
                        <Link to="/register" className="home-link btn btn-primary">Register</Link>
                        <Link to="/login" className="home-link btn btn-outline-primary">Log In</Link>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container text-center">
                    <h2>Why Choose Eco-Budget?</h2>
                    <p className="lead">Eco-Budget helps you stay on top of your finances while making sure your environmental impact stays minimal. With our intuitive platform, you can:</p>
                    <div className="row">
                        <div className="col-md-4 feature-card">
                            <h3>Track Expenses</h3>
                            <p>Monitor your spending habits easily.</p>
                        </div>
                        <div className="col-md-4 feature-card">
                            <h3>Reduce Carbon Footprint</h3>
                            <p>See the environmental impact of your purchases.</p>
                        </div>
                        <div className="col-md-4 feature-card">
                            <h3>Set Budgets</h3>
                            <p>Plan your budget with preset or custom categories.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;