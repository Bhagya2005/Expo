import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Play, Pause } from 'lucide-react';

interface VoiceInputProps {
  onExpenseExtracted: (expense: any) => void;
}

const ExpenseVoiceInput: React.FC<VoiceInputProps> = ({ onExpenseExtracted }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          processVoiceInput(transcript);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const processVoiceInput = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // AI-powered expense extraction from voice
      const extractedExpense = await extractExpenseFromText(text);
      if (extractedExpense) {
        onExpenseExtracted(extractedExpense);
        setTranscript('');
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractExpenseFromText = async (text: string): Promise<any> => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerText = text.toLowerCase();
    
    // Extract amount
    const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    
    // Extract category based on keywords
    let category = 'Others';
    if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('lunch') || lowerText.includes('dinner') || lowerText.includes('coffee')) {
      category = 'Food';
    } else if (lowerText.includes('gas') || lowerText.includes('uber') || lowerText.includes('taxi') || lowerText.includes('bus')) {
      category = 'Transportation';
    } else if (lowerText.includes('movie') || lowerText.includes('game') || lowerText.includes('entertainment')) {
      category = 'Entertainment';
    } else if (lowerText.includes('medicine') || lowerText.includes('doctor') || lowerText.includes('hospital')) {
      category = 'Healthcare';
    } else if (lowerText.includes('shopping') || lowerText.includes('clothes') || lowerText.includes('store')) {
      category = 'Shopping';
    } else if (lowerText.includes('bill') || lowerText.includes('electricity') || lowerText.includes('water') || lowerText.includes('internet')) {
      category = 'Bills';
    }
    
    // Extract title/description
    let title = text;
    if (lowerText.includes('spent') || lowerText.includes('paid')) {
      const parts = text.split(/spent|paid/i);
      title = parts[parts.length - 1].trim();
    }
    
    // Clean up title
    title = title.replace(/\$?\d+(?:\.\d{2})?/, '').trim();
    if (!title) {
      title = `${category} expense`;
    }

    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      amount,
      category,
      description: `Added via voice: "${text}"`,
      date: new Date().toISOString().split('T')[0]
    };
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const voiceExamples = [
    "I spent $25 on lunch at McDonald's",
    "Paid $50 for gas today",
    "Movie tickets cost $30",
    "Grocery shopping $120",
    "Coffee $5.50"
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${isListening ? 'bg-red-100' : 'bg-blue-100'}`}>
            {isListening ? (
              <div className="relative">
                <Mic className="h-8 w-8 text-red-600" />
                <div className="absolute -inset-2 border-2 border-red-400 rounded-full animate-ping"></div>
              </div>
            ) : (
              <MicOff className="h-8 w-8 text-blue-600" />
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Expense Input</h3>
        <p className="text-gray-600 mb-6">Speak naturally to add expenses instantly</p>

        {transcript && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">Listening: "{transcript}"</p>
          </div>
        )}

        {isProcessing && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-yellow-800">Processing your expense...</span>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4 mb-6">
          {!isListening ? (
            <button
              onClick={startListening}
              disabled={!recognition}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mic className="h-5 w-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <MicOff className="h-5 w-5" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {!recognition && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              Voice recognition is not supported in your browser. Please use Chrome or Edge.
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Volume2 className="h-4 w-4" />
            <span>Try saying:</span>
          </h4>
          <div className="space-y-2">
            {voiceExamples.map((example, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">"{example}"</span>
                <button
                  onClick={() => speakText(example)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  <Play className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>💡 Tip: Speak clearly and mention the amount, category, and description</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseVoiceInput;