import React, {useState, useEffect, useCallback} from 'react';
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
    const transactionTypes = ["Income", "Expense"];

    const fetchData = useCallback(async () => {
        try {
            await Promise.all([fetchTransactions(), fetchCategories()]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchTransactions = async () => {
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
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get('/api/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // If the backend returns objects with a 'name' property, you need to extract it
            setCategories(response.data.map(cat => cat.name));  // Extract category names if they're objects
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to fetch categories. Please try again.');
        }
    };

    const handleAddTransaction = async () => {
        try {
            if (!newTransaction.amount || !newTransaction.category || !newTransaction.type || !newTransaction.date) {
                alert('Please fill in all required fields.');
                return;
            }
            const token = localStorage.getItem('jwtToken');
            const response = await axios.post('/api/transaction', newTransaction, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions([...transactions, response.data]);
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
        if (categories.some((cat) => cat.toLowerCase() === newCategory.toLowerCase())) {
            alert('This category already exists.');
            return;
        }
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.post('/api/categories', { name: newCategory }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories([...categories, response.data.name]); // Ensure you add the category name directly
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
                    value={newTransaction.category}
                    onChange={handleChange}
                    className="input-field"
                >
                    <option value="" disabled>Select a category</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category} {/* Display category name */}
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
                            <li key={transaction.id} className="transaction-item">
                                <div className="transaction-detail">
                                    <strong>Amount:</strong> {transaction.amount} <br />
                                    <strong>Category:</strong> {transaction.category} <br />
                                    <strong>Type:</strong> {transaction.type} <br />
                                    <strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()} <br />
                                    <strong>Description:</strong> {transaction.description}
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