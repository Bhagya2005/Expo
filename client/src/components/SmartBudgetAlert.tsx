import React, { useState, useEffect } from 'react';
import { AlertTriangle, Target, TrendingUp, Bell } from 'lucide-react';
import axios from 'axios';

interface BudgetAlert {
  category: string;
  budgetLimit: number;
  currentSpent: number;
  alertThreshold: number;
  isExceeded: boolean;
}

const SmartBudgetAlert: React.FC = () => {
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    limit: '',
    threshold: '80'
  });

  const categories = ['Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others'];

  useEffect(() => {
    fetchBudgetAlerts();
  }, []);

  const fetchBudgetAlerts = async () => {
    try {
      const response = await axios.get('/api/budget/alerts');
      setBudgetAlerts(response.data);
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
    }
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/budget/set', {
        category: newBudget.category,
        limit: parseFloat(newBudget.limit),
        threshold: parseInt(newBudget.threshold)
      });
      fetchBudgetAlerts();
      setNewBudget({ category: 'Food', limit: '', threshold: '80' });
      setShowSetup(false);
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };

  const getAlertColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100 border-red-300 text-red-800';
    if (percentage >= 80) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const getAlertIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (percentage >= 80) return <Bell className="h-5 w-5 text-yellow-600" />;
    return <Target className="h-5 w-5 text-green-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <span>Smart Budget Alerts</span>
        </h3>
        <button
          onClick={() => setShowSetup(!showSetup)}
          className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Set Budget
        </button>
      </div>

      {showSetup && (
        <form onSubmit={handleSetBudget} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit ($)</label>
              <input
                type="number"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert at (%)</label>
              <input
                type="number"
                value={newBudget.threshold}
                onChange={(e) => setNewBudget({ ...newBudget, threshold: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="100"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Set Budget Alert
          </button>
        </form>
      )}

      <div className="space-y-3">
        {budgetAlerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No budget alerts set. Click "Set Budget" to get started.</p>
        ) : (
          budgetAlerts.map((alert, index) => {
            const percentage = (alert.currentSpent / alert.budgetLimit) * 100;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getAlertColor(percentage)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(percentage)}
                    <div>
                      <h4 className="font-medium">{alert.category}</h4>
                      <p className="text-sm">
                        ${alert.currentSpent.toFixed(2)} of ${alert.budgetLimit.toFixed(2)} spent
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{percentage.toFixed(0)}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 100 ? 'bg-red-500' : 
                          percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SmartBudgetAlert;