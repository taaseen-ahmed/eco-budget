// src/HelloTest.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HelloTest = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Make the API request to the backend
        axios.get('/api/hello', {
            auth: {
                username: 'user', // Your backend username
                password: 'ce7128a5-1eab-4297-88a5-a0891b63e326', // Your backend password
            }
        })
            .then(response => {
                setMessage(response.data);  // Set the response message
            })
            .catch(error => {
                setError('Failed to fetch data: ' + error.message);
            });
    }, []);

    return (
        <div>
            <h1>API Test</h1>
            <p>Response from server: {message || error}</p>
        </div>
    );
};

export default HelloTest;