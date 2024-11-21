import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const TOKEN_KEY = 'jwtToken';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/public/auth/authenticate', {
                email: formData.username,
                password: formData.password
            });

            const { token } = response.data;
            localStorage.setItem(TOKEN_KEY, token);
            navigate('/'); // Navigate to the home page or dashboard
        } catch (err) {
            // Check if the error is a 403 (Forbidden) - invalid credentials
            if (err.response && err.response.status === 403) {
                setError('Invalid credentials, please try again.');
            } else {
                setError(err.response ? err.response.data.message : 'Login failed. Please try again.');
            }
            console.error('Login error:', err);
        }
    };

    return (
        <div className="login">
            <h2>Log In</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error">{error}</p>}
                <div>
                    <label htmlFor="username">Username (Email)</label>
                    <input
                        type="email"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Log In</button>
            </form>
        </div>
    );
};

export default Login;