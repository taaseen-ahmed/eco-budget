import React, { useCallback, useState, useEffect } from 'react';
import './CarbonFootprint.css';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale);

const CarbonFootprint = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);
    const [cumulativeData, setCumulativeData] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [previousMonthData, setPreviousMonthData] = useState([]);
    const [comparePreviousMonth, setComparePreviousMonth] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);

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

    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get('/api/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to fetch categories. Please try again.');
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

    const filterTransactions = useCallback((transactions, period) => {
        const currentDate = new Date();
        let startDate, endDate;

        switch (period) {
            case 'currentMonth':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
                break;
            case 'last3Months':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                break;
            case 'custom':
                startDate = new Date(customStartDate);
                endDate = new Date(customEndDate);
                break;
            default:
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        }

        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const isWithinDateRange = transactionDate >= startDate && transactionDate <= endDate;
            const isWithinCategory = selectedCategory ? transaction.category?.name === selectedCategory : true;
            return isWithinDateRange && isWithinCategory && transaction.type !== 'Income';
        });
    }, [selectedCategory, customStartDate, customEndDate]);

    const calculateTotalCarbonFootprint = useCallback((transactions) => {
        const filteredTransactions = filterTransactions(transactions, selectedPeriod);
        const total = filteredTransactions.reduce((sum, transaction) => {
            return sum + (transaction.carbonFootprint || 0);
        }, 0);
        setTotalCarbonFootprint(total.toFixed(2));
    }, [filterTransactions, selectedPeriod]);

    const calculateCumulativeData = useCallback((transactions, period, setData) => {
        const filteredTransactions = filterTransactions(transactions, period);
        const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        let cumulativeSum = 0;
        const cumulative = sortedTransactions.map(transaction => {
            cumulativeSum += transaction.carbonFootprint || 0;
            return { date: new Date(transaction.date), day: new Date(transaction.date).getDate(), cumulativeSum, individualFootprint: transaction.carbonFootprint || 0 };
        });

        setData(cumulative);
    }, [filterTransactions]);

    const calculateCategoryBreakdown = useCallback((transactions) => {
        const filteredTransactions = filterTransactions(transactions, selectedPeriod);
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
    }, [filterTransactions, selectedPeriod]);

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, [fetchTransactions, fetchCategories]);

    useEffect(() => {
        calculateTotalCarbonFootprint(transactions);
        calculateCumulativeData(transactions, selectedPeriod, setCumulativeData);
        if (selectedPeriod === 'currentMonth') {
            calculateCumulativeData(transactions, 'lastMonth', setPreviousMonthData);
        }
        calculateCategoryBreakdown(transactions);
    }, [transactions, selectedCategory, selectedPeriod, customStartDate, customEndDate, calculateTotalCarbonFootprint, calculateCumulativeData, calculateCategoryBreakdown]);

    const lineChartData = {
        labels: comparePreviousMonth ? Array.from({ length: 31 }, (_, i) => i + 1) : cumulativeData.map(data => data.date),
        datasets: [
            {
                label: 'Current Month Carbon Footprint (kg CO2)',
                data: comparePreviousMonth ? cumulativeData.map(data => ({ x: data.day, y: data.cumulativeSum, individualFootprint: data.individualFootprint })) : cumulativeData.map(data => ({ x: data.date, y: data.cumulativeSum, individualFootprint: data.individualFootprint })),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
            comparePreviousMonth && {
                label: 'Previous Month Carbon Footprint (kg CO2)',
                data: previousMonthData.map(data => ({ x: data.day, y: data.cumulativeSum, individualFootprint: data.individualFootprint })),
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
            x: comparePreviousMonth ? {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Day of the Month',
                },
                ticks: {
                    stepSize: 1,
                },
            } : {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'MMM d',
                    displayFormats: {
                        day: 'MMM d',
                        week: 'MMM d',
                        month: 'MMM yyyy',
                    },
                },
                title: {
                    display: true,
                    text: 'Date',
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
            <div className="carbon-footprint-chart">
                <h3>Cumulative Carbon Footprint Over Time</h3>
                <p>This line chart shows the cumulative total of your carbon emissions over time based on your spending transactions.</p>
                <button onClick={() => setFilterPopupVisible(true)} className="filter-button">Filter</button>
                <div className="total-carbon-footprint">
                    <h3>Total Carbon Footprint for Current Month: {totalCarbonFootprint} kg CO2</h3>
                </div>
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
            {isFilterPopupVisible && (
                <div className="popup">
                    <div className="popup-card">
                        <h3 className="popup-title">Filter & Sort</h3>
                        <form className="popup-form">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field">
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="input-field">
                                <option value="currentMonth">Current Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="last3Months">Last 3 Months</option>
                                <option value="custom">Custom</option>
                            </select>
                            {selectedPeriod === 'custom' && (
                                <>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="input-field"
                                    />
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="input-field"
                                    />
                                </>
                            )}
                            {selectedPeriod === 'currentMonth' && (
                                <div className="toggle-container">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={comparePreviousMonth}
                                            onChange={() => setComparePreviousMonth(!comparePreviousMonth)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                    <span className="toggle-label">Compare with Previous Month</span>
                                </div>
                            )}
                            <div className="popup-buttons">
                                <button type="button" onClick={() => setFilterPopupVisible(false)} className="cancel-button">
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarbonFootprint;