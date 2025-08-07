import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, TrendingDown, Target, Lightbulb, X } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ExpenseData {
  totalSpent: number;
  categoryBreakdown: { [key: string]: number };
  monthlyTrend: number;
  topCategory: string;
}

const AIExpenseAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
      fetchExpenseData();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchExpenseData = async () => {
    try {
      const response = await axios.get('/api/expenses/stats');
      const stats = response.data;
      
      const expensesResponse = await axios.get('/api/expenses');
      const expenses = expensesResponse.data;
      
      // Calculate monthly trend
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth - 1;
      
      const currentMonthExpenses = expenses.filter((exp: any) => 
        new Date(exp.date).getMonth() === currentMonth
      ).reduce((sum: number, exp: any) => sum + exp.amount, 0);
      
      const lastMonthExpenses = expenses.filter((exp: any) => 
        new Date(exp.date).getMonth() === lastMonth
      ).reduce((sum: number, exp: any) => sum + exp.amount, 0);
      
      const trend = lastMonthExpenses > 0 ? 
        ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
      
      const topCategory = Object.entries(stats.categoryStats)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'Food';

      setExpenseData({
        totalSpent: stats.totalExpenses,
        categoryBreakdown: stats.categoryStats,
        monthlyTrend: trend,
        topCategory
      });
    } catch (error) {
      console.error('Error fetching expense data:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: "👋 Hi! I'm your AI Financial Advisor. I've analyzed your spending patterns and I'm here to help you save money and manage expenses better. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my spending patterns",
        "Give me saving tips",
        "How can I reduce my expenses?",
        "Set a budget goal"
      ]
    };
    setMessages([welcomeMessage]);
  };

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMessage = userMessage.toLowerCase();
    let response = "";
    let suggestions: string[] = [];

    if (lowerMessage.includes('spending') || lowerMessage.includes('pattern') || lowerMessage.includes('analyze')) {
      if (expenseData) {
        response = `📊 **Spending Analysis:**

• Total spent this month: $${expenseData.totalSpent.toFixed(2)}
• Your top spending category: ${expenseData.topCategory} ($${expenseData.categoryBreakdown[expenseData.topCategory]?.toFixed(2) || 0})
• Monthly trend: ${expenseData.monthlyTrend > 0 ? '📈' : '📉'} ${Math.abs(expenseData.monthlyTrend).toFixed(1)}% vs last month

**Key Insights:**
${expenseData.monthlyTrend > 10 ? '⚠️ Your spending increased significantly this month' : '✅ Your spending is under control'}`;
        
        suggestions = ["How to reduce my top category?", "Set budget alerts", "Show saving opportunities"];
      }
    } else if (lowerMessage.includes('saving') || lowerMessage.includes('save') || lowerMessage.includes('tips')) {
      response = `💰 **Personalized Saving Tips:**

Based on your spending patterns:

🍽️ **Food & Dining** (if high):
• Try meal planning for the week
• Cook at home 3 more days/week = Save ~$200/month
• Use grocery apps for discounts

🚗 **Transportation**:
• Consider carpooling or public transport
• Combine multiple errands in one trip
• Walk/bike for nearby destinations

🛍️ **Shopping**:
• Wait 24 hours before non-essential purchases
• Use price comparison apps
• Buy generic brands for 20-30% savings

💡 **Smart Tip**: Set up automatic transfers to savings right after payday!`;
      
      suggestions = ["Create a savings challenge", "Track my progress", "More specific tips"];
    } else if (lowerMessage.includes('reduce') || lowerMessage.includes('cut') || lowerMessage.includes('lower')) {
      response = `✂️ **Expense Reduction Strategy:**

**Quick Wins (This Week):**
• Cancel unused subscriptions = $50-100/month
• Switch to generic brands = 15-20% savings
• Use coupons and cashback apps

**Medium-term (This Month):**
• Negotiate bills (phone, internet, insurance)
• Find cheaper alternatives for regular purchases
• Implement the 50/30/20 budgeting rule

**Long-term (3+ Months):**
• Build an emergency fund to avoid debt
• Invest in quality items that last longer
• Consider side income opportunities

🎯 **Goal**: Reduce expenses by 15% in next 3 months`;
      
      suggestions = ["Help me negotiate bills", "Create expense reduction plan", "Track my savings"];
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('goal')) {
      response = `🎯 **Smart Budgeting Strategy:**

**Recommended Budget Allocation:**
• Needs (50%): Rent, groceries, utilities
• Wants (30%): Entertainment, dining out
• Savings (20%): Emergency fund, investments

**Your Personalized Goals:**
• Emergency Fund: $${(expenseData?.totalSpent || 1000) * 3} (3 months expenses)
• Monthly Savings Target: $${((expenseData?.totalSpent || 1000) * 0.2).toFixed(2)}
• Debt Payoff: Focus on highest interest first

**Action Steps:**
1. Set up automatic savings transfers
2. Use the envelope method for discretionary spending
3. Review and adjust monthly`;
      
      suggestions = ["Set up automatic savings", "Create emergency fund", "Track budget progress"];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
      response = `👋 Hello! I'm here to help you master your finances. I can:

🔍 **Analyze** your spending patterns
💰 **Suggest** personalized saving strategies  
📊 **Track** your financial progress
🎯 **Set** realistic budget goals
⚡ **Alert** you about overspending
💡 **Recommend** money-saving opportunities

What would you like to explore first?`;
      
      suggestions = ["Analyze my spending", "Give saving tips", "Set budget goals", "Find money leaks"];
    } else {
      response = `🤔 I understand you're asking about "${userMessage}". 

Let me help you with that! Based on your expense data, I can provide specific advice about:

• Spending optimization strategies
• Category-wise budget recommendations  
• Saving opportunities in your top expense areas
• Financial goal setting and tracking

What specific aspect would you like me to focus on?`;
      
      suggestions = ["Spending analysis", "Saving strategies", "Budget planning", "Goal setting"];
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const botResponse = await generateAIResponse(messageToSend);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "Sorry, I'm having trouble processing your request. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 animate-pulse"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Financial Advisor</h3>
                <p className="text-xs opacity-90">Your personal money coach</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="h-4 w-4 mt-1 text-purple-600" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSendMessage(suggestion)}
                              className="block w-full text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your expenses..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIExpenseAdvisor;