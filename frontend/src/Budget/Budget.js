import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
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
    const [isEditMode, setEditMode] = useState(false);
    const [currentBudgetId, setCurrentBudgetId] = useState(null);
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

        fetchCategories().catch(console.error);
        fetchBudgets().catch(console.error);
    }, []);

    const handleAddBudgetClick = () => {
        setNewBudget({
            amount: '',
            category: null,
            startDate: '',
            endDate: ''
        });
        setEditMode(false);
        setPopupVisible(true);
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
        setPopupVisible(true);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
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
            setPopupVisible(false);
        } catch (error) {
            console.error('Error adding or editing budget:', error);
            setAlertMessage('Failed to add or edit budget. Please try again.');
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

    const filteredBudgets = budgets.filter(budget => {
        const matchesSearchQuery = budget.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilterCategory = filterCategory ? budget.categoryId === parseInt(filterCategory) : true;
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

    return (
        <div className="budget-container">
            <div className="header">
                <h2>Your Budget</h2>
                <p>Manage your budgets effectively by setting limits for different categories and tracking your spending.</p>
            </div>

            <button onClick={handleAddBudgetClick} className="add-budget-button">
                Add Budget
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

            {isPopupVisible && (
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

            <BudgetList title="Your Current Budgets" budgets={currentBudgets} />
            <BudgetList title="Past Budgets" budgets={pastBudgets} />
        </div>
    );
};

export default Budget;