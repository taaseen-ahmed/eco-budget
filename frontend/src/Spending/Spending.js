import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './Spending.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
    const [selectedCategory, setSelectedCategory] = useState('All'); // New state for selected category
    const [cumulativeData, setCumulativeData] = useState([]);
    const [individualData, setIndividualData] = useState([]);

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

    const filterTransactionsByPeriod = (transactions, period) => {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'currentMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            case 'last3Months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        return transactions.filter(transaction => new Date(transaction.date) >= startDate);
    };

    const calculateCumulativeData = useCallback((transactions) => {
        const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod)
            .filter(transaction => transaction.type === "Expense" && (selectedCategory === 'All' || transaction.category.name === selectedCategory));
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
    }, [selectedPeriod, selectedCategory]);

    useEffect(() => {
        calculateCumulativeData(transactions);
    }, [transactions, selectedPeriod, selectedCategory, calculateCumulativeData]);

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
        const matchesSearchQuery = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilterType = filterType ? transaction.type === filterType : true;
        const matchesFilterCategory = filterCategory ? transaction.category.name === filterCategory : true;
        return matchesSearchQuery && matchesFilterType && matchesFilterCategory;
    });

    // Sort the filtered transactions by date in descending order
    const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const currentBalance = calculateBalance();
    const balanceClass = currentBalance < 0 ? 'negative-balance' : 'positive-balance'; // Conditional class for balance

    const calculateTotalExpense = (transactions) => {
        return transactions
            .filter(transaction => transaction.type === "Expense")
            .reduce((total, transaction) => total + parseFloat(transaction.amount), 0)
            .toFixed(2);
    };

    const filteredTransactionsByPeriod = filterTransactionsByPeriod(transactions, selectedPeriod);
    const totalExpense = calculateTotalExpense(filteredTransactionsByPeriod);

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
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-dropdown"
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
                        className="filter-dropdown"
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="transaction-list">
                    <h3>Your Transactions</h3>
                    {sortedTransactions.length === 0 ? (
                        <p>No transactions found.</p>
                    ) : (
                        <ul>
                            {sortedTransactions.map((transaction) => (
                                <li key={transaction.id} className="transaction-item">
                                    <div className="transaction-detail">
                                        <strong>Amount:</strong> {transaction.amount} <br/>
                                        <strong>Category:</strong> {transaction.category.name} <br/>
                                        <strong>Type:</strong> {transaction.type} <br/>
                                        <strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()} <br/>
                                        <strong>Description:</strong> {transaction.description} <br/>
                                        <strong>Carbon Footprint:</strong>{' '}
                                        {transaction.carbonFootprint !== null && transaction.carbonFootprint !== undefined
                                            ? `${transaction.carbonFootprint} kg CO2`
                                            : 'Not Available'}
                                    </div>
                                    <div className="transaction-actions">
                                        <button onClick={() => handleEditTransaction(transaction)}
                                                className="edit-button">
                                            <FaEdit/> Edit
                                        </button>
                                        <button onClick={() => handleDeleteTransaction(transaction.id)}
                                                className="delete-button">
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
                        <h3>Current Balance: £{currentBalance}</h3>
                    </div>

                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="period-dropdown"
                    >
                        <option value="currentMonth">Current Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last3Months">Last 3 Months</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-dropdown"
                    >
                        <option value="All">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <div className="total-expense">
                        <h4>Total Expense for Selected Period: £{totalExpense}</h4>
                    </div>

                    <div className="spending-chart">
                        <Line data={chartData} options={chartOptions} />
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
        </div>
    );
};

export default Spending;