import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Budget.css';

const Budget = () => {
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({
        amount: '',
        category: null,
        startDate: '',
        endDate: ''
    });
    const [alertMessage, setAlertMessage] = useState('');
    const [isPopupVisible, setPopupVisible] = useState(false);

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

    const handleAddBudgetClick = () => {
        setPopupVisible(true);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.amount || !newBudget.startDate || !newBudget.endDate) {
            setAlertMessage('Please fill in all fields.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const budgetToSend = {
                amount: newBudget.amount,
                categoryId: newBudget.category.id,
                startDate: `${newBudget.startDate}T00:00:00`,
                endDate: `${newBudget.endDate}T23:59:59`
            };

            const response = await axios.post('/api/budgets/create', budgetToSend, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBudgets([...budgets, response.data]);
            setNewBudget({
                amount: '',
                category: null,
                startDate: '',
                endDate: ''
            });
            setAlertMessage('');
            setPopupVisible(false);
        } catch (error) {
            console.error('Error adding budget:', error);
            setAlertMessage('Failed to add budget. Please try again.');
        }
    };

    const getChartData = (budget) => {
        return {
            labels: ['Used', 'Remaining'],
            datasets: [
                {
                    data: [budget.totalSpent, budget.amount - budget.totalSpent],
                    backgroundColor: ['#FF6384', '#36A2EB'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB']
                }
            ]
        };
    };

    return (
        <div className="budget-container">
            <div className="header">
                <h2>Your Budget</h2>
                <p>Manage your budgets effectively by setting limits for different categories and tracking your spending.</p>
            </div>

            <button onClick={handleAddBudgetClick} className="add-budget-button">
                Add Budget
            </button>

            {isPopupVisible && (
                <div className="popup">
                    <div className="popup-card">
                        <h3 className="popup-title">Add a Budget</h3>
                        <form className="popup-form">
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newBudget.amount}
                                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                className="input-field"
                            />

                            <input
                                type="date"
                                placeholder="Start Date"
                                value={newBudget.startDate}
                                onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                                className="input-field"
                            />

                            <input
                                type="date"
                                placeholder="End Date"
                                value={newBudget.endDate}
                                onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                                className="input-field"
                            />

                            <select
                                value={newBudget.category ? newBudget.category.id : ''}
                                onChange={(e) => {
                                    const selectedCategory = categories.find(
                                        (cat) => cat.id === parseInt(e.target.value)
                                    );
                                    setNewBudget({ ...newBudget, category: selectedCategory });
                                }}
                                className="input-field"
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

                            <div className="popup-buttons">
                                <button type="button" onClick={handleAddBudget} className="submit-button">
                                    Add Budget
                                </button>
                                <button type="button" onClick={handleClosePopup} className="cancel-button">
                                    Cancel
                                </button>
                            </div>

                            {alertMessage && <div className="alert">{alertMessage}</div>}
                        </form>
                    </div>
                </div>
            )}

            <div className="budgets-list">
                <h3>Your Budgets</h3>
                {budgets.length === 0 ? (
                    <p className="empty-state">No budgets found.</p>
                ) : (
                    <ul>
                        {budgets.map((budget) => (
                            <li key={budget.id} className="budget-item">
                                <div className="budget-detail">
                                    <strong>Amount:</strong> £{budget.amount} <br/>
                                    <strong>Category:</strong> {budget.categoryName || 'No category'} <br/>
                                    <strong>Total Spent:</strong> £{budget.totalSpent} <br/>
                                </div>
                                <div className="pie-chart-container">
                                    <Pie data={getChartData(budget)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Budget;