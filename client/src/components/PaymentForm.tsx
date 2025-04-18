import React, { useState } from 'react';
import { Heart, CheckCircle } from 'lucide-react';
import StripeCheckout from './StripeCheckout';

interface PaymentFormProps {
  amount: string;
  currency: string;
  onPaymentComplete: (paymentDetails?: any) => void;
  onCancel: () => void;
}

export default function PaymentForm({ amount, currency, onPaymentComplete, onCancel }: PaymentFormProps) {
  const [paymentComplete, setPaymentComplete] = useState(false);

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

      <StripeCheckout 
        amount={amount} 
        currency={currency}
        onSuccess={() => {
          setPaymentComplete(true);
          // Notify parent component after a brief delay
          setTimeout(() => {
            onPaymentComplete();
          }, 1500);
        }}
        onCancel={onCancel}
      />
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          Your offering circulates through the sacred field with perfect resonance.
          All transactions are secure and protected by field encryption.
        </p>
      </div>
    </div>
  );
}