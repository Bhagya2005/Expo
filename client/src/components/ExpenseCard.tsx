import React from 'react';
import { Edit, Trash2, Calendar, Tag } from 'lucide-react';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Food: 'bg-orange-100 text-orange-800',
    Transportation: 'bg-blue-100 text-blue-800',
    Entertainment: 'bg-purple-100 text-purple-800',
    Healthcare: 'bg-red-100 text-red-800',
    Shopping: 'bg-pink-100 text-pink-800',
    Bills: 'bg-yellow-100 text-yellow-800',
    Education: 'bg-green-100 text-green-800',
    Travel: 'bg-indigo-100 text-indigo-800',
    Others: 'bg-gray-100 text-gray-800'
  };
  return colors[category] || colors.Others;
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{expense.title}</h3>
          <p className="text-2xl font-bold text-primary-600">${expense.amount.toFixed(2)}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(expense)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(expense._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
            {expense.category}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(expense.date)}</span>
        </div>

        {expense.description && (
          <p className="text-sm text-gray-600 mt-3">{expense.description}</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;