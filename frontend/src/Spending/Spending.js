import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import './Spending.css';

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
    const [isCategoryPopupVisible, setCategoryPopupVisible] = useState(false); // New state for category popup visibility
    const transactionTypes = ["Income", "Expense"];
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

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

    // Calculate the current balance
    const calculateBalance = () => {
        return transactions.reduce((acc, transaction) => {
            return transaction.type === "Income"
                ? acc + parseFloat(transaction.amount)
                : acc - parseFloat(transaction.amount);
        }, 0).toFixed(2); // Balance is rounded to 2 decimal places
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
                // Update existing transaction
                await axios.put(`/api/transaction/${newTransaction.id}`, transactionToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Add new transaction
                const response = await axios.post('/api/transaction', transactionToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransactions([...transactions, response.data]);
            }

            setNewTransaction({ amount: '', category: '', type: '', date: '', description: '' });
            setPopupVisible(false); // Close the popup
            fetchTransactions(); // Fetch all transactions again
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
            setCategoryPopupVisible(false); // Close the category popup after adding
            setPopupVisible(true); // Reopen the transaction popup
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({ ...newTransaction, [name]: value });
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

    return (
        <div className="spending-container">
            <div className="header">
                <h2>Your Spending</h2>
                <p>Track your income, expenses, and more with ease.</p>
                <div className={`balance ${balanceClass}`}>
                    <h3>Current Balance: £{currentBalance}</h3>
                </div>
            </div>

            <button
                onClick={handleAddTransactionClick}
                className="add-transaction-button"
            >
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
                                    <button onClick={() => handleEditTransaction(transaction)} className="edit-button">
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
    );
};

export default Spending;