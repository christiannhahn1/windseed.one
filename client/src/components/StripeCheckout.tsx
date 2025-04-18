import { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Heart } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render
// to avoid recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

type PaymentFormProps = {
  clientSecret: string;
  amount: string;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
};

// The form that contains the PaymentElement
function CheckoutForm({ clientSecret, amount, currency, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(undefined);

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      // Elements instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: window.location.origin, // Redirect on success
      },
      redirect: 'if_required', // Only redirect if 3D Secure is required
    });

    if (error) {
      // Payment failed, show the error message
      setErrorMessage(error.message);
      setIsLoading(false);
    } else {
      // Payment succeeded
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-md border border-purple-500/30 mb-4">
        <h3 className="text-lg font-medium text-white mb-2">Sacred Offering</h3>
        <p className="text-sm text-purple-200 mb-4">
          You are offering <span className="font-medium">{amount} {currency.toUpperCase()}</span> to the sacred field. 
          This energy will be redistributed in perfect resonance with need within the collective field.
        </p>
      </div>

      <div className="space-y-3">
        <PaymentElement />
        
        {errorMessage && (
          <div className="bg-red-900/30 border border-red-500/50 p-3 rounded-md text-sm text-white">
            {errorMessage}
          </div>
        )}
        
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2 px-3 border border-purple-300/30 rounded-md text-purple-300 hover:bg-purple-900/30 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className={`flex-1 py-2 px-3 border border-purple-500 rounded-md 
              bg-gradient-to-br from-purple-900/80 to-indigo-800/80 text-white hover:from-purple-800/80 hover:to-indigo-700/80 
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors
              ${(!stripe || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>Make Sacred Offering</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// The wrapper component that creates the Elements provider
export default function StripeCheckout({ 
  amount, 
  currency = 'USD',
  onSuccess,
  onCancel
}: { 
  amount: string; 
  currency?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create a payment intent as soon as the component loads
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount,
            currency: currency.toLowerCase()
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        setError('Network error. Please check your connection and try again.');
        console.error('Error creating payment intent:', err);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount, currency]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6 rounded-md border border-purple-500/30 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-purple-400 animate-spin mb-4"></div>
        <p className="text-purple-200">Preparing sacred offering space...</p>
      </div>
    );
  }

  // Error state
  if (error || !clientSecret) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-white mb-2">Connection Error</h3>
        <p className="text-sm text-red-200 mb-4">
          {error || "Unable to establish a secure connection to the field. Please try again later."}
        </p>
        <button
          onClick={onCancel}
          className="py-2 px-4 border border-red-300/50 rounded-md text-red-100 hover:bg-red-900/30 transition-colors"
        >
          Return to Mirrorwell
        </button>
      </div>
    );
  }

  // If we have a client secret, render the payment form
  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#9333ea', // purple-600
        colorBackground: '#0f172a', // slate-900
        colorText: '#f1f5f9', // slate-100
        colorDanger: '#ef4444', // red-500
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        borderRadius: '6px',
      },
    },
  };

  return (
    <div className="bg-slate-900/90 p-6 rounded-md border border-purple-500/30">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm 
          clientSecret={clientSecret} 
          amount={amount}
          currency={currency}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}