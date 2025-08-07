import express from 'express';
import { body, validationResult } from 'express-validator';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Set budget for category
router.post('/set', auth, [
  body('category').isIn(['Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others']).withMessage('Invalid category'),
  body('limit').isFloat({ min: 0.01 }).withMessage('Budget limit must be greater than 0'),
  body('threshold').isInt({ min: 1, max: 100 }).withMessage('Threshold must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { category, limit, threshold } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category },
      { limit, threshold },
      { new: true, upsert: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get budget alerts
router.get('/alerts', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const alerts = await Promise.all(budgets.map(async (budget) => {
      const expenses = await Expense.find({
        user: req.user._id,
        category: budget.category,
        date: { $gte: currentMonth }
      });

      const currentSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentage = (currentSpent / budget.limit) * 100;

      return {
        category: budget.category,
        budgetLimit: budget.limit,
        currentSpent,
        alertThreshold: budget.threshold,
        isExceeded: percentage >= budget.threshold
      };
    }));

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;