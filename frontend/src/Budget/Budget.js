import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Budget.css';

const Budget = () => {
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({
        amount: '',
        category: null,
    });
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await axios.get('/api/categories', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchBudgets = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await axios.get('/api/budgets/user', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBudgets(response.data);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };

        fetchCategories();
        fetchBudgets();
    }, []);

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.amount) {
            setAlertMessage('Please select a category and enter an amount.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const budgetToSend = {
                amount: newBudget.amount,
                categoryId: newBudget.category.id, // Send only the category ID here
            };

            const response = await axios.post('/api/budgets/create', budgetToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBudgets([...budgets, response.data]);
            setNewBudget({
                amount: '',
                category: null,
            });
            setAlertMessage('');
        } catch (error) {
            console.error('Error adding budget:', error);
            setAlertMessage('Failed to add budget. Please try again.');
        }
    };

    return (
        <div className="container">
            <h2>Budget</h2>

            {/* Budget Form */}
            <div className="budget-form">
                <input
                    type="number"
                    placeholder="Amount"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                />

                {/* Category Dropdown */}
                <select
                    value={newBudget.category ? newBudget.category.id : ''}
                    onChange={(e) => {
                        const selectedCategory = categories.find(
                            (cat) => cat.id === parseInt(e.target.value)
                        );
                        setNewBudget({ ...newBudget, category: selectedCategory });
                    }}
                >
                    <option value="" disabled>
                        Select a category
                    </option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <button onClick={handleAddBudget}>Add Budget</button>

                {alertMessage && <div className="alert">{alertMessage}</div>}
            </div>

            {/* Display Budgets */}
            <div className="budgets-list">
                <h3>Your Budgets</h3>
                {budgets.length === 0 ? (
                    <p className="empty-state">No budgets found.</p>
                ) : (
                    <ul>
                        {budgets.map((budget) => (
                            <li key={budget.id}>
                                <p>Amount: {budget.amount}</p>
                                <p>Category: {budget.categoryName || 'No category'}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Budget;