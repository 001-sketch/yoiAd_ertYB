import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SITE_NAME } from '../constants';

export const Subscribe = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      // Use clean version of email as ID to prevent duplicate subs easily
      const subId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const subRef = doc(db, 'subscriptions', subId);
      
      await setDoc(subRef, {
        email: email.toLowerCase(),
        createdAt: serverTimestamp(),
        status: 'active'
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      try {
        handleFirestoreError(error, OperationType.WRITE, `subscriptions/${email}`);
      } catch (err: any) {
        setErrorMessage("Transmission interrupted. Please check your signal.");
      }
    }
  };

  return (
    <section id="subscribe" className="py-24 px-6 bg-white text-black">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-[0.85]">
            Join the <br />
            <span className="text-primary-dark">Byte_network</span>
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-xl mx-auto">
            Get the most critical tech insights from Nairobi and the world, delivered 
            directly to your terminal every morning. No spam, just precision.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          {status === 'success' ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-200 space-y-4"
            >
              <CheckCircle2 size={48} className="text-green-600" />
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Signal Received</h3>
                <p className="text-sm text-gray-500">You're now on the list. Check your inbox for confirmation.</p>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="text-xs font-mono uppercase tracking-widest text-primary-dark hover:underline"
              >
                Add another email
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  required
                  placeholder="0x_your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-6 py-4 bg-gray-100 rounded-xl text-lg font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-dark transition-all"
                />
                <button
                  disabled={status === 'loading'}
                  className="bg-black text-white px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 disabled:opacity-50 transition-all group"
                >
                  {status === 'loading' ? 'Transmitting...' : 'Connect'}
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-red-600 font-mono text-xs"
                >
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </div>
          )}
        </form>

        <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-50">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>Privacy First Architecture</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
            <span>Verified Subscribers</span>
            <span className="font-bold">12K+</span>
          </div>
        </div>
      </div>
    </section>
  );
};
