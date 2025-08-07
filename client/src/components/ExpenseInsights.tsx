import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import axios from 'axios';

interface Insight {
  type: 'warning' | 'tip' | 'achievement' | 'trend';
  title: string;
  description: string;
  action?: string;
  value?: number;
  icon: React.ReactNode;
}

const ExpenseInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await axios.get('/api/expenses/insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Mock insights for demo
      setInsights([
        {
          type: 'warning',
          title: 'High Food Spending',
          description: 'Your food expenses are 23% higher than last month. Consider meal planning to reduce costs.',
          action: 'Set a food budget',
          value: 23,
          icon: <TrendingUp className="h-5 w-5" />
        },
        {
          type: 'tip',
          title: 'Weekend Spending Pattern',
          description: 'You spend 40% more on weekends. Try planning weekend activities with a budget.',
          action: 'Create weekend budget',
          value: 40,
          icon: <Calendar className="h-5 w-5" />
        },
        {
          type: 'achievement',
          title: 'Transportation Savings',
          description: 'Great job! You saved $45 on transportation this month compared to last month.',
          value: 45,
          icon: <Target className="h-5 w-5" />
        },
        {
          type: 'trend',
          title: 'Decreasing Entertainment Costs',
          description: 'Your entertainment expenses have been decreasing for 3 consecutive months.',
          icon: <TrendingDown className="h-5 w-5" />
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'tip':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'achievement':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'trend':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-red-600';
      case 'tip':
        return 'text-blue-600';
      case 'achievement':
        return 'text-green-600';
      case 'trend':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${getInsightStyle(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-white ${getIconColor(insight.type)}`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{insight.title}</h4>
                  {insight.value && (
                    <span className="text-sm font-bold">
                      {insight.type === 'achievement' ? '+' : ''}${insight.value}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                {insight.action && (
                  <button className="mt-2 text-xs font-medium underline hover:no-underline">
                    {insight.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">💡 Pro Tip</h4>
        <p className="text-sm text-gray-600">
          Review your insights weekly to identify spending patterns and optimize your budget for better financial health.
        </p>
      </div>
    </div>
  );
};

export default ExpenseInsights;