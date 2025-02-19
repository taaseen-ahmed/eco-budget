import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import './Budget.css';

const Budget = () => {
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [newBudget, setNewBudget] = useState({
        amount: '',
        category: null,
        startDate: '',
        endDate: ''
    });
    const [newGoal, setNewGoal] = useState({
        amount: '',
        category: null,
        startDate: '',
        endDate: ''
    });
    const [alertMessage, setAlertMessage] = useState('');
    const [isBudgetPopupVisible, setBudgetPopupVisible] = useState(false);
    const [isGoalPopupVisible, setGoalPopupVisible] = useState(false);
    const [isEditMode, setEditMode] = useState(false);
    const [currentBudgetId, setCurrentBudgetId] = useState(null);
    const [currentGoalId, setCurrentGoalId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

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

        const fetchGoals = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                const response = await axios.get('/api/goal/user', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGoals(response.data);
            } catch (error) {
                console.error('Error fetching goals:', error);
            }
        };

        fetchCategories().catch(console.error);
        fetchBudgets().catch(console.error);
        fetchGoals().catch(console.error);
    }, []);

    const handleAddBudgetClick = () => {
        setNewBudget({
            amount: '',
            category: null,
            startDate: '',
            endDate: ''
        });
        setEditMode(false);
        setBudgetPopupVisible(true);
    };

    const handleAddGoalClick = () => {
        setNewGoal({
            amount: '',
            category: null,
            startDate: '',
            endDate: ''
        });
        setEditMode(false);
        setGoalPopupVisible(true);
    };

    const handleEditBudgetClick = (budget) => {
        setNewBudget({
            amount: budget.amount,
            category: categories.find(cat => cat.id === budget.categoryId),
            startDate: budget.startDate.split('T')[0],
            endDate: budget.endDate.split('T')[0]
        });
        setCurrentBudgetId(budget.id);
        setEditMode(true);
        setBudgetPopupVisible(true);
    };

    const handleEditGoalClick = (goal) => {
        setNewGoal({
            amount: goal.amount,
            category: categories.find(cat => cat.id === goal.categoryId),
            startDate: goal.startDate.split('T')[0],
            endDate: goal.endDate.split('T')[0]
        });
        setCurrentGoalId(goal.id);
        setEditMode(true);
        setGoalPopupVisible(true);
    };

    const handleClosePopup = () => {
        setBudgetPopupVisible(false);
        setGoalPopupVisible(false);
    };

    const handleAddOrEditBudget = async () => {
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

            if (isEditMode) {
                await axios.put(`/api/budgets/${currentBudgetId}`, budgetToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBudgets(budgets.map(budget => budget.id === currentBudgetId ? { ...budget, ...budgetToSend } : budget));
            } else {
                const response = await axios.post('/api/budgets/create', budgetToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBudgets([...budgets, response.data]);
            }

            setNewBudget({
                amount: '',
                category: null,
                startDate: '',
                endDate: ''
            });
            setAlertMessage('');
            setBudgetPopupVisible(false);
        } catch (error) {
            console.error('Error adding or editing budget:', error);
            setAlertMessage('Failed to add or edit budget. Please try again.');
        }
    };

    const handleAddOrEditGoal = async () => {
        if (!newGoal.category || !newGoal.amount || !newGoal.startDate || !newGoal.endDate) {
            setAlertMessage('Please fill in all fields.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const goalToSend = {
                amount: newGoal.amount,
                categoryId: newGoal.category.id,
                startDate: `${newGoal.startDate}T00:00:00`,
                endDate: `${newGoal.endDate}T23:59:59`
            };

            if (isEditMode) {
                await axios.put(`/api/goal/${currentGoalId}`, goalToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGoals(goals.map(goal => goal.id === currentGoalId ? { ...goal, ...goalToSend } : goal));
            } else {
                const response = await axios.post('/api/goal/create', goalToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGoals([...goals, response.data]);
            }

            setNewGoal({
                amount: '',
                category: null,
                startDate: '',
                endDate: ''
            });
            setAlertMessage('');
            setGoalPopupVisible(false);
        } catch (error) {
            console.error('Error adding or editing goal:', error);
            setAlertMessage('Failed to add or edit goal. Please try again.');
        }
    };

    const handleDeleteBudget = async (budgetId) => {
        try {
            const token = localStorage.getItem('jwtToken');
            await axios.delete(`/api/budgets/${budgetId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBudgets(budgets.filter(budget => budget.id !== budgetId));
        } catch (error) {
            console.error('Error deleting budget:', error);
            setAlertMessage('Failed to delete budget. Please try again.');
        }
    };

    const handleDeleteGoal = async (goalId) => {
        try {
            const token = localStorage.getItem('jwtToken');
            await axios.delete(`/api/goal/${goalId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(goals.filter(goal => goal.id !== goalId));
        } catch (error) {
            console.error('Error deleting goal:', error);
            setAlertMessage('Failed to delete goal. Please try again.');
        }
    };

    const filteredBudgets = budgets.filter(budget => {
        const matchesSearchQuery = budget.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilterCategory = filterCategory ? budget.categoryId === parseInt(filterCategory) : true;
        return matchesSearchQuery && matchesFilterCategory;
    });

    const filteredGoals = goals.filter(goal => {
        const matchesSearchQuery = goal.categoryName ? goal.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const matchesFilterCategory = filterCategory ? goal.categoryId === parseInt(filterCategory) : true;
        return matchesSearchQuery && matchesFilterCategory;
    });

    const currentBudgets = filteredBudgets.filter(budget => new Date(budget.endDate) >= new Date());
    const pastBudgets = filteredBudgets.filter(budget => new Date(budget.endDate) < new Date());

    const BudgetList = ({ title, budgets }) => (
        <div className="budgets-list">
            <h3>{title}</h3>
            {budgets.length === 0 ? (
                <p className="empty-state">No {title.toLowerCase()} found.</p>
            ) : (
                <ul>
                    {budgets.map((budget) => (
                        <li key={budget.id} className="budget-item">
                            <div className="budget-detail">
                                <strong>Budget Amount:</strong> £{budget.amount} <br/>
                                <strong>Category:</strong> {budget.categoryName || 'No category'} <br/>
                                <strong>Total Spent:</strong> £{budget.totalSpent} <br/>
                                <strong>Period:</strong> {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()} <br/>
                                {budget.totalSpent > budget.amount && (
                                    <div className="budget-exceeded">Budget Exceeded!</div>
                                )}
                                <div className="progress-bar-container">
                                    <progress value={budget.totalSpent} max={budget.amount}></progress>
                                </div>
                            </div>
                            <div className="budget-actions">
                                <button onClick={() => handleEditBudgetClick(budget)} className="edit-button">
                                    <FaEdit/> Edit
                                </button>
                                <button onClick={() => handleDeleteBudget(budget.id)}
                                        className="delete-button">
                                    <FaTrash/> Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const GoalList = ({ title, goals }) => (
        <div className="goals-list">
            <h3>{title}</h3>
            {goals.length === 0 ? (
                <p className="empty-state">No {title.toLowerCase()} found.</p>
            ) : (
                <ul>
                    {goals.map((goal) => (
                        <li key={goal.id} className="goal-item">
                            <div className="goal-detail">
                                <strong>Carbon Footprint Goal:</strong> {goal.amount} kg CO2 <br/>
                                <strong>Category:</strong> {goal.categoryName || 'No category'} <br/>
                                <strong>Total Carbon Footprint:</strong> {goal.totalCarbonFootprint} kg CO2 <br/>
                                <strong>Period:</strong> {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()} <br/>
                                <div className="progress-bar-container">
                                    <progress value={goal.totalCarbonFootprint} max={goal.amount}></progress>
                                </div>
                            </div>
                            <div className="goal-actions">
                                <button onClick={() => handleEditGoalClick(goal)} className="edit-button">
                                    <FaEdit/> Edit
                                </button>
                                <button onClick={() => handleDeleteGoal(goal.id)}
                                        className="delete-button">
                                    <FaTrash/> Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="budget-container">
            <div className="header">
                <h2>Your Budget</h2>
                <p>Manage your budgets effectively by setting limits for different categories and tracking your spending.</p>
            </div>

            <button onClick={handleAddBudgetClick} className="add-budget-button">
                Add Budget
            </button>
            <button onClick={handleAddGoalClick} className="add-goal-button">
                Add Goal
            </button>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search budgets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-dropdown"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {isBudgetPopupVisible && (
                <div className="popup">
                    <div className="popup-card">
                        <h3 className="popup-title">{isEditMode ? 'Edit Budget' : 'Add a Budget'}</h3>
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
                                <button type="button" onClick={handleAddOrEditBudget} className="submit-button">
                                    {isEditMode ? 'Save Changes' : 'Add Budget'}
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

            {isGoalPopupVisible && (
                <div className="popup">
                    <div className="popup-card">
                        <h3 className="popup-title">{isEditMode ? 'Edit Goal' : 'Add a Goal'}</h3>
                        <form className="popup-form">
                            <input
                                type="number"
                                placeholder="Carbon Footprint Goal (kg CO2)"
                                value={newGoal.amount}
                                onChange={(e) => setNewGoal({ ...newGoal, amount: e.target.value })}
                                className="input-field"
                            />

                            <input
                                type="date"
                                placeholder="Start Date"
                                value={newGoal.startDate}
                                onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                                className="input-field"
                            />

                            <input
                                type="date"
                                placeholder="End Date"
                                value={newGoal.endDate}
                                onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                                className="input-field"
                            />

                            <select
                                value={newGoal.category ? newGoal.category.id : ''}
                                onChange={(e) => {
                                    const selectedCategory = categories.find(
                                        (cat) => cat.id === parseInt(e.target.value)
                                    );
                                    setNewGoal({ ...newGoal, category: selectedCategory });
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
                                <button type="button" onClick={handleAddOrEditGoal} className="submit-button">
                                    {isEditMode ? 'Save Changes' : 'Add Goal'}
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

            <div className="budget-goal-container">
                <div className="goals-section">
                    <GoalList title="Your Current Goals" goals={filteredGoals} />
                </div>
                <div className="budgets-section">
                    <BudgetList title="Your Current Budgets" budgets={currentBudgets} />
                    <BudgetList title="Past Budgets" budgets={pastBudgets} />
                </div>
            </div>
        </div>
    );
};

export default Budget;