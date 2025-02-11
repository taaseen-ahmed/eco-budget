import React, { useCallback, useState, useEffect } from 'react';
import './CarbonFootprint.css';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale);

const CarbonFootprint = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);
    const [cumulativeData, setCumulativeData] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [previousMonthData, setPreviousMonthData] = useState([]);
    const [comparePreviousMonth, setComparePreviousMonth] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get('/api/recommendations/carbon-footprint', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecommendations(response.data.carbonFootprintRecommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            alert('Failed to fetch recommendations. Please try again.');
        } finally {
            setLoading(false);
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

    const calculateCumulativeData = (transactions, monthOffset = 0) => {
        const currentDate = new Date();
        let targetMonth = currentDate.getMonth() - monthOffset;
        let targetYear = currentDate.getFullYear();

        if (targetMonth < 0) {
            targetMonth += 12;
            targetYear -= 1;
        }

        const filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === targetMonth && transactionDate.getFullYear() === targetYear && transaction.type !== 'Income';
        });

        const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        let cumulativeSum = 0;
        const cumulative = sortedTransactions.map(transaction => {
            cumulativeSum += transaction.carbonFootprint || 0;
            return { date: transaction.date, cumulativeSum, individualFootprint: transaction.carbonFootprint || 0 };
        });

        if (monthOffset === 0) {
            setCumulativeData(cumulative);
        } else {
            setPreviousMonthData(cumulative);
        }
    };

    const calculateCategoryBreakdown = (transactions) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear && transaction.type !== 'Income';
        });

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
        calculateCumulativeData(transactions, 1); // Fetch previous month data
        calculateCategoryBreakdown(transactions);
    }, [transactions]);

    const lineChartData = {
        labels: cumulativeData.map(data => new Date(data.date)),
        datasets: [
            {
                label: 'Current Month Carbon Footprint (kg CO2)',
                data: cumulativeData.map(data => ({ x: new Date(data.date).getDate(), y: data.cumulativeSum, individualFootprint: data.individualFootprint })),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
            comparePreviousMonth && {
                label: 'Previous Month Carbon Footprint (kg CO2)',
                data: previousMonthData.map(data => ({ x: new Date(data.date).getDate(), y: data.cumulativeSum, individualFootprint: data.individualFootprint })),
                fill: false,
                backgroundColor: 'rgba(255,99,132,0.4)',
                borderColor: 'rgba(255,99,132,1)',
            },
        ].filter(Boolean),
    };

    const lineChartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const individualFootprint = (context.raw.individualFootprint || 0).toFixed(2);
                        const cumulativeSum = (context.raw.y || 0).toFixed(2);
                        return `Individual: ${individualFootprint} kg CO2\nCumulative: ${cumulativeSum} kg CO2`;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Day of the Month',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Cumulative Carbon Footprint (kg CO2)',
                },
            },
        },
    };

    const barChartData = {
        labels: categoryBreakdown.map(item => item.category),
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
            <div className="toggle-container">
                <label>
                    <input
                        type="checkbox"
                        checked={comparePreviousMonth}
                        onChange={() => setComparePreviousMonth(!comparePreviousMonth)}
                    />
                    Compare with Previous Month
                </label>
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
            <div className="recommendations">
                <h4>Carbon Footprint Recommendations</h4>
                <button onClick={fetchRecommendations} className="add-transaction-button" disabled={loading}>
                    {loading ? <div className="spinner"></div> : (recommendations.length === 0 ? 'Generate Recommendations' : 'Regenerate Recommendations')}
                </button>
                <ul>
                    {recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CarbonFootprint;