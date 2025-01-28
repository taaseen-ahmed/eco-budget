import React, { useCallback, useState, useEffect } from 'react';
import './CarbonFootprint.css';
import axios from 'axios';

const CarbonFootprint = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);

    const fetchTransactions = useCallback(async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get('/api/transaction/user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('Failed to fetch transactions. Please try again.');
        }
    }, []);

    const calculateTotalCarbonFootprint = (transactions) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        });

        const total = filteredTransactions.reduce((sum, transaction) => {
            return sum + (transaction.carbonFootprint || 0);
        }, 0);

        setTotalCarbonFootprint(total.toFixed(2));
    };

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        calculateTotalCarbonFootprint(transactions);
    }, [transactions]);

    return (
        <div className="carbon-footprint-container">
            <div className="header">
                <h2>Carbon Footprint</h2>
                <p>Track your carbon footprint and see the impact of your everyday spending!</p>
            </div>
            <div className="total-carbon-footprint">
                <h3>Total Carbon Footprint for Current Month: {totalCarbonFootprint} kg CO2</h3>
            </div>
        </div>
    );
};

export default CarbonFootprint;