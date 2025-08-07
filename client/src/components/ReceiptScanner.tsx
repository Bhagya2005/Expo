import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertCircle } from 'lucide-react';

interface ScannedData {
  amount: number;
  merchant: string;
  date: string;
  category: string;
  confidence: number;
}

const ReceiptScanner: React.FC<{ onExpenseExtracted: (data: ScannedData) => void }> = ({ onExpenseExtracted }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('/api/expenses/scan-receipt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to scan receipt');
      }

      const data = await response.json();
      setScannedData(data);
    } catch (error) {
      setError('Failed to scan receipt. Please try again.');
      console.error('Receipt scanning error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUseScannedData = () => {
    if (scannedData) {
      onExpenseExtracted(scannedData);
      setScannedData(null);
    }
  };

  const mockScanReceipt = () => {
    setIsScanning(true);
    // Simulate API call
    setTimeout(() => {
      const mockData: ScannedData = {
        amount: 45.67,
        merchant: "Starbucks Coffee",
        date: new Date().toISOString().split('T')[0],
        category: "Food",
        confidence: 92
      };
      setScannedData(mockData);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
            <Scan className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Receipt Scanner</h3>
        <p className="text-gray-600 mb-6">Upload a receipt photo and let AI extract expense details automatically</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {isScanning ? (
          <div className="py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Scanning receipt...</p>
          </div>
        ) : scannedData ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Receipt Scanned Successfully!</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-semibold">${scannedData.amount}</p>
              </div>
              <div>
                <span className="text-gray-600">Merchant:</span>
                <p className="font-semibold">{scannedData.merchant}</p>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <p className="font-semibold">{scannedData.date}</p>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-semibold">{scannedData.category}</p>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <span className="text-xs text-gray-500">
                Confidence: {scannedData.confidence}%
              </span>
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleUseScannedData}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Use This Data
              </button>
              <button
                onClick={() => setScannedData(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Scan Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span>Upload Receipt</span>
              </button>
              
              <button
                onClick={mockScanReceipt}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Camera className="h-5 w-5" />
                <span>Demo Scan</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <p className="text-xs text-gray-500">
              Supports JPG, PNG formats. Max file size: 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;