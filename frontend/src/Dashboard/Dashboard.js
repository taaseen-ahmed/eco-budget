import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);

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

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filterTransactionsByPeriod = (transactions) => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions.filter(transaction => new Date(transaction.date) >= startDate);
    };

    const prepareChartData = (transactions) => {
        const data = {};
        let cumulativeTotal = 0;

        transactions
            .filter(transaction => transaction.type === "Expense")
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(transaction => {
                const date = new Date(transaction.date).toLocaleDateString();
                if (!data[date]) {
                    data[date] = 0;
                }
                cumulativeTotal += parseFloat(transaction.amount);
                data[date] = cumulativeTotal;
            });

        return Object.keys(data).map(date => ({ date, amount: data[date] }));
    };

    const calculateTotalCarbonFootprint = (transactions) => {
        return transactions.reduce((total, transaction) => {
            return total + (transaction.carbonFootprint || 0);
        }, 0);
    };

    const filteredTransactionsByPeriod = filterTransactionsByPeriod(transactions);
    const totalCarbonFootprint = calculateTotalCarbonFootprint(filteredTransactionsByPeriod);

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Welcome to your Dashboard</h2>
                <p>Here is an overview of your spending and carbon Footprint</p>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="chart-description">
                        <h3>Your Spending this month</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={prepareChartData(filteredTransactionsByPeriod)}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="date"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{r: 8}}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="dashboard-card">
                    <div className="carbon-footprint-summary">
                        <h3>Total Carbon Footprint</h3>
                        <p>{totalCarbonFootprint.toFixed(2)} kg CO2</p>
                    </div>
                </div>
                <div className="dashboard-card">Spending Insights</div>
                <div className="dashboard-card">Carbon Footprint Insights</div>
            </div>
        </div>
    );
};

export default Dashboard;