import React, { useCallback, useState, useEffect } from 'react';
import './CarbonFootprint.css';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const CarbonFootprint = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);
    const [cumulativeData, setCumulativeData] = useState([]);
    const [individualData, setIndividualData] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);

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
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear && transaction.type !== 'Income';
        });

        const total = filteredTransactions.reduce((sum, transaction) => {
            return sum + (transaction.carbonFootprint || 0);
        }, 0);

        setTotalCarbonFootprint(total.toFixed(2));
    };

    const calculateCumulativeData = (transactions) => {
        const filteredTransactions = transactions.filter(transaction => transaction.type !== 'Income');
        const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        let cumulativeSum = 0;
        const cumulative = sortedTransactions.map(transaction => {
            cumulativeSum += transaction.carbonFootprint || 0;
            return { date: transaction.date, cumulativeSum };
        });
        const individual = sortedTransactions.map(transaction => ({
            date: transaction.date,
            carbonFootprint: transaction.carbonFootprint || 0,
        }));
        setCumulativeData(cumulative);
        setIndividualData(individual);
    };

    const calculateCategoryBreakdown = (transactions) => {
        const filteredTransactions = transactions.filter(transaction => transaction.type !== 'Income');
        const tempBreakdown = filteredTransactions.reduce((acc, transaction) => {
            const categoryName = transaction.category?.name || 'Uncategorized';
            if (!acc[categoryName]) {
                acc[categoryName] = 0;
            }
            acc[categoryName] += transaction.carbonFootprint || 0;
            return acc;
        }, {});

        const breakdownArray = Object.entries(tempBreakdown).map(([category, value]) => ({
            category,
            value: Number(value.toFixed(2)),
        }));

        setCategoryBreakdown(breakdownArray);
    };

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        calculateTotalCarbonFootprint(transactions);
        calculateCumulativeData(transactions);
        calculateCategoryBreakdown(transactions);
    }, [transactions]);

    const lineChartData = {
        labels: cumulativeData.map(data => new Date(data.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Carbon Footprint (kg CO2)',
                data: cumulativeData.map(data => data.cumulativeSum),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const lineChartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const index = context.dataIndex;
                        const individualFootprint = individualData[index]?.carbonFootprint || 0;
                        return `${individualFootprint} kg CO2`;
                    }
                }
            }
        }
    };

    const barChartData = {
        labels: categoryBreakdown.map(item => item.category), // Correct category names
        datasets: [
            {
                label: 'Carbon Footprint by Category (kg CO2)',
                data: categoryBreakdown.map(item => item.value),
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
            },
        ],
    };

    const barChartOptions = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Category',
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.raw.toFixed(2)} kg CO2`;
                    }
                },
            },
        },
    };

    return (
        <div className="carbon-footprint-container">
            <div className="header">
                <h2>Carbon Footprint</h2>
                <p>Track your carbon footprint and see the impact of your everyday spending!</p>
            </div>
            <div className="total-carbon-footprint">
                <h3>Total Carbon Footprint for Current Month: {totalCarbonFootprint} kg CO2</h3>
            </div>

            <div className="carbon-footprint-chart">
                <h3>Cumulative Carbon Footprint Over Time</h3>
                <p>This line chart shows the cumulative total of your carbon emissions over time based on your spending transactions.</p>
                <Line data={lineChartData} options={lineChartOptions} />
            </div>

            <div className="category-breakdown">
                <h3>Carbon Footprint by Spending Category</h3>
                <p>This bar chart shows the carbon emissions associated with each spending category for the current month.</p>
                <Bar data={barChartData} options={barChartOptions} />
            </div>
        </div>
    );
};

export default CarbonFootprint;