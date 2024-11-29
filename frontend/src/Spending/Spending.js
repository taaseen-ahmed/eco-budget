import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Spending.css';

const Spending = () => {
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        category: '',
        type: '',
        date: '',
        description: ''
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            // Fetch the authenticated user's transactions
            const response = await axios.get('/api/transaction/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTransactions(response.data); // Set transactions to state
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleAddTransaction = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            // Send the new transaction with the appropriate details
            const response = await axios.post('/api/transaction', newTransaction, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Add the newly created transaction to the list
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

            <div className="transaction-form">
                <input
                    type="number"
                    name="amount"
                    value={newTransaction.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                    className="input-field"
                />
                <input
                    type="text"
                    name="category"
                    value={newTransaction.category}
                    onChange={handleChange}
                    placeholder="Category"
                    className="input-field"
                />
                <input
                    type="text"
                    name="type"
                    value={newTransaction.type}
                    onChange={handleChange}
                    placeholder="Type"
                    className="input-field"
                />
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