import React, { useState, useEffect, useCallback } from 'react';
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
    const [hoveredTransactionId, setHoveredTransactionId] = useState(null); // New state for hovering
    const transactionTypes = ["Income", "Expense"];

    // Fetch transactions from the backend
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

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get('/api/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data); // Store full CategoryDTO objects
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to fetch categories. Please try again.');
        }
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            await Promise.all([fetchTransactions(), fetchCategories()]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }, [fetchTransactions, fetchCategories]);

    useEffect(() => {
        const loadData = async () => {
            await fetchData();
        };
        loadData();
    }, [fetchData]);

    // Handle adding a new transaction
    const handleAddTransaction = async () => {
        try {
            if (!newTransaction.amount || !newTransaction.category || !newTransaction.type || !newTransaction.date) {
                alert('Please fill in all required fields.');
                return;
            }

            if (!newTransaction.category.id) {
                alert('Please select a valid category.');
                return;
            }

            const token = localStorage.getItem('jwtToken');
            const transactionToSend = {
                ...newTransaction,
                category: { id: newTransaction.category.id }, // Ensure category is an object with an id
            };

            const response = await axios.post('/api/transaction', transactionToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Add the newly created transaction to the list
            setTransactions([...transactions, response.data]);

            // Reset the form
            setNewTransaction({
                amount: '',
                category: '',
                type: '',
                date: '',
                description: ''
            });
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Failed to add transaction. Please try again.');
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
            setCategories([...categories, response.data]); // Ensure you add the full category object
            setNewCategory('');
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction({ ...newTransaction, [name]: value });
    };

    return (
        <div className="spending-container">
            <h2>Spending</h2>
            <h2>Add a Transaction below</h2>

            {/* Form to Add a Transaction */}
            <div className="transaction-form">
                <input
                    type="number"
                    name="amount"
                    value={newTransaction.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                    className="input-field"
                />
                {/* Dropdown for Category Selection */}
                <select
                    name="category"
                    value={newTransaction.category ? newTransaction.category.id : ''}
                    onChange={(e) => {
                        const selectedCategory = categories.find(cat => cat.id === parseInt(e.target.value));
                        setNewTransaction({ ...newTransaction, category: selectedCategory });
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
                <button onClick={handleAddTransaction} className="submit-button">
                    Add Transaction
                </button>
            </div>

            {/* Form to Add a New Category */}
            <div className="category-form">
                <h3>Add a New Category</h3>
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category Name"
                    className="input-field"
                />
                <button onClick={handleAddCategory} className="submit-button">
                    Add Category
                </button>
            </div>

            {/* Display Transactions */}
            <div className="transaction-list">
                <h3>Your Transactions</h3>
                <ul>
                    {transactions.length === 0 ? (
                        <p>No transactions found.</p>
                    ) : (
                        transactions.map((transaction) => (
                            <li
                                key={transaction.id}
                                className="transaction-item"
                                onMouseEnter={() => setHoveredTransactionId(transaction.id)} // Set hover state
                                onMouseLeave={() => setHoveredTransactionId(null)} // Reset hover state
                            >
                                <div className="transaction-detail">
                                    <strong>Amount:</strong> {transaction.amount} <br />
                                    <strong>Category:</strong> {transaction.category.name} <br />
                                    <strong>Type:</strong> {transaction.type} <br />
                                    <strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()} <br />
                                    <strong>Description:</strong> {transaction.description} <br />
                                    <strong>Carbon Footprint:</strong> {transaction.carbonFootprint ?? 'Not Available'} kg CO2
                                    {/* Conditional message based on hover and ChatGPT-derived carbon footprint */}
                                    {hoveredTransactionId === transaction.id && transaction.isChatGPTDerivedCarbonFootprint !== undefined && (
                                        <p className="tooltip-message">
                                            {transaction.isChatGPTDerivedCarbonFootprint
                                                ? 'This carbon footprint was estimated using ChatGPT.'
                                                : 'This carbon footprint was not estimated using ChatGPT.'}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Spending;