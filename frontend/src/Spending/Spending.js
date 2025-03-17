import React, { useState, useEffect, useCallback } from 'react';
import { FaFilter, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Row, Col } from 'react-bootstrap';
import './Spending.css';

// Register required ChartJS components
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, ArcElement
);

/**
 * Spending component
 * Provides transaction management, spending visualization and analysis
 */
const Spending = () => {
    // Constants
    const TOKEN_KEY = 'jwtToken';
    const API_ENDPOINTS = {
        transactions: '/api/transaction/user',
        categories: '/api/categories',
        transaction: '/api/transaction',
        recommendations: '/api/recommendations/spending'
    };
    const TRANSACTION_TYPES = ["Income", "Expense"];

    // State - General
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // State - Transaction management
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        category: '',
        type: '',
        date: '',
        description: ''
    });
    const [newCategory, setNewCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State - UI controls
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isCategoryPopupVisible, setCategoryPopupVisible] = useState(false);
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);

    // State - Filters and sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
    const [selectedCategory] = useState('All');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [sortOption, setSortOption] = useState('dateDesc');

    // State - Charts and data visualization
    const [cumulativeData, setCumulativeData] = useState([]);
    const [comparePreviousMonth, setComparePreviousMonth] = useState(false);
    const [previousMonthData, setPreviousMonthData] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    /**
     * Resets new transaction form to default values
     */
    const resetNewTransaction = () => {
        setNewTransaction({
            amount: '',
            category: '',
            type: '',
            date: '',
            description: ''
        });
    };

    /**
     * Shows the add transaction popup with reset form
     */
    const handleAddTransactionClick = () => {
        resetNewTransaction();
        setPopupVisible(true);
    };

    /**
     * Calculates current balance from all transactions
     * @returns {string} Formatted balance amount
     */
    const calculateBalance = () => {
        return transactions.reduce((acc, transaction) => {
            return transaction.type === "Income"
                ? acc + parseFloat(transaction.amount)
                : acc - parseFloat(transaction.amount);
        }, 0).toFixed(2);
    };

    /**
     * Calculates total expenses for the given transactions
     * @param {Array} transactions - Transactions to calculate from
     * @returns {string} Formatted total expense amount
     */
    const calculateTotalExpense = (transactions) => {
        return transactions
            .filter(transaction => transaction.type === "Expense")
            .reduce((total, transaction) => total + parseFloat(transaction.amount), 0)
            .toFixed(2);
    };

    /**
     * Fetches user transactions from API
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
     * Fetches spending recommendations from API
     */
    const fetchRecommendations = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.recommendations, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecommendations(response.data.spendingRecommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            alert('Failed to fetch recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [API_ENDPOINTS.recommendations]);

    /**
     * Fetches all required data from APIs in parallel
     */
    const fetchData = useCallback(async () => {
        try {
            await Promise.all([fetchTransactions(), fetchCategories()]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }, [fetchTransactions, fetchCategories]);

    /**
     * Adds or updates a transaction
     */
    const handleAddTransaction = async () => {
        // Validate form fields
        if (!newTransaction.amount || !newTransaction.category || !newTransaction.type || !newTransaction.date) {
            alert('Please fill in all required fields.');
            return;
        }
        if (!newTransaction.category.id) {
            alert('Please select a valid category.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const transactionToSend = {
                ...newTransaction,
                category: { id: newTransaction.category.id },
            };

            if (newTransaction.id) {
                // Update existing transaction
                await axios.put(`${API_ENDPOINTS.transaction}/${newTransaction.id}`, transactionToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Create new transaction
                const response = await axios.post(API_ENDPOINTS.transaction, transactionToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransactions([...transactions, response.data]);
            }

            resetNewTransaction();
            setPopupVisible(false);
            fetchTransactions();
        } catch (error) {
            console.error('Error adding/updating transaction:', error);
            alert('Failed to add/update transaction. Please try again.');
        } finally {
            setIsSubmitting(false); // Reset loading state regardless of outcome
        }
    };

    /**
     * Prepares transaction for editing
     * @param {Object} transaction - Transaction to edit
     */
    const handleEditTransaction = (transaction) => {
        setNewTransaction(transaction);
        setPopupVisible(true);
    };

    /**
     * Deletes a transaction after confirmation
     * @param {number} transactionId - ID of transaction to delete
     */
    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                const token = localStorage.getItem(TOKEN_KEY);
                await axios.delete(`${API_ENDPOINTS.transaction}/${transactionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction. Please try again.');
            }
        }
    };

    /**
     * Adds a new category
     */
    const handleAddCategory = async () => {
        // Validate category name
        if (!newCategory.trim()) {
            alert('Category name cannot be empty.');
            return;
        }
        if (categories.some((cat) => cat.name.toLowerCase() === newCategory.toLowerCase())) {
            alert('This category already exists.');
            return;
        }

        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.post(API_ENDPOINTS.categories, { name: newCategory }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories([...categories, response.data]);
            setNewCategory('');
            setCategoryPopupVisible(false);
            setPopupVisible(true);
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category. Please try again.');
        }
    };

    /**
     * Updates transaction form field values
     * @param {Object} e - Change event object
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction(prevState => ({ ...prevState, [name]: value }));
    };

    /**
     * Filters transactions based on selected time period
     * @param {Array} transactions - Transactions to filter
     * @param {string} period - Time period to filter by
     * @param {string} startDate - Custom start date (optional)
     * @param {string} endDate - Custom end date (optional)
     * @returns {Array} Filtered transactions
     */
    const filterTransactionsByPeriod = useCallback((transactions, period, startDate, endDate) => {
        const now = new Date();
        let startDateFilter, endDateFilter;

        // Determine date range based on selected period
        switch(period) {
            case 'week':
                startDateFilter = new Date(now);
                startDateFilter.setDate(now.getDate() - 7);
                break;
            case 'lastMonth':
                startDateFilter = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDateFilter = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'last3Months':
                startDateFilter = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                endDateFilter = now;
                break;
            case 'custom':
                startDateFilter = new Date(startDate);
                endDateFilter = new Date(endDate);
                break;
            case 'currentMonth':
            default:
                startDateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
                endDateFilter = now;
        }

        // Filter transactions by date range
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDateFilter && transactionDate <= endDateFilter;
        });
    }, []);

    /**
     * Calculates cumulative spending data for charts
     * @param {Array} transactions - Transactions to process
     * @param {string} period - Time period to filter by
     * @param {string} customStartDate - Custom start date (optional)
     * @param {string} customEndDate - Custom end date (optional)
     */
    const calculateCumulativeData = useCallback((transactions, period, customStartDate, customEndDate) => {
        if (period === 'currentMonth' && comparePreviousMonth) {
            // For month comparison mode

            // Calculate current month data
            const currentMonthTransactions = filterTransactionsByPeriod(
                transactions.filter(t => t.type === "Expense"),
                'currentMonth'
            );

            // Calculate previous month data
            const previousMonthTransactions = filterTransactionsByPeriod(
                transactions.filter(t => t.type === "Expense"),
                'lastMonth'
            );

            // Process current month data
            let currentCumulativeSum = 0;
            const currentData = currentMonthTransactions
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(transaction => {
                    const amount = parseFloat(transaction.amount) || 0;
                    currentCumulativeSum += amount;
                    return {
                        day: new Date(transaction.date).getDate(),
                        cumulativeSum: currentCumulativeSum,
                        amount
                    };
                });

            // Process previous month data
            let prevCumulativeSum = 0;
            const prevData = previousMonthTransactions
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(transaction => {
                    const amount = parseFloat(transaction.amount) || 0;
                    prevCumulativeSum += amount;
                    return {
                        day: new Date(transaction.date).getDate(),
                        cumulativeSum: prevCumulativeSum,
                        amount
                    };
                });

            setCumulativeData(currentData);
            setPreviousMonthData(prevData);
        } else {
            // For standard view (non-comparison mode)

            // Filter transactions by period and category
            const filteredTransactions = filterTransactionsByPeriod(transactions, period, customStartDate, customEndDate)
                .filter(transaction =>
                    transaction.type === "Expense" &&
                    (filterCategory === '' || transaction.category.name === filterCategory)
                );

            // Calculate cumulative spending
            let cumulativeSum = 0;
            const cumulative = filteredTransactions
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(transaction => {
                    const amount = parseFloat(transaction.amount) || 0;
                    cumulativeSum += amount;
                    return {
                        date: transaction.date,
                        cumulativeSum,
                        amount
                    };
                });

            setCumulativeData(cumulative);
            setPreviousMonthData([]);
        }
    }, [filterTransactionsByPeriod, filterCategory, comparePreviousMonth]);

    /**
     * Calculates spending distribution by category for pie chart
     * @param {Array} transactions - Transactions to analyze
     * @returns {Object} Chart data for the pie chart
     */
    const calculateSpendingDistribution = (transactions) => {
        // Filter transactions by period and category
        const filteredTransactions = filterTransactionsByPeriod(
            transactions,
            selectedPeriod,
            customStartDate,
            customEndDate
        ).filter(
            transaction => transaction.type === "Expense" &&
                (selectedCategory === 'All' || transaction.category.name === selectedCategory)
        );

        // Sum expenses by category
        const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
            const category = transaction.category.name;
            acc[category] = (acc[category] || 0) + parseFloat(transaction.amount);
            return acc;
        }, {});

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        // Return data formatted for Chart.js with updated color scheme
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: labels.map((_, index) => {
                    const hue = (index * 137) % 360; // Golden ratio for nice color distribution
                    return `hsl(${hue}, 70%, 60%)`;
                }),
                borderWidth: 1
            }],
        };
    };

    /**
     * Shows the filter popup
     */
    const handleFilterButtonClick = () => {
        setFilterPopupVisible(true);
    };

    // Initial data fetch on component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Process data when transactions or time frame changes
    useEffect(() => {
        calculateCumulativeData(transactions, selectedPeriod, customStartDate, customEndDate);
    }, [
        transactions,
        selectedPeriod,
        selectedCategory,
        customStartDate,
        customEndDate,
        comparePreviousMonth,
        calculateCumulativeData
    ]);

    // Filter transactions based on search query and filters
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearchQuery =
            transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.amount.toString().includes(searchQuery) ||
            transaction.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            new Date(transaction.date).toLocaleDateString().includes(searchQuery);
        const matchesFilterType = filterType ? transaction.type === filterType : true;
        const matchesFilterCategory = filterCategory === '' || transaction.category.name === filterCategory;
        const matchesCustomDate =
            (!customStartDate || new Date(transaction.date) >= new Date(customStartDate)) &&
            (!customEndDate || new Date(transaction.date) <= new Date(customEndDate));
        const matchesPeriod = filterTransactionsByPeriod(
            [transaction],
            selectedPeriod,
            customStartDate,
            customEndDate
        ).length > 0;

        return matchesSearchQuery && matchesFilterType && matchesFilterCategory &&
            matchesCustomDate && matchesPeriod;
    });

    // Sort filtered transactions based on selected sort option
    const sortedTransactions = filteredTransactions.sort((a, b) => {
        switch (sortOption) {
            case 'dateAsc':
                return new Date(a.date) - new Date(b.date);
            case 'amountAsc':
                return parseFloat(a.amount) - parseFloat(b.amount);
            case 'amountDesc':
                return parseFloat(b.amount) - parseFloat(a.amount);
            case 'carbonAsc':
                return (a.carbonFootprint || 0) - (b.carbonFootprint || 0);
            case 'carbonDesc':
                return (b.carbonFootprint || 0) - (a.carbonFootprint || 0);
            case 'dateDesc':
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    // Calculate metrics and prepare chart data
    const currentBalance = calculateBalance();
    const balanceClass = currentBalance < 0 ? 'negative-balance' : 'positive-balance';
    const filteredTransactionsByPeriod = filterTransactionsByPeriod(transactions, selectedPeriod);
    const totalExpense = calculateTotalExpense(filteredTransactionsByPeriod);
    const spendingDistributionData = calculateSpendingDistribution(transactions);

    // Chart configurations
    const chartConfig = {
        line: {
            data: {
                labels: comparePreviousMonth
                    ? Array.from({ length: 31 }, (_, i) => i + 1)
                    : cumulativeData.map(data => new Date(data.date).toLocaleDateString()),
                datasets: [
                    {
                        label: comparePreviousMonth ? 'Current Month Spending' : 'Cumulative Spending (£)',
                        data: comparePreviousMonth
                            ? cumulativeData.map(data => ({ x: data.day, y: data.cumulativeSum, amount: data.amount }))
                            : cumulativeData.map(data => data.cumulativeSum),
                        fill: false,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        borderColor: 'rgba(75,192,192,1)',
                    },
                    comparePreviousMonth && {
                        label: 'Previous Month Spending',
                        data: previousMonthData.map(data => ({ x: data.day, y: data.cumulativeSum, amount: data.amount })),
                        fill: false,
                        backgroundColor: 'rgba(255,99,132,0.4)',
                        borderColor: 'rgba(255,99,132,1)',
                    }
                ].filter(Boolean),
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (comparePreviousMonth) {
                                    const amount = (context.raw.amount || 0).toFixed(2);
                                    const cumulative = (context.raw.y || 0).toFixed(2);
                                    return `Daily: £${amount}\nCumulative: £${cumulative}`;
                                }
                                return `£${context.raw.toFixed(2)}`;
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
                        type: 'category',
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cumulative Spending (£)',
                        },
                    },
                },
            }
        },
        doughnut: {
            data: spendingDistributionData,
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
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `£${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * Renders the left section with transaction list
     * @returns {JSX.Element} - Left section component
     */
    const renderLeftSection = () => (
        <Col lg={5}>
            <div className="left-section eco-card">
                <div className="section-header">
                    <h2 className="page-title">Your Spending</h2>
                    <p className="section-subtitle">Track your income, expenses, and more with ease.</p>
                </div>

                {/* Action buttons */}
                <div className="action-buttons">
                    <button onClick={handleAddTransactionClick} className="btn-eco-primary">
                        <span className="btn-icon">+</span> Add Transaction
                    </button>
                </div>

                {/* Search and filter */}
                <div className="filters-container">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <button onClick={handleFilterButtonClick} className="btn-eco-secondary">
                        <FaFilter className="me-2" /> Filter & Sort
                    </button>
                </div>

                {/* Transaction list */}
                <div className="transaction-list-container">
                    <h3 className="list-title">Your Transactions</h3>
                    {sortedTransactions.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <p>No transactions found.</p>
                            <p className="empty-hint">Add your first transaction to get started!</p>
                        </div>
                    ) : (
                        <ul className="transaction-list">
                            {sortedTransactions.map((transaction) => (
                                <li key={transaction.id} className="transaction-item eco-card">
                                    <div className="transaction-header">
                    <span className={`transaction-badge ${transaction.type.toLowerCase() === 'expense' ? 'expense-badge' : 'income-badge'}`}>
                      {transaction.type.toLowerCase() === 'expense' ? 'Expense' : 'Income'}
                    </span>
                                        <span className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                                    </div>

                                    <div className="transaction-body">
                                        <div className="transaction-amount-container">
                      <span className={`transaction-amount ${transaction.type.toLowerCase() === 'expense' ? 'normal-amount' : 'income-amount'}`}>
                        {transaction.type.toLowerCase() === 'expense' ? '' : '+'} £{transaction.amount}
                      </span>
                                        </div>

                                        <div className="transaction-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Category:</span>
                                                <span className="category-badge">
                          {transaction.category.name}
                        </span>
                                            </div>

                                            {transaction.description && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Description:</span>
                                                    <span className="detail-value">{transaction.description}</span>
                                                </div>
                                            )}

                                            {transaction.carbonFootprint !== null && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Carbon:</span>
                                                    <span className="carbon-badge">
                            {transaction.carbonFootprint} kg CO<sub>2</sub>
                          </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="transaction-actions">
                                        <button
                                            onClick={() => handleEditTransaction(transaction)}
                                            className="action-button edit-button"
                                            aria-label="Edit transaction"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                            className="action-button delete-button"
                                            aria-label="Delete transaction"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Col>
    );

    /**
     * Renders the right section with charts and analytics
     * @returns {JSX.Element} - Right section component
     */
    const renderRightSection = () => (
        <Col lg={7}>
            <div className="right-section">
                {/* Balance card */}
                <div className="balance-card eco-card">
                    <div className={`balance-amount ${balanceClass}`}>
                        <h3>Your Current Balance</h3>
                        <span className="balance-value">£{currentBalance}</span>
                    </div>

                    {selectedPeriod === 'currentMonth' && (
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
                    )}
                </div>

                {/* Spending chart */}
                <div className="spending-chart eco-card">
                    <h3 className="chart-title">Cumulative Spending Over Time</h3>
                    <div className="chart-container">
                        <Line
                            data={chartConfig.line.data}
                            options={chartConfig.line.options}
                        />
                    </div>
                    <div className="total-expense">
                        <span>Total Expense for Selected Period:</span>
                        <span className="expense-value">£{totalExpense}</span>
                    </div>
                </div>

                {/* Distribution chart */}
                <div className="distribution-chart eco-card">
                    <h3 className="chart-title">Your Spending Distribution</h3>
                    <div className="doughnut-chart-container">
                        <Doughnut
                            data={chartConfig.doughnut.data}
                            options={chartConfig.doughnut.options}
                        />
                    </div>
                </div>

                {/* Recommendations */}
                <div className="recommendations eco-card">
                    <div className="recommendations-header">
                        <h3 className="chart-title">Spending Recommendations</h3>
                        <button
                            onClick={fetchRecommendations}
                            className="btn-eco-secondary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-container">
                  <span className="spinner"></span>
                </span>
                            ) : (
                                recommendations.length === 0 ? 'Generate Recommendations' : 'Regenerate'
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
                            {loading ? (
                                <p>Generating personalized recommendations...</p>
                            ) : (
                                <p>Generate recommendations based on your spending patterns.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Col>
    );

    /**
     * Renders the category popup
     * @returns {JSX.Element|null} - Category popup or null if not visible
     */
    const renderCategoryPopup = () => {
        if (!isCategoryPopupVisible) return null;

        return (
            <div className="popup-overlay">
                <div className="popup-container eco-card">
                    <div className="popup-header">
                        <h3>Add a New Category</h3>
                        <button
                            className="close-button"
                            onClick={() => setCategoryPopupVisible(false)}
                            aria-label="Close popup"
                        >
                            ×
                        </button>
                    </div>
                    <div className="popup-body">
                        <form className="category-form">
                            <div className="form-group">
                                <label htmlFor="categoryName">Category Name</label>
                                <input
                                    type="text"
                                    id="categoryName"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Enter category name"
                                    className="form-control"
                                />
                            </div>

                            <div className="popup-actions">
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="btn-eco-primary"
                                >
                                    Add Category
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoryPopupVisible(false)}
                                    className="btn-eco-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the transaction popup
     * @returns {JSX.Element|null} - Transaction popup or null if not visible
     */
    /**
     * Renders the transaction popup
     * @returns {JSX.Element|null} - Transaction popup or null if not visible
     */
    const renderTransactionPopup = () => {
        if (!isPopupVisible || isCategoryPopupVisible) return null;

        return (
            <div className="popup-overlay">
                <div className="popup-container transaction-popup eco-card">
                    <div className="popup-header">
                        <h3>{newTransaction.id ? 'Edit Transaction' : 'Add a Transaction'}</h3>
                        <button
                            className="close-button"
                            onClick={() => setPopupVisible(false)}
                            aria-label="Close popup"
                        >
                            ×
                        </button>
                    </div>
                    <div className="popup-body">
                        <form className="transaction-form">
                            <Row>
                                <Col md={6}>
                                    <div className="form-group">
                                        <label htmlFor="transactionAmount">Amount</label>
                                        <input
                                            type="number"
                                            id="transactionAmount"
                                            name="amount"
                                            value={newTransaction.amount}
                                            onChange={handleChange}
                                            placeholder="Enter amount"
                                            className="form-control"
                                        />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="form-group">
                                        <label htmlFor="transactionType">Type</label>
                                        <select
                                            id="transactionType"
                                            name="type"
                                            value={newTransaction.type}
                                            onChange={handleChange}
                                            className="form-control"
                                        >
                                            <option value="" disabled>Select type</option>
                                            {TRANSACTION_TYPES.map((type, index) => (
                                                <option key={index} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </Col>
                            </Row>

                            <div className="form-group">
                                <label htmlFor="transactionCategory">Category</label>
                                <div className="category-selection">
                                    <select
                                        id="transactionCategory"
                                        name="category"
                                        value={newTransaction.category ? newTransaction.category.id : ''}
                                        onChange={(e) => {
                                            const selectedCategory = categories.find(
                                                (cat) => cat.id === parseInt(e.target.value)
                                            );
                                            setNewTransaction({...newTransaction, category: selectedCategory});
                                        }}
                                        className="form-control"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setCategoryPopupVisible(true)}
                                        className="add-category-btn"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="transactionDate">Date</label>
                                <input
                                    type="datetime-local"
                                    id="transactionDate"
                                    name="date"
                                    value={newTransaction.date}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="transactionDescription">Description</label>
                                <input
                                    type="text"
                                    id="transactionDescription"
                                    name="description"
                                    value={newTransaction.description}
                                    onChange={handleChange}
                                    placeholder="Enter description"
                                    className="form-control"
                                />
                            </div>

                            <div className="popup-actions">
                                <button
                                    type="button"
                                    onClick={handleAddTransaction}
                                    className="btn-eco-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="spinner-container">
                                            <span className="spinner"></span>
                                        </span>
                                    ) : (
                                        newTransaction.id ? 'Save Changes' : 'Add Transaction'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the filter popup
     * @returns {JSX.Element|null} - Filter popup or null if not visible
     */
    /**
     * Renders the filter popup
     * @returns {JSX.Element|null} - Filter popup or null if not visible
     */
    const renderFilterPopup = () => {
        if (!isFilterPopupVisible) return null;

        return (
            <div className="popup-overlay">
                <div className="popup-container filter-popup eco-card">
                    <div className="popup-header">
                        <h3>Filter & Sort Transactions</h3>
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
                                <label htmlFor="filterType">Transaction Type</label>
                                <select
                                    id="filterType"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="">All Types</option>
                                    {TRANSACTION_TYPES.map((type, index) => (
                                        <option key={index} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="filterCategory">Category</label>
                                <select
                                    id="filterCategory"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
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

                            <div className="form-group">
                                <label htmlFor="sortOption">Sort By</label>
                                <select
                                    id="sortOption"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="dateDesc">Most Recent</option>
                                    <option value="dateAsc">Oldest First</option>
                                    <option value="amountAsc">Amount (Low to High)</option>
                                    <option value="amountDesc">Amount (High to Low)</option>
                                    <option value="carbonAsc">Carbon Footprint (Low to High)</option>
                                    <option value="carbonDesc">Carbon Footprint (High to Low)</option>
                                </select>
                            </div>

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
                                        setFilterType('');
                                        setFilterCategory('');
                                        setSelectedPeriod('currentMonth');
                                        setSortOption('dateDesc');
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
        <div className="spending-container">
            <Row className="g-4">
                {/* Left section with transaction list */}
                {renderLeftSection()}

                {/* Right section with charts and analytics */}
                {renderRightSection()}
            </Row>

            {/* Popups */}
            {renderCategoryPopup()}
            {renderTransactionPopup()}
            {renderFilterPopup()}
        </div>
    );
};

export default Spending;