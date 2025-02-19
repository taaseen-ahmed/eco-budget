import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './Spending.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Spending = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        category: '',
        type: '',
        date: '',
        description: ''
    });
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isCategoryPopupVisible, setCategoryPopupVisible] = useState(false);
    const transactionTypes = ["Income", "Expense"];
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
    const [selectedCategory] = useState('All'); // New state for selected category
    const [cumulativeData, setCumulativeData] = useState([]);
    const [individualData, setIndividualData] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [sortOption, setSortOption] = useState('dateDesc');

    const resetNewTransaction = () => {
        setNewTransaction({
            amount: '',
            category: '',
            type: '',
            date: '',
            description: ''
        });
    };

    const handleAddTransactionClick = () => {
        resetNewTransaction();
        setPopupVisible(true);
    };

    const calculateBalance = () => {
        return transactions.reduce((acc, transaction) => {
            return transaction.type === "Income"
                ? acc + parseFloat(transaction.amount)
                : acc - parseFloat(transaction.amount);
        }, 0).toFixed(2);
    };

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
            const response = await axios.get('/api/recommendations/spending', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecommendations(response.data.spendingRecommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            alert('Failed to fetch recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            await Promise.all([fetchTransactions(), fetchCategories()]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }, [fetchTransactions, fetchCategories]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddTransaction = async () => {
        if (!newTransaction.amount || !newTransaction.category || !newTransaction.type || !newTransaction.date) {
            alert('Please fill in all required fields.');
            return;
        }
        if (!newTransaction.category.id) {
            alert('Please select a valid category.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const transactionToSend = {
                ...newTransaction,
                category: { id: newTransaction.category.id },
            };

            if (newTransaction.id) {
                await axios.put(`/api/transaction/${newTransaction.id}`, transactionToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                const response = await axios.post('/api/transaction', transactionToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransactions([...transactions, response.data]);
            }

            setNewTransaction({ amount: '', category: '', type: '', date: '', description: '' });
            setPopupVisible(false);
            fetchTransactions();
        } catch (error) {
            console.error('Error adding/updating transaction:', error);
            alert('Failed to add/update transaction. Please try again.');
        }
    };

    const handleEditTransaction = (transaction) => {
        setNewTransaction(transaction);
        setPopupVisible(true);
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                const token = localStorage.getItem('jwtToken');
                await axios.delete(`/api/transaction/${transactionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction. Please try again.');
            }
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            alert('Category name cannot be empty.');
            return;
        }
        if (categories.some((cat) => cat.name.toLowerCase() === newCategory.toLowerCase())) {
            alert('This category already exists.');
            return;
        }
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.post('/api/categories', { name: newCategory }, {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({ ...newTransaction, [name]: value });
    };

    const filterTransactionsByPeriod = (transactions, period, customStartDate, customEndDate) => {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'currentMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'last3Months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                endDate = now;
                break;
            case 'custom':
                startDate = new Date(customStartDate);
                endDate = new Date(customEndDate);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = now;
        }

        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    };

    const calculateCumulativeData = useCallback((transactions) => {
        const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod, customStartDate, customEndDate)
            .filter(transaction => transaction.type === "Expense" && (filterCategory === '' || transaction.category.name === filterCategory));
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
    }, [selectedPeriod, filterCategory, customStartDate, customEndDate]);

    useEffect(() => {
        calculateCumulativeData(transactions);
    }, [transactions, selectedPeriod, selectedCategory, customStartDate, customEndDate, calculateCumulativeData]);

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
        const matchesPeriod = filterTransactionsByPeriod([transaction], selectedPeriod, customStartDate, customEndDate).length > 0;
        return matchesSearchQuery && matchesFilterType && matchesFilterCategory && matchesCustomDate && matchesPeriod;
    });

    const sortedTransactions = filteredTransactions.sort((a, b) => {
        switch (sortOption) {
            case 'dateAsc':
                return new Date(a.date) - new Date(b.date);
            case 'dateDesc':
                return new Date(b.date) - new Date(a.date);
            case 'amountAsc':
                return parseFloat(a.amount) - parseFloat(b.amount);
            case 'amountDesc':
                return parseFloat(b.amount) - parseFloat(a.amount);
            case 'carbonAsc':
                return (a.carbonFootprint || 0) - (b.carbonFootprint || 0);
            case 'carbonDesc':
                return (b.carbonFootprint || 0) - (a.carbonFootprint || 0);
            default:
                return 0;
        }
    });

    const currentBalance = calculateBalance();
    const balanceClass = currentBalance < 0 ? 'negative-balance' : 'positive-balance';

    const calculateTotalExpense = (transactions) => {
        return transactions
            .filter(transaction => transaction.type === "Expense")
            .reduce((total, transaction) => total + parseFloat(transaction.amount), 0)
            .toFixed(2);
    };

    const filteredTransactionsByPeriod = filterTransactionsByPeriod(transactions, selectedPeriod);
    const totalExpense = calculateTotalExpense(filteredTransactionsByPeriod);

    const handleFilterButtonClick = () => {
        setFilterPopupVisible(true);
    };

    const calculateSpendingDistribution = (transactions) => {
        const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod, customStartDate, customEndDate)
            .filter(transaction => transaction.type === "Expense" && (selectedCategory === 'All' || transaction.category.name === selectedCategory));

        const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
            const category = transaction.category.name;
            acc[category] = (acc[category] || 0) + parseFloat(transaction.amount);
            return acc;
        }, {});

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: labels.map((_, index) => `hsl(${index * 360 / labels.length}, 70%, 50%)`),
            }],
        };
    };

    const spendingDistributionData = calculateSpendingDistribution(transactions);

    const pieChartOptions = {
        plugins: {
            legend: {
                display: false
            }
        }
    };

    return (
        <div className="spending-container">
            <div className="left-container">
                <div className="header">
                    <h2>Your Spending</h2>
                    <p>Track your income, expenses, and more with ease.</p>
                </div>

                <button onClick={handleAddTransactionClick} className="add-transaction-button">
                    Add Transaction
                </button>

                <div className="filters">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar"
                    />
                    <button onClick={handleFilterButtonClick} className="add-transaction-button">
                        Filter & Sort Transactions
                    </button>
                </div>

                <div className="transaction-list">
                    <h3>Your Transactions</h3>
                    {sortedTransactions.length === 0 ? (
                        <p className="no-transactions">No transactions found.</p>
                    ) : (
                        <ul>
                            {sortedTransactions.map((transaction) => (
                                <li key={transaction.id} className="transaction-item">
                                    <div className="transaction-detail">
                                        <div>
                                            <span className="detail-label">Amount</span>
                                            <span className={`amount-value ${transaction.type === 'expense' ? 'expense-amount' : 'income-amount'}`}>
                                {transaction.amount}
                            </span>
                                        </div>
                                        <div>
                                            <span className="detail-label">Category</span>
                                            <span className="category-badge">
                                {transaction.category.name}
                            </span>
                                        </div>
                                        <div>
                                            <span className="detail-label">Date</span>
                                            <span className="detail-value">
                                {new Date(transaction.date).toLocaleDateString()}
                            </span>
                                        </div>
                                        <div>
                                            <span className="detail-label">Description</span>
                                            <span className="detail-value">{transaction.description}</span>
                                        </div>
                                        {transaction.carbonFootprint !== null && (
                                            <div>
                                                <span className="detail-label">Carbon Footprint</span>
                                                <span className="carbon-footprint">
                                    {transaction.carbonFootprint} kg CO2
                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="transaction-actions">
                                        <button onClick={() => handleEditTransaction(transaction)}
                                                className="action-button edit-button">
                                            <FaEdit/> Edit
                                        </button>
                                        <button onClick={() => handleDeleteTransaction(transaction.id)}
                                                className="action-button delete-button">
                                            <FaTrash/> Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="right-container">
                <div className="balance-and-chart">
                    <div className={`balance ${balanceClass}`}>
                        <h3>Your Current Balance: £{currentBalance}</h3>
                    </div>

                    <div className="spending-chart">
                        <h3 className="chart-title">Cumulative Spending Over Time</h3>
                        <Line data={chartData} options={chartOptions} />
                    </div>

                    <div className="total-expense">
                        <h4>Total Expense for Selected Period: £{totalExpense}</h4>
                    </div>

                    <div className="spending-distribution-chart">
                        <h3>Your Spending Distribution</h3>
                        <div className="chart-and-labels-container">
                            <div className="chart-container">
                                <Pie data={spendingDistributionData} options={pieChartOptions} />
                            </div>
                            <div className="category-labels">
                                {spendingDistributionData.labels.map((label, index) => (
                                    <div key={index} className="category-label">
                                        <div className="category-color" style={{ backgroundColor: spendingDistributionData.datasets[0].backgroundColor[index] }}></div>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="recommendations">
                        <h4>Spending Recommendations</h4>
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
            </div>

            {isCategoryPopupVisible && (
                <div className="popup">
                    <div className="popup-card">
                        <h3 className="popup-title">Add a New Category</h3>
                        <form className="popup-form">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="New Category Name"
                                className="input-field"
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="submit-button"
                            >
                                Add Category
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategoryPopupVisible(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isPopupVisible && !isCategoryPopupVisible && (
                <div className="popup">
                    <div className="popup-card">
                        <h3 className="popup-title">Add a Transaction</h3>
                        <form className="popup-form">
                            <input
                                type="number"
                                name="amount"
                                value={newTransaction.amount}
                                onChange={handleChange}
                                placeholder="Amount"
                                className="input-field"
                            />
                            <select
                                name="category"
                                value={newTransaction.category ? newTransaction.category.id : ''}
                                onChange={(e) => {
                                    const selectedCategory = categories.find(
                                        (cat) => cat.id === parseInt(e.target.value)
                                    );
                                    setNewTransaction({...newTransaction, category: selectedCategory});
                                }}
                                className="input-field"
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
                                className="add-category-button"
                            >
                                Add a New Category
                            </button>
                            <select
                                name="type"
                                value={newTransaction.type}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="" disabled>Select a type</option>
                                {transactionTypes.map((type, index) => (
                                    <option key={index} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="datetime-local"
                                name="date"
                                value={newTransaction.date}
                                onChange={handleChange}
                                className="input-field"
                            />
                            <input
                                type="text"
                                name="description"
                                value={newTransaction.description}
                                onChange={handleChange}
                                placeholder="Description"
                                className="input-field"
                            />
                            <div className="popup-buttons">
                                <button type="button" onClick={handleAddTransaction} className="submit-button">
                                    {newTransaction.id ? 'Edit' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPopupVisible(false)}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isFilterPopupVisible && (
                <div className="popup">
                    <div className="popup-card">
                        <h3 className="popup-title">Filter & Sort Transactions</h3>
                        <form className="popup-form">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Types</option>
                                {transactionTypes.map((type, index) => (
                                    <option key={index} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="input-field"
                            >
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
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="input-field"
                            >
                                <option value="dateDesc">Most Recent</option>
                                <option value="dateAsc">Oldest First</option>
                                <option value="amountAsc">Amount Ascending</option>
                                <option value="amountDesc">Amount Descending</option>
                                <option value="carbonAsc">Carbon Footprint Ascending</option>
                                <option value="carbonDesc">Carbon Footprint Descending</option>
                            </select>
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

export default Spending;