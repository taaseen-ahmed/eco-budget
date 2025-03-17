import React, { useCallback, useState, useEffect } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { FaFilter, FaLeaf, FaSeedling } from 'react-icons/fa';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import './CarbonFootprint.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, TimeScale
);

/**
 * CarbonFootprint component
 * Tracks and visualizes user's carbon emissions from spending
 */
const CarbonFootprint = () => {
    // Constants
    const TOKEN_KEY = 'jwtToken';
    const API_ENDPOINTS = {
        transactions: '/api/transaction/user',
        categories: '/api/categories',
        recommendations: '/api/recommendations/carbon-footprint',
        benchmarks: '/api/benchmarks'
    };

    // State - Data
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);
    const [cumulativeData, setCumulativeData] = useState([]);
    const [previousMonthData, setPreviousMonthData] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [benchmarks, setBenchmarks] = useState([]);

    // State - UI controls
    const [comparePreviousMonth, setComparePreviousMonth] = useState(false);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);

    /**
     * Fetches user's transactions from API
     */
    const fetchTransactions = useCallback(async () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.transactions, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            alert('Failed to fetch transactions. Please try again.');
        }
    }, [API_ENDPOINTS.transactions]);

    /**
     * Fetches categories from API
     */
    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.categories, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to fetch categories. Please try again.');
        }
    }, [API_ENDPOINTS.categories]);

    /**
     * Fetches carbon footprint recommendations from API
     */
    const fetchRecommendations = useCallback(async () => {
        setLoadingRecommendations(true);
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.recommendations, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecommendations(response.data.carbonFootprintRecommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            alert('Failed to fetch recommendations. Please try again.');
        } finally {
            setLoadingRecommendations(false);
        }
    }, [API_ENDPOINTS.recommendations]);

    /**
     * Fetches carbon footprint benchmarks from API
     */
    const fetchBenchmarks = useCallback(async () => {
        setLoadingBenchmarks(true);
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.benchmarks, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBenchmarks(response.data.benchmarks);
        } catch (error) {
            console.error('Error fetching benchmarks:', error);
            alert('Failed to fetch benchmarks. Please try again.');
        } finally {
            setLoadingBenchmarks(false);
        }
    }, [API_ENDPOINTS.benchmarks]);

    /**
     * Filters transactions based on selected period and category
     * @param {Array} transactions - Transactions to filter
     * @param {string} period - Time period to filter by
     * @returns {Array} Filtered transactions
     */
    const filterTransactions = useCallback((transactions, period) => {
        const currentDate = new Date();
        let startDate, endDate;

        // Determine date range based on selected period
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

        // Apply filters
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const isWithinDateRange = transactionDate >= startDate && transactionDate <= endDate;
            const isWithinCategory = selectedCategory ? transaction.category?.name === selectedCategory : true;
            return isWithinDateRange && isWithinCategory && transaction.type !== 'Income';
        });
    }, [selectedCategory, customStartDate, customEndDate]);

    /**
     * Calculates the total carbon footprint for the selected period
     * @param {Array} transactions - Transactions to calculate from
     * @param {string} period - Time period to calculate for
     */
    const calculateTotalCarbonFootprint = useCallback((transactions, period) => {
        const filteredTransactions = filterTransactions(transactions, period);
        const total = filteredTransactions.reduce((sum, transaction) => {
            return sum + (transaction.carbonFootprint || 0);
        }, 0);
        setTotalCarbonFootprint(total.toFixed(2));
    }, [filterTransactions]);

    /**
     * Calculates cumulative carbon footprint data for charts
     * @param {Array} transactions - Transactions to calculate from
     * @param {string} period - Time period to calculate for
     * @param {Function} setData - State setter function for the calculated data
     */
    const calculateCumulativeData = useCallback((transactions, period, setData) => {
        const filteredTransactions = filterTransactions(transactions, period);

        // Sort by date and calculate cumulative values
        const sortedTransactions = [...filteredTransactions].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        let cumulativeSum = 0;
        const cumulative = sortedTransactions.map(transaction => {
            cumulativeSum += transaction.carbonFootprint || 0;
            return {
                date: new Date(transaction.date),
                day: new Date(transaction.date).getDate(),
                cumulativeSum,
                individualFootprint: transaction.carbonFootprint || 0
            };
        });

        setData(cumulative);
    }, [filterTransactions]);

    /**
     * Gets user-friendly name for selected time period
     * @returns {string} Period name
     */
    const getPeriodName = () => {
        switch (selectedPeriod) {
            case 'currentMonth': return 'Current Month';
            case 'lastMonth': return 'Last Month';
            case 'last3Months': return 'Last 3 Months';
            case 'custom': return 'Custom Period';
            default: return 'Selected Period';
        }
    };

    /**
     * Calculates the carbon footprint distribution by category
     * @param {Array} transactions - Transactions to analyze
     * @returns {Object} Chart data for pie chart
     */
    const calculateCarbonFootprintDistribution = (transactions) => {
        // Filter and group by category
        const filteredTransactions = filterTransactions(transactions, selectedPeriod)
            .filter(transaction => transaction.type !== 'Income');

        const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
            const category = transaction.category?.name || 'Uncategorized';
            acc[category] = (acc[category] || 0) + (transaction.carbonFootprint || 0);
            return acc;
        }, {});

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        // Generate distributed colors using golden ratio
        const colors = labels.map((_, index) => {
            const hue = (index * 137) % 360;
            return `hsl(${hue}, 70%, 60%)`;
        });

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: colors.map(color => color.replace('60%', '50%')),
            }],
        };
    };

    // Fetch initial data
    useEffect(() => {
        // Fetch initial data from APIs
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchTransactions(),
                    fetchCategories()
                ]);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchData();
    }, [fetchTransactions, fetchCategories]);

    // Process data when dependencies change
    useEffect(() => {
        // Calculate carbon footprint data based on current filters
        calculateTotalCarbonFootprint(transactions, selectedPeriod);
        calculateCumulativeData(transactions, selectedPeriod, setCumulativeData);

        // For comparison feature, calculate previous month data when needed
        if (selectedPeriod === 'currentMonth') {
            calculateCumulativeData(transactions, 'lastMonth', setPreviousMonthData);
        }
    }, [
        transactions,
        selectedCategory,
        selectedPeriod,
        customStartDate,
        customEndDate,
        calculateTotalCarbonFootprint,
        calculateCumulativeData
    ]);

    // Prepare chart data
    const carbonFootprintDistributionData = calculateCarbonFootprintDistribution(transactions);

    // Chart configurations
    const chartConfig = {
        // Line chart for cumulative carbon footprint
        line: {
            data: {
                labels: comparePreviousMonth
                    ? Array.from({ length: 31 }, (_, i) => i + 1)
                    : cumulativeData.map(data => data.date),
                datasets: [
                    {
                        label: 'Current Month Carbon Footprint (kg CO2)',
                        data: comparePreviousMonth
                            ? cumulativeData.map(data => ({
                                x: data.day,
                                y: data.cumulativeSum,
                                individualFootprint: data.individualFootprint
                            }))
                            : cumulativeData.map(data => ({
                                x: data.date,
                                y: data.cumulativeSum,
                                individualFootprint: data.individualFootprint
                            })),
                        fill: false,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                    },
                    comparePreviousMonth && {
                        label: 'Previous Month Carbon Footprint (kg CO2)',
                        data: previousMonthData.map(data => ({
                            x: data.day,
                            y: data.cumulativeSum,
                            individualFootprint: data.individualFootprint
                        })),
                        fill: false,
                        backgroundColor: 'rgba(255,99,132,0.4)',
                        borderColor: 'rgba(255,99,132,1)',
                    },
                ].filter(Boolean),
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const individualFootprint = (context.raw.individualFootprint || 0).toFixed(2);
                                const cumulativeSum = (context.raw.y || 0).toFixed(2);
                                return `Individual: ${individualFootprint} kg CO2\nCumulative: ${cumulativeSum} kg CO2`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
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
                        grid: {
                            display: false
                        }
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
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cumulative Carbon Footprint (kg CO2)',
                        },
                        grid: {
                            borderDash: [2, 4]
                        }
                    },
                },
            }
        },
        // Pie chart for carbon footprint distribution by category
        doughnut: {
            data: carbonFootprintDistributionData,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                cutout: '60%', // Create doughnut hole
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw.toFixed(2);
                                const total = carbonFootprintDistributionData.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${value} kg CO2 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * Renders the main carbon footprint chart section
     * @returns {JSX.Element} Carbon footprint chart component
     */
    const renderCarbonFootprintChart = () => (
        <Col lg={8}>
            <div className="carbon-footprint-chart eco-card">
                <div className="chart-header">
                    <div>
                        <h3 className="chart-title">Cumulative Carbon Footprint</h3>
                        <p className="chart-description">
                            This chart shows how your carbon emissions accumulate over time based on your spending.
                        </p>
                    </div>
                    <button
                        onClick={() => setFilterPopupVisible(true)}
                        className="btn-eco-secondary"
                    >
                        <FaFilter className="me-2" /> Filter Data
                    </button>
                </div>

                <div className="total-carbon-footprint">
                    <div className="carbon-icon"><FaLeaf /></div>
                    <div className="carbon-stats">
                        <span className="carbon-label">Total Carbon Footprint for {getPeriodName()}</span>
                        <span className="carbon-value">{totalCarbonFootprint} kg CO<sub>2</sub></span>
                    </div>
                </div>

                <div className="line-chart-container">
                    <Line
                        data={chartConfig.line.data}
                        options={chartConfig.line.options}
                    />
                </div>
            </div>
        </Col>
    );

    /**
     * Renders the distribution pie chart section
     * @returns {JSX.Element} Distribution chart component
     */
    const renderDistributionChart = () => (
        <Col lg={4}>
            <div className="distribution-chart eco-card">
                <h3 className="chart-title">Carbon Footprint by Category</h3>
                <div className="doughnut-chart-container">
                    <Doughnut
                        data={chartConfig.doughnut.data}
                        options={chartConfig.doughnut.options}
                    />
                </div>
            </div>
        </Col>
    );

    /**
     * Renders the recommendations section
     * @returns {JSX.Element} Recommendations component
     */
    const renderRecommendationsSection = () => (
        <Col md={6}>
            <div className="carbon-recommendations eco-card">
                <div className="recommendations-header">
                    <h3 className="chart-title">
                        <FaSeedling className="me-2" />
                        Eco-Friendly Recommendations
                    </h3>
                    <button
                        onClick={fetchRecommendations}
                        className="btn-eco-secondary"
                        disabled={loadingRecommendations}
                    >
                        {loadingRecommendations ? (
                            <span className="spinner-container">
                <span className="spinner"></span>
              </span>
                        ) : (
                            recommendations.length === 0 ? 'Generate Tips' : 'Refresh Tips'
                        )}
                    </button>
                </div>

                {recommendations.length > 0 ? (
                    <ul className="recommendations-list">
                        {recommendations.map((recommendation, index) => (
                            <li key={index} className="recommendation-item">
                                <span className="recommendation-icon">💡</span>
                                <span className="recommendation-text">{recommendation}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="empty-recommendations">
                        {loadingRecommendations ? (
                            <p>Generating personalized recommendations...</p>
                        ) : (
                            <p>Generate recommendations to reduce your carbon footprint.</p>
                        )}
                    </div>
                )}
            </div>
        </Col>
    );

    /**
     * Renders the benchmarks section
     * @returns {JSX.Element} Benchmarks component
     */
    const renderBenchmarksSection = () => (
        <Col md={6}>
            <div className="carbon-benchmarks eco-card">
                <div className="benchmarks-header">
                    <h3 className="chart-title">
                        <i className="benchmark-icon">📊</i>
                        Carbon Footprint Benchmarks
                    </h3>
                    <button
                        onClick={fetchBenchmarks}
                        className="btn-eco-secondary"
                        disabled={loadingBenchmarks}
                    >
                        {loadingBenchmarks ? (
                            <span className="spinner-container">
                <span className="spinner"></span>
              </span>
                        ) : (
                            benchmarks.length === 0 ? 'Show Benchmarks' : 'Refresh Benchmarks'
                        )}
                    </button>
                </div>

                {benchmarks.length > 0 ? (
                    <ul className="benchmarks-list">
                        {benchmarks.map((benchmark, index) => (
                            <li key={index} className="benchmark-item">
                                <span className="benchmark-icon">📈</span>
                                <span className="benchmark-text">{benchmark}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="empty-benchmarks">
                        {loadingBenchmarks ? (
                            <p>Loading carbon footprint benchmarks...</p>
                        ) : (
                            <p>View benchmarks to compare your carbon footprint with others.</p>
                        )}
                    </div>
                )}
            </div>
        </Col>
    );

    /**
     * Renders the filter popup
     * @returns {JSX.Element|null} Filter popup or null if not visible
     */
    const renderFilterPopup = () => {
        if (!isFilterPopupVisible) return null;

        return (
            <div className="popup-overlay">
                <div className="popup-container filter-popup eco-card">
                    <div className="popup-header">
                        <h3>Filter Carbon Footprint Data</h3>
                        <button
                            className="close-button"
                            onClick={() => setFilterPopupVisible(false)}
                            aria-label="Close popup"
                        >
                            ×
                        </button>
                    </div>
                    <div className="popup-body">
                        <form className="filter-form">
                            <div className="form-group">
                                <label htmlFor="filterCategory">Category</label>
                                <select
                                    id="filterCategory"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="selectedPeriod">Time Period</label>
                                <select
                                    id="selectedPeriod"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="currentMonth">Current Month</option>
                                    <option value="lastMonth">Last Month</option>
                                    <option value="last3Months">Last 3 Months</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {selectedPeriod === 'custom' && (
                                <Row className="g-3">
                                    <Col sm={6}>
                                        <div className="form-group">
                                            <label htmlFor="customStartDate">Start Date</label>
                                            <input
                                                type="date"
                                                id="customStartDate"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="form-control"
                                            />
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="form-group">
                                            <label htmlFor="customEndDate">End Date</label>
                                            <input
                                                type="date"
                                                id="customEndDate"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="form-control"
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {selectedPeriod === 'currentMonth' && (
                                <div className="form-group">
                                    <div className="comparison-toggle">
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={comparePreviousMonth}
                                                onChange={() => setComparePreviousMonth(!comparePreviousMonth)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className="toggle-label">Compare with Previous Month</span>
                                    </div>
                                </div>
                            )}

                            <div className="popup-actions">
                                <button
                                    type="button"
                                    onClick={() => setFilterPopupVisible(false)}
                                    className="btn-eco-primary"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedPeriod('currentMonth');
                                        setComparePreviousMonth(false);
                                        setFilterPopupVisible(false);
                                    }}
                                    className="btn-eco-secondary"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Container className="carbon-footprint-container">
            {/* Page header */}
            <div className="section-header text-center">
                <h2 className="page-title">Carbon Footprint</h2>
                <p className="section-subtitle">
                    Track your carbon footprint and see the environmental impact of your everyday spending!
                </p>
            </div>

            {/* Main charts row */}
            <Row className="g-4">
                {renderCarbonFootprintChart()}
                {renderDistributionChart()}
            </Row>

            {/* Recommendations and benchmarks row */}
            <Row className="g-4 mt-4">
                {renderRecommendationsSection()}
                {renderBenchmarksSection()}
            </Row>

            {/* Filter popup */}
            {renderFilterPopup()}
        </Container>
    );
};

export default CarbonFootprint;