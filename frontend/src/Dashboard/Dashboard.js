import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, ArcElement, Title, Tooltip, Legend, TimeScale
} from 'chart.js';
import {
    FaWallet,
    FaLeaf,
    FaChartLine,
    FaExclamationTriangle,
    FaChartPie,
    FaCalendarAlt,
    FaExchangeAlt
} from 'react-icons/fa';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    ArcElement, Title, Tooltip, Legend, TimeScale
);

/**
 * Dashboard component
 * Displays financial and environmental overview with various charts and metrics
 */
const Dashboard = () => {
    // State management
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [goals, setGoals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cumulativeData, setCumulativeData] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [individualData, setIndividualData] = useState([]);
    const [totalSpending, setTotalSpending] = useState(0);
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [budgetAlerts, setBudgetAlerts] = useState([]);
    const [spendingByCategory, setSpendingByCategory] = useState({ labels: [], data: [] });
    const [carbonByCategory, setCarbonByCategory] = useState({ labels: [], data: [] });
    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'

    /**
     * Fetches all necessary data from APIs
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('jwtToken');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch all necessary data in parallel for better performance
            const [transactionsRes, budgetsRes, goalsRes, categoriesRes] = await Promise.all([
                axios.get('/api/transaction/user', authHeader),
                axios.get('/api/budgets/user', authHeader),
                axios.get('/api/goal/user', authHeader),
                axios.get('/api/categories', authHeader)
            ]);

            setTransactions(transactionsRes.data);
            setBudgets(budgetsRes.data);
            setGoals(goalsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Filters transactions based on selected time frame
     *
     * @param {Array} transactions - All transactions
     * @param {string} timeFrame - Selected time period ('week', 'month', 'year')
     * @returns {Array} - Filtered transactions
     */
    const filterTransactions = useCallback((transactions, timeFrame) => {
        const now = new Date();
        let startDate;

        // Determine start date based on time frame
        switch(timeFrame) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Filter transactions by date and type
        return transactions.filter(transaction =>
            new Date(transaction.date) >= startDate &&
            transaction.type.toLowerCase() === 'expense'
        );
    }, []);

    /**
     * Processes transaction data for charts and summaries
     *
     * @param {Array} transactions - All transactions
     * @param {string} timeFrame - Selected time period
     * @returns {Array} - Filtered transactions for further processing
     */
    const processTransactionData = useCallback((transactions, timeFrame) => {
        const filteredTransactions = filterTransactions(transactions, timeFrame);

        // Sort transactions by date
        const sortedTransactions = [...filteredTransactions].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        // Calculate cumulative spending over time
        let cumulativeSum = 0;
        const cumulative = sortedTransactions.map(transaction => {
            cumulativeSum += parseFloat(transaction.amount) || 0;
            return {
                date: transaction.date,
                cumulativeSum,
                formattedDate: new Date(transaction.date).toLocaleDateString()
            };
        });

        // Map individual transaction amounts (for potential future features)
        const individual = sortedTransactions.map(transaction => ({
            date: transaction.date,
            amount: parseFloat(transaction.amount) || 0,
        }));

        // Calculate total spending amount
        const total = filteredTransactions.reduce(
            (sum, transaction) => sum + (parseFloat(transaction.amount) || 0),
            0
        );

        // Calculate total carbon footprint
        const totalCarbon = filteredTransactions.reduce(
            (sum, transaction) => sum + (parseFloat(transaction.carbonFootprint) || 0),
            0
        );

        // Get recent transactions (latest 5)
        const recent = [...sortedTransactions]
            .reverse()
            .slice(0, 5);

        // Update state with processed data
        setCumulativeData(cumulative);
        setIndividualData(individual);
        setTotalSpending(total.toFixed(2));
        setTotalCarbonFootprint(totalCarbon.toFixed(2));
        setRecentTransactions(recent);

        return filteredTransactions;
    }, [filterTransactions]);

    /**
     * Calculates budget alerts based on spending progress
     *
     * @param {Array} budgets - User budgets
     * @param {Array} transactions - Filtered transactions
     */
    const calculateBudgetAlerts = useCallback((budgets, transactions) => {
        const alerts = [];

        budgets.forEach(budget => {
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            const now = new Date();

            // Only check currently active budgets
            if (now >= startDate && now <= endDate) {
                const percentUsed = (budget.totalSpent / budget.amount) * 100;

                // Add alerts based on budget usage percentage
                if (percentUsed >= 100) {
                    alerts.push({
                        id: budget.id,
                        category: budget.categoryName,
                        message: `Budget exceeded for ${budget.categoryName}`,
                        severity: 'high',
                        percentUsed
                    });
                } else if (percentUsed >= 80) {
                    alerts.push({
                        id: budget.id,
                        category: budget.categoryName,
                        message: `Budget nearly exceeded for ${budget.categoryName}`,
                        severity: 'medium',
                        percentUsed
                    });
                }
            }
        });

        setBudgetAlerts(alerts);
    }, []);

    /**
     * Calculates spending amount by category
     *
     * @param {Array} transactions - Filtered transactions
     * @param {Array} categories - Available categories
     */
    const calculateSpendingByCategory = useCallback((transactions, categories) => {
        const categoryTotals = {};

        // Sum up spending by category
        transactions.forEach(transaction => {
            const categoryName = transaction.category?.name || 'Uncategorized';
            if (!categoryTotals[categoryName]) {
                categoryTotals[categoryName] = 0;
            }
            categoryTotals[categoryName] += parseFloat(transaction.amount) || 0;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        setSpendingByCategory({ labels, data });
    }, []);

    /**
     * Calculates carbon footprint by category
     *
     * @param {Array} transactions - Filtered transactions
     * @param {Array} categories - Available categories
     */
    const calculateCarbonByCategory = useCallback((transactions, categories) => {
        const categoryTotals = {};

        // Sum up carbon footprint by category
        transactions.forEach(transaction => {
            const categoryName = transaction.category?.name || 'Uncategorized';
            if (!categoryTotals[categoryName]) {
                categoryTotals[categoryName] = 0;
            }
            categoryTotals[categoryName] += parseFloat(transaction.carbonFootprint) || 0;
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        setCarbonByCategory({ labels, data });
    }, []);

    // Initial data fetch on component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Process data when transactions or time frame changes
    useEffect(() => {
        if (transactions.length > 0) {
            const filteredTransactions = processTransactionData(transactions, timeFrame);
            calculateBudgetAlerts(budgets, filteredTransactions);
            calculateSpendingByCategory(filteredTransactions, categories);
            calculateCarbonByCategory(filteredTransactions, categories);
        }
    }, [
        transactions,
        budgets,
        categories,
        timeFrame,
        processTransactionData,
        calculateBudgetAlerts,
        calculateSpendingByCategory,
        calculateCarbonByCategory
    ]);

    // Chart configurations
    const chartConfigs = {
        // Spending trend line chart configuration
        spending: {
            data: {
                labels: cumulativeData.map(data => data.formattedDate),
                datasets: [
                    {
                        label: 'Cumulative Spending (£)',
                        data: cumulativeData.map(data => data.cumulativeSum),
                        fill: true,
                        backgroundColor: 'rgba(75, 127, 126, 0.2)',
                        borderColor: 'rgba(75, 127, 126, 1)',
                        tension: 0.4
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `£${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [2, 4]
                        }
                    }
                }
            }
        },

        // Spending by category doughnut chart configuration
        spendingByCategory: {
            data: {
                labels: spendingByCategory.labels,
                datasets: [
                    {
                        data: spendingByCategory.data,
                        backgroundColor: spendingByCategory.labels.map((_, index) => {
                            const hue = (index * 137) % 360; // Golden ratio for nice color distribution
                            return `hsl(${hue}, 70%, 60%)`;
                        }),
                        borderWidth: 1
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `£${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        },

        // Carbon footprint by category doughnut chart configuration
        carbonByCategory: {
            data: {
                labels: carbonByCategory.labels,
                datasets: [
                    {
                        data: carbonByCategory.data,
                        backgroundColor: carbonByCategory.labels.map((_, index) => {
                            const hue = (index * 137 + 120) % 360; // Offset for different colors from spending chart
                            return `hsl(${hue}, 70%, 60%)`;
                        }),
                        borderWidth: 1
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${value} kg CO2 (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * Renders time frame selector buttons
     * @returns {JSX.Element} - Time frame selector component
     */
    const renderTimeFrameSelector = () => (
        <div className="dashboard-time-frame-selector mb-4">
            <div className="dashboard-btn-group">
                <button
                    className={`btn ${timeFrame === 'week' ? 'btn-eco-primary' : 'btn-eco-secondary'}`}
                    onClick={() => setTimeFrame('week')}
                >
                    <FaCalendarAlt className="me-2" /> Week
                </button>
                <button
                    className={`btn ${timeFrame === 'month' ? 'btn-eco-primary' : 'btn-eco-secondary'}`}
                    onClick={() => setTimeFrame('month')}
                >
                    <FaCalendarAlt className="me-2" /> Month
                </button>
                <button
                    className={`btn ${timeFrame === 'year' ? 'btn-eco-primary' : 'btn-eco-secondary'}`}
                    onClick={() => setTimeFrame('year')}
                >
                    <FaCalendarAlt className="me-2" /> Year
                </button>
            </div>
        </div>
    );

    /**
     * Renders summary cards with key metrics
     * @returns {JSX.Element} - Summary cards row
     */
    const renderSummaryCards = () => (
        <Row className="dashboard-summary-cards g-4 mb-4">
            {/* Total Spending Card */}
            <Col md={6} lg={3}>
                <div className="dashboard-summary-card dashboard-spending-summary">
                    <div className="dashboard-summary-icon">
                        <FaWallet />
                    </div>
                    <div className="dashboard-summary-content">
                        <h3>Total Spending</h3>
                        <div className="dashboard-summary-value">£{totalSpending}</div>
                        <div className="dashboard-summary-period">This {timeFrame}</div>
                    </div>
                </div>
            </Col>

            {/* Carbon Footprint Card */}
            <Col md={6} lg={3}>
                <div className="dashboard-summary-card dashboard-carbon-summary">
                    <div className="dashboard-summary-icon">
                        <FaLeaf />
                    </div>
                    <div className="dashboard-summary-content">
                        <h3>Carbon Footprint</h3>
                        <div className="dashboard-summary-value">{totalCarbonFootprint} kg</div>
                        <div className="dashboard-summary-period">This {timeFrame}</div>
                    </div>
                </div>
            </Col>

            {/* Budget Status Card */}
            <Col md={6} lg={3}>
                <div className="dashboard-summary-card dashboard-budget-summary">
                    <div className="dashboard-summary-icon">
                        <FaChartLine />
                    </div>
                    <div className="dashboard-summary-content">
                        <h3>Budget Status</h3>
                        <div className="dashboard-summary-value">
                            {budgetAlerts.length > 0 ?
                                `${budgetAlerts.length} Alert${budgetAlerts.length > 1 ? 's' : ''}` :
                                'On Track'}
                        </div>
                        <div className="dashboard-summary-period">Active budgets</div>
                    </div>
                </div>
            </Col>

            {/* Transactions Card */}
            <Col md={6} lg={3}>
                <div className="dashboard-summary-card dashboard-transaction-summary">
                    <div className="dashboard-summary-icon">
                        <FaExchangeAlt />
                    </div>
                    <div className="dashboard-summary-content">
                        <h3>Transactions</h3>
                        <div className="dashboard-summary-value">
                            {filterTransactions(transactions, timeFrame).length}
                        </div>
                        <div className="dashboard-summary-period">This {timeFrame}</div>
                    </div>
                </div>
            </Col>
        </Row>
    );

    /**
     * Renders spending trend chart and budget alerts section
     * @returns {JSX.Element} - Charts row
     */
    const renderChartRow = () => (
        <Row className="g-4 mb-4">
            {/* Spending Trend Chart */}
            <Col lg={8}>
                <div className="dashboard-card dashboard-spending-chart-card">
                    <h3 className="dashboard-chart-title">
                        <FaChartLine className="me-2" /> Spending Trend
                    </h3>
                    <div className="dashboard-chart-container">
                        <Line
                            data={chartConfigs.spending.data}
                            options={chartConfigs.spending.options}
                        />
                    </div>
                </div>
            </Col>

            {/* Budget Alerts */}
            <Col lg={4}>
                <div className="dashboard-card dashboard-alerts-card">
                    <h3 className="dashboard-chart-title">
                        <FaExclamationTriangle className="me-2" /> Budget Alerts
                    </h3>

                    {budgetAlerts.length === 0 ? (
                        <div className="dashboard-empty-alerts">
                            <div className="dashboard-empty-icon">👍</div>
                            <p>Great job! All your budgets are on track.</p>
                        </div>
                    ) : (
                        <div className="dashboard-alerts-list">
                            {budgetAlerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`dashboard-alert-item dashboard-severity-${alert.severity}`}
                                >
                                    <div className="dashboard-alert-icon">
                                        <FaExclamationTriangle />
                                    </div>
                                    <div className="dashboard-alert-content">
                                        <div className="dashboard-alert-message">{alert.message}</div>
                                        <div className="dashboard-alert-details">
                                            <div className="dashboard-progress-container">
                                                <div
                                                    className="dashboard-progress-bar"
                                                    style={{ width: `${Math.min(100, alert.percentUsed)}%` }}
                                                ></div>
                                            </div>
                                            <span className="dashboard-percentage">{alert.percentUsed.toFixed(1)}% used</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Link to="/budget" className="dashboard-view-all-link">
                                View all budgets
                            </Link>
                        </div>
                    )}
                </div>
            </Col>
        </Row>
    );

    /**
     * Renders category breakdown charts (spending and carbon footprint)
     * @returns {JSX.Element} - Category charts row
     */
    const renderCategoryChartsRow = () => (
        <Row className="g-4 mb-4">
            {/* Spending by Category Chart */}
            <Col md={6}>
                <div className="dashboard-card dashboard-category-chart-card">
                    <h3 className="dashboard-chart-title">
                        <FaChartPie className="me-2" /> Spending by Category
                    </h3>
                    <div className="dashboard-pie-chart-container">
                        {spendingByCategory.data.length > 0 ? (
                            <Doughnut
                                data={chartConfigs.spendingByCategory.data}
                                options={chartConfigs.spendingByCategory.options}
                            />
                        ) : (
                            <div className="dashboard-empty-chart">
                                <p>No spending data available for this period</p>
                            </div>
                        )}
                    </div>
                </div>
            </Col>

            {/* Carbon Footprint by Category Chart */}
            <Col md={6}>
                <div className="dashboard-card dashboard-carbon-chart-card">
                    <h3 className="dashboard-chart-title">
                        <FaLeaf className="me-2" /> Carbon Footprint by Category
                    </h3>
                    <div className="dashboard-pie-chart-container">
                        {carbonByCategory.data.length > 0 ? (
                            <Doughnut
                                data={chartConfigs.carbonByCategory.data}
                                options={chartConfigs.carbonByCategory.options}
                            />
                        ) : (
                            <div className="dashboard-empty-chart">
                                <p>No carbon footprint data available for this period</p>
                            </div>
                        )}
                    </div>
                </div>
            </Col>
        </Row>
    );

    /**
     * Renders recent transactions section
     * @returns {JSX.Element} - Recent transactions row
     */
    const renderRecentTransactionsRow = () => (
        <Row className="g-4 mb-4">
            <Col md={12}>
                <div className="dashboard-card dashboard-recent-transactions-card">
                    <h3 className="dashboard-chart-title">
                        <FaExchangeAlt className="me-2" /> Recent Transactions
                    </h3>

                    {recentTransactions.length === 0 ? (
                        <div className="dashboard-empty-transactions">
                            <p>No recent transactions found</p>
                        </div>
                    ) : (
                        <div className="dashboard-transactions-list">
                            {recentTransactions.map((transaction, index) => (
                                <div key={index} className="dashboard-transaction-item">
                                    <div className="dashboard-transaction-date">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </div>
                                    <div className="dashboard-transaction-category">
                                        {transaction.category?.name || 'Uncategorized'}
                                    </div>
                                    <div className="dashboard-transaction-description">
                                        {transaction.description || 'No description'}
                                    </div>
                                    <div className="dashboard-transaction-amount">
                                        £{parseFloat(transaction.amount).toFixed(2)}
                                    </div>
                                    <div className="dashboard-transaction-carbon">
                                        {transaction.carbonFootprint ? `${transaction.carbonFootprint} kg CO2` : 'N/A'}
                                    </div>
                                </div>
                            ))}
                            <Link to="/spending" className="dashboard-view-all-link">
                                View all transactions
                            </Link>
                        </div>
                    )}
                </div>
            </Col>
        </Row>
    );

    return (
        <Container className="dashboard-container">
            {/* Page Header */}
            <div className="dashboard-header text-center">
                <h2 className="dashboard-page-title">Dashboard</h2>
                <p className="dashboard-section-subtitle">Your financial and environmental overview at a glance</p>
            </div>

            {/* Time Frame Selector */}
            {renderTimeFrameSelector()}

            {/* Summary Cards */}
            {renderSummaryCards()}

            {/* Spending Chart and Budget Alerts */}
            {renderChartRow()}

            {/* Category Charts */}
            {renderCategoryChartsRow()}

            {/* Recent Transactions */}
            {renderRecentTransactionsRow()}
        </Container>
    );
};

export default Dashboard;