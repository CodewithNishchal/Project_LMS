import React, { useState } from 'react';
import { api } from '../../services/api';

interface ModalProps {
  loanId: string;
  borrowerName: string;
  outstandingBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const RecordPaymentModal: React.FC<ModalProps> = ({
  loanId,
  borrowerName,
  outstandingBalance,
  onClose,
  onSuccess,
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const numAmount = Number(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let cleanUtr = utrNumber.trim();
    if (cleanUtr.startsWith('#')) cleanUtr = cleanUtr.substring(1).trim();
    if (cleanUtr.toUpperCase().startsWith('UTR#')) cleanUtr = 'UTR' + cleanUtr.substring(4).trim();

    if (!cleanUtr) {
      setError('UTR Number is required to record payment.');
      return;
    }
    const utrFormatRegex = /^(UTR|[A-Z]{3,4})?[0-9]{12}$/i;
    if (!utrFormatRegex.test(cleanUtr)) {
      setError('Invalid UTR format. Bank UTR must consist of strictly 12 numeric digits (e.g. UTR984102948120 or 984102948120).');
      return;
    }

    // Frontend Pre-validations
    if (numAmount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }
    
    // Allow slight rounding tolerance (within 0.05 paise)
    if (numAmount > outstandingBalance + 0.05) {
      setError(`Payment amount cannot exceed remaining balance of ₹${outstandingBalance.toLocaleString('en-IN')}`);
      return;
    }

    try {
      setLoading(true);
      await api.post('/collection/repayment', {
        loanId,
        utrNumber,
        amount: numAmount,
        paymentDate,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Record Borrower Payment</h3>
        <p className="text-sm text-gray-600">Borrower: <strong className="text-gray-800">{borrowerName}</strong></p>
        <p className="text-sm text-gray-600">Outstanding Balance: <strong className="text-blue-600">₹{outstandingBalance.toLocaleString('en-IN')}</strong></p>

        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">12-Digit UTR Number</label>
            <input
              type="text"
              required
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.trim())}
              placeholder="e.g. 421890123456"
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Payment Amount (₹)</label>
              <button
                type="button"
                onClick={() => setAmount(outstandingBalance)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Pay Full Balance (₹{outstandingBalance.toLocaleString('en-IN')})
              </button>
            </div>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              max={outstandingBalance + 1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (e.g. 85917.81)"
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
