import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '../services/subscriptionService';

export const Subscribe = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const result = await subscribeToNewsletter(cleanEmail);
      if (result.success) {
        setStatus('success');
        setFeedbackMessage(result.message);
        setEmail('');
      } else {
        setStatus('error');
        setFeedbackMessage(result.message);
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('Transmission interrupted. Please check your signal.');
    }
  };

  return (
    <section id="subscribe" className="py-16 px-6 bg-white text-black relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[10px] font-mono uppercase tracking-widest text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Subscriber Gateway
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.85]">
            Join the <br />
            <span className="text-primary-dark">Byte_network</span>
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-xl mx-auto leading-relaxed">
            Get the most critical tech insights from Nairobi and the world, delivered 
            directly to your terminal every morning. No spam, just precision.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          {status === 'success' ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-200 space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Signal Received</h3>
                <p className="text-sm text-gray-600 max-w-md">{feedbackMessage}</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setFeedbackMessage('');
                }}
                className="text-xs font-mono uppercase tracking-widest text-primary-dark hover:underline pt-2 font-bold"
              >
                Connect another email
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="0x_your@email.com"
                  value={email}
                  disabled={status === 'loading'}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  className="flex-grow px-6 py-4 bg-gray-100 rounded-xl text-base md:text-lg font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-dark transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 disabled:opacity-50 transition-all cursor-pointer group shrink-0"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-primary" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect</span>
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-red-600 font-mono text-xs bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{feedbackMessage}</span>
                </motion.div>
              )}
            </div>
          )}
        </form>

        <div className="flex flex-wrap justify-center gap-6 pt-4 opacity-60">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
            <ShieldCheck size={14} className="text-green-600" />
            <span>End-to-End Encrypted Handshake</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
            <span>Verified Subscribers</span>
            <span className="font-bold">100+</span>
          </div>
        </div>
      </div>
    </section>
  );
};
