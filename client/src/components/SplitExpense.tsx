import React, { useState } from 'react';
import { Users, Plus, Minus, Calculator, Share } from 'lucide-react';

interface SplitPerson {
  id: string;
  name: string;
  email: string;
  amount: number;
  paid: boolean;
}

interface SplitExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  onSplit: (splitData: any) => void;
}

const SplitExpense: React.FC<SplitExpenseProps> = ({ isOpen, onClose, onSplit }) => {
  const [totalAmount, setTotalAmount] = useState('');
  const [title, setTitle] = useState('');
  const [people, setPeople] = useState<SplitPerson[]>([
    { id: '1', name: '', email: '', amount: 0, paid: false }
  ]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');

  const addPerson = () => {
    const newPerson: SplitPerson = {
      id: Date.now().toString(),
      name: '',
      email: '',
      amount: 0,
      paid: false
    };
    setPeople([...people, newPerson]);
  };

  const removePerson = (id: string) => {
    if (people.length > 1) {
      setPeople(people.filter(p => p.id !== id));
    }
  };

  const updatePerson = (id: string, field: keyof SplitPerson, value: any) => {
    setPeople(people.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculateSplit = () => {
    const total = parseFloat(totalAmount) || 0;
    if (splitMethod === 'equal') {
      const perPerson = total / people.length;
      setPeople(people.map(p => ({ ...p, amount: perPerson })));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const splitData = {
      title,
      totalAmount: parseFloat(totalAmount),
      people: people.filter(p => p.name.trim() !== ''),
      splitMethod
    };
    onSplit(splitData);
    onClose();
  };

  const generateShareableLink = () => {
    const splitData = {
      title,
      totalAmount: parseFloat(totalAmount),
      people: people.filter(p => p.name.trim() !== ''),
      splitMethod
    };
    
    // In a real app, this would generate a shareable link
    const shareText = `💰 Split Expense: ${title}\nTotal: $${totalAmount}\n${people.map(p => `${p.name}: $${p.amount.toFixed(2)}`).join('\n')}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Split Expense',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Split details copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary-600" />
            <span>Split Expense</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Dinner at Restaurant"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Split Method
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="equal"
                  checked={splitMethod === 'equal'}
                  onChange={(e) => setSplitMethod(e.target.value as 'equal')}
                  className="mr-2"
                />
                Equal Split
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="custom"
                  checked={splitMethod === 'custom'}
                  onChange={(e) => setSplitMethod(e.target.value as 'custom')}
                  className="mr-2"
                />
                Custom Amounts
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                People ({people.length})
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={calculateSplit}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Calculate</span>
                </button>
                <button
                  type="button"
                  onClick={addPerson}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Person</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {people.map((person, index) => (
                <div key={person.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={person.name}
                      onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={person.email}
                      onChange={(e) => updatePerson(person.id, 'email', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={person.amount || ''}
                      onChange={(e) => updatePerson(person.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={splitMethod === 'equal'}
                    />
                  </div>
                  {people.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePerson(person.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={generateShareableLink}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              <Share className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md transition-colors"
            >
              Create Split
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SplitExpense;