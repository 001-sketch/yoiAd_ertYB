import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Heart, Loader2, CheckCircle2, X, Minus, Plus, MessageSquare } from 'lucide-react';

const COFFEE_PRICE = 5; // $5 per coffee
const QUICK_SELECT_OPTIONS = [1, 3, 5, 10];

/**
 * Service function to trigger checkout API session creation
 */
async function createCoffeeCheckoutSession(count: number, message: string): Promise<string> {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: count * COFFEE_PRICE,
      message: message.trim() || undefined,
    }),
  });

  const text = await response.text();
  let data: { url?: string; error?: string };

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Server returned an invalid response. Please check backend configuration.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session');
  }

  if (!data.url) {
    throw new Error('No checkout URL received from server.');
  }

  return data.url;
}

/**
 * Floating button trigger
 */
interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-50 bg-primary text-black px-5 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all cursor-pointer group"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1 }}
  >
    <Coffee size={20} className="group-hover:rotate-12 transition-transform" />
    <span className="text-sm font-display font-bold uppercase tracking-wide">Buy Me a Coffee</span>
  </motion.button>
);

/**
 * Success view after completing payment
 */
interface SuccessViewProps {
  onReset: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ onReset }) => (
  <motion.div
    className="p-8 text-center space-y-4"
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
  >
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
      <CheckCircle2 size={36} className="text-primary" />
    </div>
    <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
      Transaction <span className="text-primary">Complete</span>
    </h3>
    <p className="text-text-muted text-sm leading-relaxed">
      Thank you for fueling ByteDaily! Your support keeps the news flowing
      and the servers running. You're amazing. ☕
    </p>
    <div className="flex items-center justify-center gap-1 text-primary text-xs font-mono">
      <Heart size={12} className="fill-primary" />
      <span>SUPPORT_ACKNOWLEDGED</span>
    </div>
    <button
      onClick={onReset}
      className="mt-4 text-xs font-mono uppercase tracking-widest text-primary hover:underline cursor-pointer"
    >
      Close Terminal
    </button>
  </motion.div>
);

/**
 * Quantity picker with stepper and quick select presets
 */
interface QuantitySelectorProps {
  count: number;
  onChange: (newCount: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ count, onChange }) => {
  const visibleEmojiCount = Math.min(count, 5);
  const extraCount = count - 5;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, count - 1))}
          disabled={count <= 1}
          className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
        >
          <Minus size={16} />
        </button>

        <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-border min-w-[160px] justify-center">
          <div className="flex -space-x-1">
            {Array.from({ length: visibleEmojiCount }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xl"
              >
                ☕
              </motion.span>
            ))}
            {extraCount > 0 && (
              <span className="text-xs text-text-muted font-mono ml-2 self-center">
                +{extraCount}
              </span>
            )}
          </div>
          <span className="text-lg font-mono font-bold text-primary">
            x{count}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onChange(Math.min(20, count + 1))}
          disabled={count >= 20}
          className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex justify-center gap-2">
        {QUICK_SELECT_OPTIONS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              count === val
                ? 'bg-primary text-black'
                : 'bg-white/5 border border-border text-text-muted hover:text-white hover:border-primary/50'
            }`}
          >
            {val === 1 ? '☕ 1' : `☕ ${val}`}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Checkout form including amount, optional message, and CTA
 */
interface CheckoutFormProps {
  coffeeCount: number;
  message: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMsg: string;
  onCountChange: (count: number) => void;
  onMessageChange: (msg: string) => void;
  onSubmit: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  coffeeCount,
  message,
  status,
  errorMsg,
  onCountChange,
  onMessageChange,
  onSubmit,
}) => {
  const totalAmount = coffeeCount * COFFEE_PRICE;
  const isLoading = status === 'loading';

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-mono uppercase tracking-widest text-primary">
          <Coffee size={12} />
          Support Protocol
        </div>
        <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
          Buy Me a <span className="text-primary">Coffee</span>
        </h3>
        <p className="text-text-muted text-sm">
          Help keep ByteDaily News free and running
        </p>
      </div>

      <QuantitySelector count={coffeeCount} onChange={onCountChange} />

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted">
          <MessageSquare size={12} />
          Message (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Say something nice..."
          maxLength={200}
          rows={2}
          className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-sm font-mono placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
      </div>

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-400 font-mono text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20"
        >
          <span>⚠ {errorMsg}</span>
        </motion.div>
      )}

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-primary text-black py-4 rounded-xl font-display font-bold text-lg uppercase tracking-wide hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-3 group"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Support ${totalAmount}</span>
            <Heart size={18} className="group-hover:scale-110 transition-transform fill-black" />
          </>
        )}
      </button>

      <p className="text-center text-[10px] font-mono text-text-muted uppercase tracking-widest">
        Secured by Stripe • 256-bit Encryption
      </p>
    </div>
  );
};

/**
 * Main BuyMeCoffee component (Orchestrator)
 */
export const BuyMeCoffee: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coffeeCount, setCoffeeCount] = useState(1);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle URL payment callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success' || payment === 'cancelled') {
      setIsOpen(true);
      if (payment === 'success') {
        setStatus('success');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleReset = () => {
    setIsOpen(false);
    setStatus('idle');
    setCoffeeCount(1);
    setMessage('');
    setErrorMsg('');
  };

  const handleCheckout = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const url = await createCoffeeCheckoutSession(coffeeCount, message);
      window.location.href = url;
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Connection failed. Please try again.');
    }
  };

  return (
    <>
      <FloatingButton onClick={() => setIsOpen(true)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleReset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-md bg-bg-card border border-border rounded-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10 cursor-pointer"
              >
                <X size={20} />
              </button>

              {status === 'success' ? (
                <SuccessView onReset={handleReset} />
              ) : (
                <CheckoutForm
                  coffeeCount={coffeeCount}
                  message={message}
                  status={status}
                  errorMsg={errorMsg}
                  onCountChange={setCoffeeCount}
                  onMessageChange={setMessage}
                  onSubmit={handleCheckout}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
