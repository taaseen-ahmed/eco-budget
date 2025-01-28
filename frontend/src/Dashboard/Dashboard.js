import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [cumulativeData, setCumulativeData] = useState([]);
    const [individualData, setIndividualData] = useState([]);
    const [totalSpending, setTotalSpending] = useState(0);

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

    const filterTransactionsForCurrentMonth = (transactions) => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions.filter(transaction => new Date(transaction.date) >= startDate);
    };

    const calculateCumulativeData = useCallback((transactions) => {
        const filteredTransactions = filterTransactionsForCurrentMonth(transactions);
        const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        let cumulativeSum = 0;
        const cumulative = sortedTransactions.map(transaction => {
            cumulativeSum += parseFloat(transaction.amount) || 0;
            return { date: transaction.date, cumulativeSum };
        });
        const individual = sortedTransactions.map(transaction => ({
            date: transaction.date,
            amount: parseFloat(transaction.amount) || 0,
        }));
        setCumulativeData(cumulative);
        setIndividualData(individual);

        const total = filteredTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        setTotalSpending(total.toFixed(2));
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        calculateCumulativeData(transactions);
    }, [transactions, calculateCumulativeData]);

    const chartData = {
        labels: cumulativeData.map(data => new Date(data.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Cumulative Spending (£)',
                data: cumulativeData.map(data => data.cumulativeSum),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const chartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const index = context.dataIndex;
                        const individualAmount = individualData[index]?.amount || 0;
                        return `£${individualAmount}`;
                    }
                }
            }
        }
    };

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Welcome to your Dashboard</h2>
                <p>Here is an overview of your spending and carbon footprint</p>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="chart-description">
                        <h3>Your Spending this month</h3>
                        <p>Total Spending: £{totalSpending}</p>
                    </div>
                    <div className="spending-chart">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
                <div className="dashboard-card">
                    <div className="carbon-footprint-summary">
                        <h3>Total Carbon Footprint</h3>
                    </div>
                </div>
                <div className="dashboard-card">Spending Insights</div>
                <div className="dashboard-card">Carbon Footprint Insights</div>
            </div>
        </div>
    );
};

export default Dashboard;