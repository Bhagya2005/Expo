import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Filter, TrendingUp, TrendingDown, DollarSign, Calendar,
  Users, Receipt, Mic
} from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import ExpenseCard from './ExpenseCard';
import SmartBudgetAlert from './SmartBudgetAlert';
import ExpensePredictor from './ExpensePredictor';
import ReceiptScanner from './ReceiptScanner';
import ExpenseInsights from './ExpenseInsights';
import SplitExpense from './SplitExpense';
import AIExpenseAdvisor from './AIExpenseAdvisor';
import ExpenseVoiceInput from './ExpenseVoiceInput';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface Stats {
  totalExpenses: number;
  expenseCount: number;
  categoryStats: { [key: string]: number };
  monthlyStats: { [key: string]: number };
}

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [filter, setFilter] = useState({ category: 'All', startDate: '', endDate: '' });

  const categories = ['All', 'Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others'];

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category !== 'All') params.append('category', filter.category);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const response = await axios.get(`/api/expenses?${params.toString()}`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/expenses/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (expenseData: Omit<Expense, '_id'>) => {
    try {
      if (editingExpense?._id) {
        await axios.put(`/api/expenses/${editingExpense._id}`, expenseData);
      } else {
        await axios.post('/api/expenses', expenseData);
      }
      fetchExpenses();
      fetchStats();
      setEditingExpense(undefined);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${id}`);
        fetchExpenses();
        fetchStats();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleReceiptScanned = (scannedData: any) => {
    setEditingExpense({
      title: scannedData.merchant,
      amount: scannedData.amount,
      category: scannedData.category,
      description: `Scanned from receipt - ${scannedData.merchant}`,
      date: scannedData.date
    } as Expense);
    setIsReceiptScannerOpen(false);
    setIsFormOpen(true);
  };

  const handleSplitExpense = (splitData: any) => {
    console.log('Split expense data:', splitData);
    fetchExpenses();
    fetchStats();
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      Food: '#f97316', Transportation: '#3b82f6', Entertainment: '#8b5cf6',
      Healthcare: '#ef4444', Shopping: '#ec4899', Bills: '#eab308',
      Education: '#22c55e', Travel: '#6366f1', Others: '#6b7280'
    };
    return colors[category] || colors.Others;
  };

  const categoryData = stats ? Object.entries(stats.categoryStats).map(([name, value]) => ({
    name, value, color: getCategoryColor(name)
  })) : [];

  const averageExpense = stats?.expenseCount ? stats.totalExpenses / stats.expenseCount : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track and manage your expenses</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsReceiptScannerOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
            <Receipt className="h-5 w-5" /> <span>Scan Receipt</span>
          </button>
          <button onClick={() => setIsVoiceInputOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
            <Mic className="h-5 w-5" /> <span>Voice Input</span>
          </button>
          <button onClick={() => setIsSplitOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            <Users className="h-5 w-5" /> <span>Split Expense</span>
          </button>
          <button onClick={() => { setEditingExpense(undefined); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <Plus className="h-5 w-5" /> <span>Add Expense</span>
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <DollarSign className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-semibold text-gray-900">${stats.totalExpenses.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-xl font-semibold text-gray-900">{stats.expenseCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingDown className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Expense</p>
              <p className="text-xl font-semibold text-gray-900">${averageExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartBudgetAlert />
        <ExpenseInsights />
      </div>

      <ExpensePredictor />

      {stats && categoryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categoryData.map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">${item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-700 font-medium mb-1 block">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {categories.map((cat) => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-700 font-medium mb-1 block">Start Date</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 font-medium mb-1 block">End Date</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Expenses</h2>
        {expenses.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No expenses found</h3>
            <p className="text-gray-500 mb-4">Start tracking your expenses by adding your first entry.</p>
            <button
              onClick={() => { setEditingExpense(undefined); setIsFormOpen(true); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenses.map((expense) => (
              <ExpenseCard key={expense._id} expense={expense} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingExpense(undefined); }}
        onSubmit={handleSubmit}
        expense={editingExpense ? { ...editingExpense, description: editingExpense.description ?? "" } : undefined}
      />

      <SplitExpense isOpen={isSplitOpen} onClose={() => setIsSplitOpen(false)} onSplit={handleSplitExpense} />

      {isReceiptScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Receipt Scanner</h2>
              <button onClick={() => setIsReceiptScannerOpen(false)} className="text-gray-500">×</button>
            </div>
            <div className="p-4">
              <ReceiptScanner onExpenseExtracted={handleReceiptScanned} />
            </div>
          </div>
        </div>
      )}

      {isVoiceInputOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Voice Expense Input</h2>
              <button onClick={() => setIsVoiceInputOpen(false)} className="text-gray-500">×</button>
            </div>
            <div className="p-4">
              <ExpenseVoiceInput onExpenseExtracted={(data) => {
                setEditingExpense(data);
                setIsVoiceInputOpen(false);
                setIsFormOpen(true);
              }} />
            </div>
          </div>
        </div>
      )}

      <AIExpenseAdvisor />
    </div>
  );
};

export default Dashboard;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Plus, Filter, TrendingUp, TrendingDown, DollarSign, Calendar, Users, Receipt, Mic } from 'lucide-react';
// import ExpenseForm from './ExpenseForm';
// import ExpenseCard from './ExpenseCard';
// import SmartBudgetAlert from './SmartBudgetAlert';
// import ExpensePredictor from './ExpensePredictor';
// import ReceiptScanner from './ReceiptScanner';
// import ExpenseInsights from './ExpenseInsights';
// import SplitExpense from './SplitExpense';
// import AIExpenseAdvisor from './AIExpenseAdvisor';
// import ExpenseVoiceInput from './ExpenseVoiceInput';
// import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// interface Expense {
//   _id: string;
//   title: string;
//   amount: number;
//   category: string;
//   description?: string;
//   date: string;
// }

// interface Stats {
//   totalExpenses: number;
//   expenseCount: number;
//   categoryStats: { [key: string]: number };
//   monthlyStats: { [key: string]: number };
// }

// const Dashboard: React.FC = () => {
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [isSplitOpen, setIsSplitOpen] = useState(false);
//   const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
//   const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
//   const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
//   const [filter, setFilter] = useState({
//     category: 'All',
//     startDate: '',
//     endDate: ''
//   });

//   const categories = ['All', 'Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others'];

//   useEffect(() => {
//     fetchExpenses();
//     fetchStats();
//   }, [filter]);

//   const fetchExpenses = async () => {
//     try {
//       const params = new URLSearchParams();
//       if (filter.category !== 'All') params.append('category', filter.category);
//       if (filter.startDate) params.append('startDate', filter.startDate);
//       if (filter.endDate) params.append('endDate', filter.endDate);

//       const response = await axios.get(`/api/expenses?${params.toString()}`);
//       setExpenses(response.data);
//     } catch (error) {
//       console.error('Error fetching expenses:', error);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await axios.get('/api/expenses/stats');
//       setStats(response.data);
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   const handleSubmit = async (expenseData: Omit<Expense, '_id'>) => {
//     try {
//       if (editingExpense && editingExpense._id) {
//         await axios.put(`/api/expenses/${editingExpense._id}`, expenseData);
//       } else {
//         await axios.post('/api/expenses', expenseData);
//       }
//       fetchExpenses();
//       fetchStats();
//       setEditingExpense(undefined);
//     } catch (error) {
//       console.error('Error saving expense:', error);
//     }
//   };

//   const handleEdit = (expense: Expense) => {
//     setEditingExpense(expense);
//     setIsFormOpen(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (window.confirm('Are you sure you want to delete this expense?')) {
//       try {
//         await axios.delete(`/api/expenses/${id}`);
//         fetchExpenses();
//         fetchStats();
//       } catch (error) {
//         console.error('Error deleting expense:', error);
//       }
//     }
//   };

//   const handleReceiptScanned = (scannedData: any) => {
//     setEditingExpense({
//       title: scannedData.merchant,
//       amount: scannedData.amount,
//       category: scannedData.category,
//       description: `Scanned from receipt - ${scannedData.merchant}`,
//       date: scannedData.date
//     } as Expense); // Type assertion if needed
//     setIsReceiptScannerOpen(false);
//     setIsFormOpen(true);
//   };

//   const handleSplitExpense = (splitData: any) => {
//     // In a real app, this would create multiple expense entries
//     console.log('Split expense data:', splitData);
//     // For now, just refresh the expenses
//     fetchExpenses();
//     fetchStats();
//   };

//   const categoryData = stats ? Object.entries(stats.categoryStats).map(([name, value]) => ({
//     name,
//     value,
//     color: getCategoryColor(name)
//   })) : [];

//   function getCategoryColor(category: string): string {
//     const colors: { [key: string]: string } = {
//       Food: '#f97316',
//       Transportation: '#3b82f6',
//       Entertainment: '#8b5cf6',
//       Healthcare: '#ef4444',
//       Shopping: '#ec4899',
//       Bills: '#eab308',
//       Education: '#22c55e',
//       Travel: '#6366f1',
//       Others: '#6b7280'
//     };
//     return colors[category] || colors.Others;
//   }

//   const averageExpense = stats && stats.expenseCount > 0 ? stats.totalExpenses / stats.expenseCount : 0;

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//           <p className="text-gray-600">Track and manage your expenses</p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <button
//             onClick={() => {
//               alert("Button clicked!");
//               setIsReceiptScannerOpen(true);
//             }}
//             className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             <Receipt className="h-5 w-5" />
//             <span>Scan Receipt</span>
//           </button>
//           <button
//             onClick={() => setIsVoiceInputOpen(true)}
//             className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//           >
//             <Mic className="h-5 w-5" />
//             <span>Voice Input</span>
//           </button>
//           <button
//             onClick={() => setIsSplitOpen(true)}
//             className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <Users className="h-5 w-5" />
//             <span>Split Expense</span>
//           </button>
//           <button
//             onClick={() => {
//               setEditingExpense(undefined);
//               setIsFormOpen(true);
//             }}
//             className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
//           >
//             <Plus className="h-5 w-5" />
//             <span>Add Expense</span>
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       {stats && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-primary-100 rounded-full">
//                 <DollarSign className="h-6 w-6 text-primary-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Expenses</p>
//                 <p className="text-2xl font-bold text-gray-900">${stats.totalExpenses.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-secondary-100 rounded-full">
//                 <TrendingUp className="h-6 w-6 text-secondary-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Transactions</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.expenseCount}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-purple-100 rounded-full">
//                 <TrendingDown className="h-6 w-6 text-purple-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Average Expense</p>
//                 <p className="text-2xl font-bold text-gray-900">${averageExpense.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Smart Features */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <SmartBudgetAlert />
//         <ExpenseInsights />
//       </div>



//       <ExpensePredictor />

//       {/* Charts */}
//       {stats && categoryData.length > 0 && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={categoryData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {categoryData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
//             <div className="space-y-3">
//               {categoryData.map((item) => (
//                 <div key={item.name} className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div
//                       className="w-4 h-4 rounded-full"
//                       style={{ backgroundColor: item.color }}
//                     />
//                     <span className="text-sm font-medium text-gray-700">{item.name}</span>
//                   </div>
//                   <span className="text-sm font-bold text-gray-900">${item.value.toFixed(2)}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <div className="flex items-center space-x-2 mb-4">
//           <Filter className="h-5 w-5 text-gray-400" />
//           <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//             <select
//               value={filter.category}
//               onChange={(e) => setFilter({ ...filter, category: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
//             >
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//             <input
//               type="date"
//               value={filter.startDate}
//               onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//             <input
//               type="date"
//               value={filter.endDate}
//               onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Expenses List */}
//       <div>
//         <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Expenses</h2>
//         {expenses.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//             <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
//             <p className="text-gray-600 mb-6">Start tracking your expenses by adding your first entry.</p>
//             <button
//               onClick={() => {
//                 setEditingExpense(undefined);
//                 setIsFormOpen(true);
//               }}
//               className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
//             >
//               Add Your First Expense
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {expenses.map((expense) => (
//               <ExpenseCard
//                 key={expense._id}
//                 expense={expense}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Expense Form Modal */}
//       <ExpenseForm
//         isOpen={isFormOpen}
//         onClose={() => {
//           setIsFormOpen(false);
//           setEditingExpense(undefined);
//         }}
//         onSubmit={handleSubmit}
//         expense={
//           editingExpense
//             ? { ...editingExpense, description: editingExpense.description ?? "" }
//             : undefined
//         }
//       />

//       {/* Split Expense Modal */}
//       <SplitExpense
//         isOpen={isSplitOpen}
//         onClose={() => setIsSplitOpen(false)}
//         onSplit={handleSplitExpense}
//       />

//       {/* Receipt Scanner Modal */}
//       {isReceiptScannerOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h2 className="text-lg font-semibold">Receipt Scanner</h2>
//               <button
//                 onClick={() => setIsReceiptScannerOpen(false)}
//                 className="p-2 hover:bg-gray-100 rounded-full"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="p-4">
//               <ReceiptScanner onExpenseExtracted={handleReceiptScanned} />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Voice Input Modal */}
//       {isVoiceInputOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//             <div className="flex items-center justify-between p-4 border-b">
//               <h2 className="text-lg font-semibold">Voice Expense Input</h2>
//               <button
//                 onClick={() => setIsVoiceInputOpen(false)}
//                 className="p-2 hover:bg-gray-100 rounded-full"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="p-4">
//               <ExpenseVoiceInput 
//                 onExpenseExtracted={(data) => {
//                   setEditingExpense(data);
//                   setIsVoiceInputOpen(false);
//                   setIsFormOpen(true);
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* AI Chatbot */}
//       <AIExpenseAdvisor />
//     </div>
//   );
// };

// export default Dashboard;