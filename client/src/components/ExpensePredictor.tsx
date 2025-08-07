// import React, { useState, useEffect } from 'react';
// import { Brain, TrendingUp, Calendar, DollarSign } from 'lucide-react';
// import axios from 'axios';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// interface PredictionData {
//   month: string;
//   predicted: number;
//   actual?: number;
//   confidence: number;
// }

// const ExpensePredictor: React.FC = () => {
//   const [predictions, setPredictions] = useState<PredictionData[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [loading, setLoading] = useState(false);

//   const categories = ['All', 'Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others'];

//   useEffect(() => {
//     fetchPredictions();
//   }, [selectedCategory]);

//   const fetchPredictions = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`/api/expenses/predict?category=${selectedCategory}`);
//       setPredictions(response.data);
//     } catch (error) {
//       console.error('Error fetching predictions:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getConfidenceColor = (confidence: number) => {
//     if (confidence >= 80) return 'text-green-600';
//     if (confidence >= 60) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const nextMonthPrediction = predictions.find(p => !p.actual);
//   const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
//           <Brain className="h-5 w-5 text-purple-600" />
//           <span>AI Expense Predictor</span>
//         </h3>
//         <select
//           value={selectedCategory}
//           onChange={(e) => setSelectedCategory(e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
//         >
//           {categories.map(cat => (
//             <option key={cat} value={cat}>{cat}</option>
//           ))}
//         </select>
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
//         </div>
//       ) : (
//         <>
//           {/* Prediction Summary */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
//               <div className="flex items-center space-x-2">
//                 <Calendar className="h-5 w-5 text-purple-600" />
//                 <span className="text-sm font-medium text-gray-600">Next Month</span>
//               </div>
//               <p className="text-2xl font-bold text-purple-600">
//                 ${nextMonthPrediction?.predicted.toFixed(2) || '0.00'}
//               </p>
//             </div>
            
//             <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
//               <div className="flex items-center space-x-2">
//                 <TrendingUp className="h-5 w-5 text-green-600" />
//                 <span className="text-sm font-medium text-gray-600">Confidence</span>
//               </div>
//               <p className={`text-2xl font-bold ${getConfidenceColor(avgConfidence)}`}>
//                 {avgConfidence.toFixed(0)}%
//               </p>
//             </div>

//             <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
//               <div className="flex items-center space-x-2">
//                 <DollarSign className="h-5 w-5 text-orange-600" />
//                 <span className="text-sm font-medium text-gray-600">Trend</span>
//               </div>
//               <p className="text-2xl font-bold text-orange-600">
//                 {predictions.length > 1 && predictions[predictions.length - 1].predicted > predictions[predictions.length - 2].predicted ? '↗' : '↘'}
//               </p>
//             </div>
//           </div>

//           {/* Prediction Chart */}
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={predictions}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip 
//                   formatter={(value, name) => [
//                     `$${value}`, 
//                     name === 'predicted' ? 'Predicted' : 'Actual'
//                   ]}
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="actual" 
//                   stroke="#3b82f6" 
//                   strokeWidth={2}
//                   name="actual"
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="predicted" 
//                   stroke="#8b5cf6" 
//                   strokeWidth={2}
//                   strokeDasharray="5 5"
//                   name="predicted"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* AI Insights */}
//           <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
//             <h4 className="font-medium text-gray-900 mb-2">🤖 AI Insights</h4>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Based on your spending patterns, you tend to spend more on weekends</li>
//               <li>• Your {selectedCategory.toLowerCase()} expenses show a seasonal trend</li>
//               <li>• Consider setting a budget alert for next month</li>
//             </ul>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ExpensePredictor;

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PredictionData {
  month: string;
  predicted: number;
  actual?: number;
  confidence: number;
}

const ExpensePredictor: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const categories = ['All', 'Food', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Bills', 'Education', 'Travel', 'Others'];

  useEffect(() => {
    fetchPredictions();
  }, [selectedCategory]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/expenses/predict?category=${selectedCategory}`);
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const nextMonthPrediction = predictions.find(p => !p.actual);
  const avgConfidence = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI Expense Predictor</span>
        </h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Prediction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Next Month</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                ${nextMonthPrediction?.predicted?.toFixed(2) ?? '0.00'}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Confidence</span>
              </div>
              <p className={`text-2xl font-bold ${getConfidenceColor(avgConfidence)}`}>
                {avgConfidence.toFixed(0)}%
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Trend</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {predictions.length > 1 && predictions[predictions.length - 1].predicted > predictions[predictions.length - 2].predicted ? '↗' : '↘'}
              </p>
            </div>
          </div>

          {/* Prediction Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `$${value}`, 
                    name === 'predicted' ? 'Predicted' : 'Actual'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🤖 AI Insights</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Based on your spending patterns, you tend to spend more on weekends</li>
              <li>• Your {selectedCategory.toLowerCase()} expenses show a seasonal trend</li>
              <li>• Consider setting a budget alert for next month</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpensePredictor;
