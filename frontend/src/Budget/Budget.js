import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaLeaf, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import './Budget.css';

/**
 * Budget component
 * Manages user's spending budgets and carbon footprint goals
 */
const Budget = () => {
    // Constants
    const TOKEN_KEY = 'jwtToken';
    const API_ENDPOINTS = {
        categories: '/api/categories',
        budgets: '/api/budgets/user',
        createBudget: '/api/budgets/create',
        budget: '/api/budgets',
        goals: '/api/goal/user',
        createGoal: '/api/goal/create',
        goal: '/api/goal'
    };

    // State - Data
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);

    // State - Forms
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

    // State - UI
    const [alertMessage, setAlertMessage] = useState('');
    const [isBudgetPopupVisible, setBudgetPopupVisible] = useState(false);
    const [isGoalPopupVisible, setGoalPopupVisible] = useState(false);
    const [isEditMode, setEditMode] = useState(false);
    const [currentBudgetId, setCurrentBudgetId] = useState(null);
    const [currentGoalId, setCurrentGoalId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    /**
     * Fetches categories from API
     */
    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.categories, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, [API_ENDPOINTS.categories]);

    /**
     * Fetches budgets from API
     */
    const fetchBudgets = useCallback(async () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.budgets, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    }, [API_ENDPOINTS.budgets]);

    /**
     * Fetches goals from API
     */
    const fetchGoals = useCallback(async () => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(API_ENDPOINTS.goals, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(response.data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    }, [API_ENDPOINTS.goals]);

    /**
     * Fetch all initial data
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchCategories(),
                    fetchBudgets(),
                    fetchGoals()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        fetchData();
    }, [fetchCategories, fetchBudgets, fetchGoals]);

    /**
     * Opens the add budget popup with empty form
     */
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

    /**
     * Opens the add goal popup with empty form
     */
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

    /**
     * Opens the edit budget popup with budget data
     * @param {Object} budget - Budget to edit
     */
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

    /**
     * Opens the edit goal popup with goal data
     * @param {Object} goal - Goal to edit
     */
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

    /**
     * Closes any open popup
     */
    const handleClosePopup = () => {
        setBudgetPopupVisible(false);
        setGoalPopupVisible(false);
        setAlertMessage('');
    };

    /**
     * Adds or updates a budget
     */
    const handleAddOrEditBudget = async () => {
        // Validate form fields
        if (!newBudget.category || !newBudget.amount || !newBudget.startDate || !newBudget.endDate) {
            setAlertMessage('Please fill in all fields.');
            return;
        }

        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const budgetToSend = {
                amount: newBudget.amount,
                categoryId: newBudget.category.id,
                startDate: `${newBudget.startDate}T00:00:00`,
                endDate: `${newBudget.endDate}T23:59:59`
            };

            if (isEditMode) {
                // Update existing budget
                await axios.put(`${API_ENDPOINTS.budget}/${currentBudgetId}`, budgetToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBudgets(budgets.map(budget =>
                    budget.id === currentBudgetId ? { ...budget, ...budgetToSend } : budget
                ));
            } else {
                // Create new budget
                const response = await axios.post(API_ENDPOINTS.createBudget, budgetToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBudgets([...budgets, response.data]);
            }

            // Reset form and close popup
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

    /**
     * Adds or updates a goal
     */
    const handleAddOrEditGoal = async () => {
        // Validate form fields
        if (!newGoal.category || !newGoal.amount || !newGoal.startDate || !newGoal.endDate) {
            setAlertMessage('Please fill in all fields.');
            return;
        }

        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const goalToSend = {
                amount: newGoal.amount,
                categoryId: newGoal.category.id,
                startDate: `${newGoal.startDate}T00:00:00`,
                endDate: `${newGoal.endDate}T23:59:59`
            };

            if (isEditMode) {
                // Update existing goal
                await axios.put(`${API_ENDPOINTS.goal}/${currentGoalId}`, goalToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGoals(goals.map(goal =>
                    goal.id === currentGoalId ? { ...goal, ...goalToSend } : goal
                ));
            } else {
                // Create new goal
                const response = await axios.post(API_ENDPOINTS.createGoal, goalToSend, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGoals([...goals, response.data]);
            }

            // Reset form and close popup
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

    /**
     * Deletes a budget
     * @param {number} budgetId - ID of budget to delete
     */
    const handleDeleteBudget = async (budgetId) => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            await axios.delete(`${API_ENDPOINTS.budget}/${budgetId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBudgets(budgets.filter(budget => budget.id !== budgetId));
        } catch (error) {
            console.error('Error deleting budget:', error);
            setAlertMessage('Failed to delete budget. Please try again.');
        }
    };

    /**
     * Deletes a goal
     * @param {number} goalId - ID of goal to delete
     */
    const handleDeleteGoal = async (goalId) => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            await axios.delete(`${API_ENDPOINTS.goal}/${goalId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(goals.filter(goal => goal.id !== goalId));
        } catch (error) {
            console.error('Error deleting goal:', error);
            setAlertMessage('Failed to delete goal. Please try again.');
        }
    };

    /**
     * Calculates the appropriate color for progress bars
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     * @returns {string} CSS color value
     */
    const getProgressColor = (current, max) => {
        const ratio = current / max;
        if (ratio < 0.5) return "var(--success-color)";
        if (ratio < 0.8) return "#FFC107"; // Warning yellow
        return "var(--danger-color)";
    };

    /**
     * Returns the appropriate CSS class for budget status
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     * @returns {string} CSS class name
     */
    const getBudgetStatusClass = (current, max) => {
        if (current > max) return "status-exceeded";
        const ratio = current / max;
        if (ratio < 0.5) return "status-good";
        if (ratio < 0.8) return "status-warning";
        return "status-caution";
    };

    // Apply filters to budgets
    const filteredBudgets = budgets.filter(budget => {
        const matchesSearchQuery = budget.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const matchesFilterCategory = filterCategory ? budget.categoryId === parseInt(filterCategory) : true;
        return matchesSearchQuery && matchesFilterCategory;
    });

    // Apply filters to goals
    const filteredGoals = goals.filter(goal => {
        const matchesSearchQuery = goal.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const matchesFilterCategory = filterCategory ? goal.categoryId === parseInt(filterCategory) : true;
        return matchesSearchQuery && matchesFilterCategory;
    });

    // Split budgets into current and past
    const currentBudgets = filteredBudgets.filter(budget => new Date(budget.endDate) >= new Date());
    const pastBudgets = filteredBudgets.filter(budget => new Date(budget.endDate) < new Date());

    /**
     * Budget card component
     * @param {Object} props - Component props
     * @param {Object} props.budget - Budget data
     * @returns {JSX.Element} Budget card
     */
    const BudgetCard = ({ budget }) => {
        const progressColor = getProgressColor(budget.totalSpent, budget.amount);
        const statusClass = getBudgetStatusClass(budget.totalSpent, budget.amount);

        return (
            <div className="budget-card eco-card">
                <div className="budget-header">
                    <h4 className="budget-category">{budget.categoryName || 'No category'}</h4>
                    <div className="budget-actions">
                        <button
                            onClick={() => handleEditBudgetClick(budget)}
                            className="action-button edit-button"
                            aria-label="Edit budget"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="action-button delete-button"
                            aria-label="Delete budget"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                <div className="budget-dates">
                    <span className="date-label">From</span>
                    <span className="date-value">{new Date(budget.startDate).toLocaleDateString()}</span>
                    <span className="date-separator">-</span>
                    <span className="date-label">To</span>
                    <span className="date-value">{new Date(budget.endDate).toLocaleDateString()}</span>
                </div>

                <div className="budget-amount-container">
                    <div className="budget-amount">
                        <span className="amount-value">£{budget.amount}</span>
                        <span className="amount-label">Budget</span>
                    </div>
                    <div className="budget-spent">
                        <span className="spent-value">£{budget.totalSpent}</span>
                        <span className="spent-label">Spent</span>
                    </div>
                    <div className="budget-remaining">
            <span className={`remaining-value ${budget.totalSpent > budget.amount ? 'negative' : 'positive'}`}>
              {budget.totalSpent > budget.amount ? '-' : ''}£{Math.abs(budget.amount - budget.totalSpent).toFixed(2)}
            </span>
                        <span className="remaining-label">
              {budget.totalSpent > budget.amount ? 'Overspent' : 'Remaining'}
            </span>
                    </div>
                </div>

                <div className="budget-progress">
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${Math.min(100, (budget.totalSpent / budget.amount) * 100)}%`,
                                backgroundColor: progressColor
                            }}
                        ></div>
                    </div>
                    <div className={`budget-status ${statusClass}`}>
                        {budget.totalSpent > budget.amount
                            ? 'Budget Exceeded'
                            : `${Math.round((budget.totalSpent / budget.amount) * 100)}% Used`}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Goal card component
     * @param {Object} props - Component props
     * @param {Object} props.goal - Goal data
     * @returns {JSX.Element} Goal card
     */
    const GoalCard = ({ goal }) => {
        const progressColor = getProgressColor(goal.totalCarbonFootprint, goal.amount);
        const statusClass = getBudgetStatusClass(goal.totalCarbonFootprint, goal.amount);

        return (
            <div className="goal-card eco-card">
                <div className="goal-header">
                    <div className="goal-title">
                        <FaLeaf className="goal-icon" />
                        <h4 className="goal-category">{goal.categoryName || 'No category'}</h4>
                    </div>
                    <div className="goal-actions">
                        <button
                            onClick={() => handleEditGoalClick(goal)}
                            className="action-button edit-button"
                            aria-label="Edit goal"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="action-button delete-button"
                            aria-label="Delete goal"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                <div className="goal-dates">
                    <span className="date-label">From</span>
                    <span className="date-value">{new Date(goal.startDate).toLocaleDateString()}</span>
                    <span className="date-separator">-</span>
                    <span className="date-label">To</span>
                    <span className="date-value">{new Date(goal.endDate).toLocaleDateString()}</span>
                </div>

                <div className="goal-amount-container">
                    <div className="goal-amount">
                        <span className="amount-value">{goal.amount}</span>
                        <span className="amount-label">kg CO<sub>2</sub> Target</span>
                    </div>
                    <div className="goal-current">
                        <span className="current-value">{goal.totalCarbonFootprint}</span>
                        <span className="current-label">kg CO<sub>2</sub> Current</span>
                    </div>
                </div>

                <div className="goal-progress">
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${Math.min(100, (goal.totalCarbonFootprint / goal.amount) * 100)}%`,
                                backgroundColor: progressColor
                            }}
                        ></div>
                    </div>
                    <div className={`goal-status ${statusClass}`}>
                        {goal.totalCarbonFootprint > goal.amount
                            ? 'Goal Exceeded'
                            : `${Math.round((goal.totalCarbonFootprint / goal.amount) * 100)}% Used`}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the budget popup
     * @returns {JSX.Element|null} Budget popup or null if not visible
     */
    const renderBudgetPopup = () => {
        if (!isBudgetPopupVisible) return null;

        return (
            <div className="popup-overlay">
                <div className="popup-container eco-card">
                    <div className="popup-header">
                        <h3>{isEditMode ? 'Edit Budget' : 'Create a New Budget'}</h3>
                        <button
                            className="close-button"
                            onClick={handleClosePopup}
                            aria-label="Close popup"
                        >
                            ×
                        </button>
                    </div>
                    <div className="popup-body">
                        {alertMessage && <Alert variant="danger">{alertMessage}</Alert>}

                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Budget Amount (£)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newBudget.amount}
                                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                    placeholder="Enter budget amount"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    value={newBudget.category ? newBudget.category.id : ''}
                                    onChange={(e) => {
                                        const selectedCategory = categories.find(
                                            (cat) => cat.id === parseInt(e.target.value)
                                        );
                                        setNewBudget({ ...newBudget, category: selectedCategory });
                                    }}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Row>
                                <Col sm={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={newBudget.startDate}
                                            onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={newBudget.endDate}
                                            onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="popup-actions">
                                <button
                                    type="button"
                                    onClick={handleAddOrEditBudget}
                                    className="btn-eco-primary"
                                >
                                    {isEditMode ? 'Save Changes' : 'Create Budget'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClosePopup}
                                    className="btn-eco-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the goal popup
     * @returns {JSX.Element|null} Goal popup or null if not visible
     */
    const renderGoalPopup = () => {
        if (!isGoalPopupVisible) return null;

        return (
            <div className="popup-overlay">
                <div className="popup-container eco-card">
                    <div className="popup-header">
                        <h3>{isEditMode ? 'Edit Carbon Goal' : 'Create a New Carbon Goal'}</h3>
                        <button
                            className="close-button"
                            onClick={handleClosePopup}
                            aria-label="Close popup"
                        >
                            ×
                        </button>
                    </div>
                    <div className="popup-body">
                        {alertMessage && <Alert variant="danger">{alertMessage}</Alert>}

                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Carbon Footprint Target (kg CO<sub>2</sub>)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newGoal.amount}
                                    onChange={(e) => setNewGoal({ ...newGoal, amount: e.target.value })}
                                    placeholder="Enter carbon footprint target"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    value={newGoal.category ? newGoal.category.id : ''}
                                    onChange={(e) => {
                                        const selectedCategory = categories.find(
                                            (cat) => cat.id === parseInt(e.target.value)
                                        );
                                        setNewGoal({ ...newGoal, category: selectedCategory });
                                    }}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Row>
                                <Col sm={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={newGoal.startDate}
                                            onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={newGoal.endDate}
                                            onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="popup-actions">
                                <button
                                    type="button"
                                    onClick={handleAddOrEditGoal}
                                    className="btn-eco-primary"
                                >
                                    {isEditMode ? 'Save Changes' : 'Create Goal'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClosePopup}
                                    className="btn-eco-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders the actions bar with buttons and filters
     * @returns {JSX.Element} Actions bar
     */
    const renderActionsBar = () => (
        <div className="actions-bar">
            <Row>
                <Col md={6} className="action-buttons mb-3 mb-md-0">
                    <button onClick={handleAddBudgetClick} className="btn-eco-primary me-3">
                        <FaPlus className="btn-icon" /> Add Budget
                    </button>
                    <button onClick={handleAddGoalClick} className="btn-eco-secondary">
                        <FaLeaf className="btn-icon" /> Add Goal
                    </button>
                </Col>
                <Col md={6}>
                    <div className="filter-container">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search by category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
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
                </Col>
            </Row>
        </div>
    );

    /**
     * Renders the budgets section
     * @returns {JSX.Element} Budgets section
     */
    const renderBudgetsSection = () => (
        <Col lg={8}>
            <div className="budgets-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <FaChartLine className="section-icon" /> Your Current Budgets
                    </h3>
                </div>

                {currentBudgets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💰</div>
                        <p>No current budgets found.</p>
                        <p className="empty-hint">Create a budget to start tracking your spending!</p>
                    </div>
                ) : (
                    <div className="budgets-grid">
                        {currentBudgets.map(budget => (
                            <BudgetCard key={budget.id} budget={budget} />
                        ))}
                    </div>
                )}

                {pastBudgets.length > 0 && (
                    <>
                        <div className="section-header mt-4">
                            <h3 className="section-title">Past Budgets</h3>
                        </div>
                        <div className="budgets-grid">
                            {pastBudgets.map(budget => (
                                <BudgetCard key={budget.id} budget={budget} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Col>
    );

    /**
     * Renders the goals section
     * @returns {JSX.Element} Goals section
     */
    const renderGoalsSection = () => (
        <Col lg={4}>
            <div className="goals-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <FaLeaf className="section-icon" /> Carbon Footprint Goals
                    </h3>
                </div>

                {filteredGoals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🌱</div>
                        <p>No carbon footprint goals found.</p>
                        <p className="empty-hint">Set a goal to track your environmental impact!</p>
                    </div>
                ) : (
                    <div className="goals-list">
                        {filteredGoals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}
                    </div>
                )}
            </div>
        </Col>
    );

    return (
        <Container className="budget-container">
            {/* Page header */}
            <div className="section-header text-center">
                <h2 className="page-title">Budget & Goals</h2>
                <p className="section-subtitle">
                    Manage your spending limits and carbon footprint goals to stay on track with your financial and environmental targets.
                </p>
            </div>

            {/* Actions bar */}
            {renderActionsBar()}

            {/* Main content */}
            <div className="section-content">
                <Row className="g-4">
                    {renderBudgetsSection()}
                    {renderGoalsSection()}
                </Row>
            </div>

            {/* Popups */}
            {renderBudgetPopup()}
            {renderGoalPopup()}
        </Container>
    );
};

export default Budget;