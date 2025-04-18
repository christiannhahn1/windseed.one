import React, { useState } from 'react';
import { Heart, CreditCard, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  amount: string;
  currency: string;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ amount, currency, onPaymentComplete, onCancel }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [error, setError] = useState('');

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiration date
  const formatExpDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCardNumber(formatCardNumber(value));
  };

  // Handle exp date change
  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpDate(formatExpDate(value));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !expDate || !cvc) {
        setError('Please fill in all card details');
        return;
      }
      
      // Simple validation
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid card number');
        return;
      }
      
      if (expDate.length < 5) {
        setError('Please enter a valid expiration date (MM/YY)');
        return;
      }
      
      if (cvc.length < 3) {
        setError('Please enter a valid CVC');
        return;
      }
    }
    
    setError('');
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      setPaymentComplete(true);
      
      // Notify parent component after a brief delay
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    }, 2000);
  };

  if (paymentComplete) {
    return (
      <div className="p-6 bg-black/30 rounded-lg border border-green-500/30 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="text-green-400 w-8 h-8" />
          </div>
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Sacred Offering Complete</h3>
        <p className="text-green-300 mb-4">Your offering of {amount} {currency} has entered the field</p>
        <p className="text-white/60 text-sm mb-6">
          Thank you for your contribution to the sacred field.
          May it return to you in love and harmonic resonance.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black/30 rounded-lg border border-purple-500/30">
      <h3 className="text-xl font-medium text-white mb-2 flex items-center">
        <Heart className="text-purple-400 mr-2" size={18} />
        Sacred Offering
      </h3>
      <p className="text-white/70 mb-6">
        Amount: <span className="text-purple-300 font-medium">{amount} {currency}</span>
      </p>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <div className="flex border border-purple-500/30 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
              paymentMethod === 'card' 
              ? 'bg-purple-900/50 text-white' 
              : 'bg-black/30 text-white/70 hover:bg-black/20'
            }`}
          >
            <CreditCard size={16} />
            <span>Card</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 ${
              paymentMethod === 'paypal' 
              ? 'bg-blue-900/50 text-white' 
              : 'bg-black/30 text-white/70 hover:bg-black/20'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.632 4.22-.03.154a.8.8 0 0 1-.792.679h-4.45a.7.7 0 0 1-.696-.772c.062-.4.138-.8.192-1.2.054-.4.13-.8.168-1.2a.64.64 0 0 1 .624-.558h1.956c.816-.017 1.51-.6 1.636-1.406l1.367-8.67a.82.82 0 0 1 .812-.689h5.442c.264 0 .466.062.622.214z"/>
              <path d="M5.696 8.478a.82.82 0 0 1 .812-.689h5.44c.264 0 .466.062.624.214.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.632 4.22-.032.154a.8.8 0 0 1-.792.679h-2.45a.7.7 0 0 1-.696-.772l1.368-8.678 1.476-9.371a.64.64 0 0 1 .624-.558h3.98c.264 0 .466.062.624.214"/>
            </svg>
            <span>PayPal</span>
          </button>
        </div>
      </div>

      {paymentMethod === 'card' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          {/* Card Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Name on Card
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          {/* Exp Date and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Expiration Date
              </label>
              <input
                type="text"
                value={expDate}
                onChange={handleExpDateChange}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                CVC
              </label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123"
                maxLength={4}
                className="w-full px-3 py-2 bg-black/30 border border-purple-500/30 rounded-md text-white focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm py-2">
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-md shadow-md hover:shadow-lg transition-all ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-500 hover:to-indigo-600'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Complete Sacred Offering'
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-blue-900/20 rounded-lg border border-blue-700/30 text-center">
            <p className="text-white mb-4">
              Continue to PayPal to complete your sacred offering of {amount} {currency}.
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-500 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Continue to PayPal'
              )}
            </button>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-300 text-sm hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          Your offering circulates through the sacred field with perfect resonance.
          All transactions are secure and protected by field encryption.
        </p>
      </div>
    </div>
  );
}