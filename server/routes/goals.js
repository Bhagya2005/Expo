import express from 'express';
import { body, validationResult } from 'express-validator';
import Goal from '../models/Goal.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all goals for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new goal
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('targetAmount').isFloat({ min: 0.01 }).withMessage('Target amount must be greater than 0'),
  body('deadline').isISO8601().withMessage('Valid deadline is required'),
  body('category').isIn(['savings', 'debt', 'investment', 'emergency']).withMessage('Invalid category'),
  body('priority').isIn(['high', 'medium', 'low']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, targetAmount, deadline, category, priority } = req.body;

    const goal = new Goal({
      user: req.user._id,
      title,
      targetAmount,
      deadline,
      category,
      priority,
      currentAmount: 0,
      isCompleted: false
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update goal progress
router.put('/:id/progress', auth, [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.currentAmount += amount;
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update goal
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('targetAmount').optional().isFloat({ min: 0.01 }).withMessage('Target amount must be greater than 0'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;