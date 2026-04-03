import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRazorpay } from 'react-razorpay';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PricingPage() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const { Razorpay } = useRazorpay();

  const handleUpgrade = async (planName: 'researcher' | 'organization') => {
    try {
      const orderRes = await fetch('/api/auth/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: planName }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        alert('Failed to create order');
        return;
      }
      const rzp = new Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SHFkFDv4q8dkSo',
        amount: orderData.order.amount.toString(),
        currency: orderData.order.currency,
        name: 'Phoenix Blueprint',
        description: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Subscription`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/auth/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planName,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await checkAuth();
            alert(`Successfully upgraded to ${planName} plan!`);
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#0a0a0a' },
      } as any);
      rzp.open();
    } catch (err) {
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.45) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at top center, black 0%, transparent 80%)',
        }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between border-b border-zinc-900 bg-black/50 backdrop-blur-xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </nav>

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-6xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
            Computational power <br className="hidden md:block" />
            for modern labs.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
            Scale your research instantly. Choose a plan tailored to your team\'s processing and security requirements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full relative">
          
          {/* Base Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative p-8 rounded-[24px] border ${(!user?.plan || user?.plan === 'free') ? 'border-zinc-500/50 bg-zinc-900' : 'border-zinc-800 bg-[#0a0a0a]'} flex flex-col pt-10`}
          >
            {(!user?.plan || user?.plan === 'free') && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-zinc-800 border border-zinc-600 rounded-full text-[10px] font-bold tracking-widest text-zinc-300 uppercase">
                ACTIVE PLAN
              </div>
            )}
            <div className="mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-400" />
              <h4 className="font-medium text-zinc-400 text-sm tracking-widest uppercase">Explorer</h4>
            </div>
            <div className="flex items-baseline gap-1 mb-8">
              <p className="text-5xl font-bold tracking-tighter text-white">Free</p>
            </div>
            
            <ul className="space-y-4 text-sm font-medium text-zinc-400 flex-1 mb-10">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>3 comprehensive reports/month</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Standard confidence scoring</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Top 5 data source integration</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Community access</span></li>
            </ul>

            {(!user?.plan || user.plan === 'free') ? (
               <div className="w-full h-12 rounded-xl border border-zinc-700 bg-zinc-800/50 flex items-center justify-center text-sm font-semibold text-zinc-300 cursor-default">
                 Current Plan
               </div>
            ) : (
               <div className="w-full h-12 rounded-xl border border-zinc-800 flex items-center justify-center text-sm font-semibold text-zinc-600">
                 Included
               </div>
            )}
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative p-8 rounded-[24px] border ${user?.plan === 'researcher' ? 'border-zinc-300 bg-zinc-900 shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'border-zinc-700 bg-zinc-950'} flex flex-col pt-10`}
          >
            {user?.plan === 'researcher' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-white border border-white rounded-full text-[10px] font-bold tracking-widest text-black uppercase shadow-lg">
                ACTIVE PLAN
              </div>
            )}
            <div className="mb-2 flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
               <h4 className="font-medium text-white text-sm tracking-widest uppercase">Researcher</h4>
            </div>
            <div className="flex items-baseline gap-1 mb-8">
              <p className="text-5xl font-bold tracking-tighter text-white">₹999</p>
              <span className="text-base text-zinc-400 font-medium">/mo</span>
            </div>
            
            <ul className="space-y-4 text-sm font-medium text-zinc-300 flex-1 mb-10">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span className="font-bold text-white">Unlimited reports & runs</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Full 8-agent parallel execution</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Global IP & Patent analysis</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>PDF journal export & citation</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Real-time safety heatmaps</span></li>
            </ul>

            {user?.plan === 'researcher' ? (
              <div className="w-full h-12 rounded-xl bg-white text-black flex items-center justify-center text-sm font-bold cursor-default shadow-md relative overflow-hidden">
                <span className="relative z-10">Active Subscription</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-20 -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            ) : user?.plan === 'organization' ? (
              <div className="w-full h-12 rounded-xl border border-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500">
                Included in Organization
              </div>
            ) : (
              <Button
                onClick={() => handleUpgrade('researcher')}
                className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Upgrade to Researcher
              </Button>
            )}
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`relative p-8 rounded-[24px] border ${user?.plan === 'organization' ? 'border-zinc-500/50 bg-zinc-900' : 'border-zinc-800 bg-[#0a0a0a]'} flex flex-col pt-10`}
          >
            {user?.plan === 'organization' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-zinc-800 border border-zinc-600 rounded-full text-[10px] font-bold tracking-widest text-zinc-300 uppercase">
                ACTIVE PLAN
              </div>
            )}
            <div className="mb-2 flex items-center gap-2">
               <Crown className="w-4 h-4 text-zinc-400" />
               <h4 className="font-medium text-zinc-400 text-sm tracking-widest uppercase">Organization</h4>
            </div>
            <div className="flex items-baseline gap-1 mb-8">
              <p className="text-5xl font-bold tracking-tighter text-white">₹2,499</p>
              <span className="text-base text-zinc-400 font-medium">/mo</span>
            </div>
            
            <ul className="space-y-4 text-sm font-medium text-zinc-400 flex-1 mb-10">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span className="font-bold text-white">Everything in Researcher</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Private data orchestration</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Team collaboration & roles</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>Priority SLA support</span></li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-white shrink-0" /> <span>REST API access</span></li>
            </ul>

            {user?.plan === 'organization' ? (
               <div className="w-full h-12 rounded-xl bg-zinc-800 text-white flex items-center justify-center text-sm font-bold cursor-default shadow-md border border-zinc-700">
                 Active Subscription
               </div>
             ) : (
               <Button
                 onClick={() => handleUpgrade('organization')}
                 className="w-full h-12 rounded-xl bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900 text-white text-sm font-bold transition-all"
               >
                 Contact Sales
               </Button>
             )}
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-20 flex items-center justify-center gap-12 text-zinc-500 text-sm font-medium"
        >
          <div className="flex flex-col items-center gap-2">
            <p className="text-3xl font-black text-white">50K+</p>
            <span className="uppercase tracking-widest text-[10px]">Analyses Run</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-3xl font-black text-white">98%</p>
            <span className="uppercase tracking-widest text-[10px]">Accuracy Rate</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-3xl font-black text-white">Top Tier</p>
            <span className="uppercase tracking-widest text-[10px]">Research Labs</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}