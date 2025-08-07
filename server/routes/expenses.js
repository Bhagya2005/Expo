import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import Expense from '../models/Expense.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all expenses for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let filter = { user: req.user._id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create expense
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').isIn(['Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, amount, category, description, date } = req.body;

    const expense = new Expense({
      user: req.user._id,
      title,
      amount,
      category,
      description,
      date: date || new Date()
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update expense
router.put('/:id', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').isIn(['Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get expense statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = expenses.length;
    
    const categoryStats = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const monthlyStats = expenses.reduce((acc, expense) => {
      const month = expense.date.getMonth();
      const year = expense.date.getFullYear();
      const key = `${year}-${month}`;
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {});

    res.json({
      totalExpenses,
      expenseCount,
      categoryStats,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Receipt scanning endpoint
router.post('/scan-receipt', auth, upload.single('receipt'), async (req, res) => {
  try {
    // In a real app, this would use OCR service like Google Vision API or AWS Textract
    // For demo purposes, returning mock data
    const mockScannedData = {
      amount: Math.floor(Math.random() * 100) + 10,
      merchant: ['Starbucks', 'McDonald\'s', 'Target', 'Walmart', 'Gas Station'][Math.floor(Math.random() * 5)],
      date: new Date().toISOString().split('T')[0],
      category: ['Food', 'Shopping', 'Transportation'][Math.floor(Math.random() * 3)],
      confidence: Math.floor(Math.random() * 20) + 80
    };
    
    res.json(mockScannedData);
  } catch (error) {
    res.status(500).json({ message: 'Receipt scanning failed', error: error.message });
  }
});

// AI Insights endpoint
router.get('/insights', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    
    // Generate AI insights based on spending patterns
    const insights = [];
    
    // Calculate category spending
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    // Find highest spending category
    const highestCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];
    if (highestCategory) {
      insights.push({
        type: 'warning',
        title: `High ${highestCategory[0]} Spending`,
        description: `Your ${highestCategory[0].toLowerCase()} expenses are your highest category at $${highestCategory[1].toFixed(2)}.`,
        action: `Set a ${highestCategory[0].toLowerCase()} budget`,
        value: highestCategory[1]
      });
    }
    
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Error generating insights', error: error.message });
  }
});

// Expense prediction endpoint
router.get('/predict', auth, async (req, res) => {
  try {
    const { category } = req.query;
    const expenses = await Expense.find({ 
      user: req.user._id,
      ...(category !== 'All' && { category })
    }).sort({ date: -1 });
    
    // Simple prediction based on historical data
    const monthlyData = {};
    expenses.forEach(expense => {
      const month = expense.date.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
    });
    
    const months = Object.keys(monthlyData).sort();
    const predictions = months.map(month => ({
      month,
      actual: monthlyData[month],
      predicted: monthlyData[month] * (0.9 + Math.random() * 0.2), // Simple prediction
      confidence: Math.floor(Math.random() * 30) + 70
    }));
    
    // Add next month prediction
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const avgSpending = Object.values(monthlyData).reduce((a, b) => a + b, 0) / Object.values(monthlyData).length;
    
    predictions.push({
      month: nextMonth.toISOString().slice(0, 7),
      predicted: avgSpending * (0.9 + Math.random() * 0.2),
      confidence: Math.floor(Math.random() * 20) + 75
    });
    
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Error generating predictions', error: error.message });
  }
});

export default router;