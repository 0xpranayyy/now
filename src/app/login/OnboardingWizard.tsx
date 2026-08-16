'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { login, signup } from './actions';

type Step = 'welcome' | 'login_email' | 'login_password' | 'signup_email' | 'signup_password' | 'signup_details';

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>('welcome');
  const [direction, setDirection] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const navigate = (newStep: Step, dir: 1 | -1) => {
    setError(null);
    setDirection(dir);
    setStep(newStep);
  };

  const handleLoginSubmit = () => {
    if (!email || !password) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const res = await login(formData);
      if (res?.error) setError(res.error);
    });
  };

  const handleSignupSubmit = () => {
    if (!email || !password || !username || !displayName) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('username', username);
      formData.append('display_name', displayName);
      const res = await signup(formData);
      if (res?.error) setError(res.error);
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 bg-background h-[100dvh] overflow-hidden">
      
      {/* Dynamic Header/Back Button */}
      <div className="absolute top-12 left-6 z-50">
        <AnimatePresence>
          {step !== 'welcome' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => {
                if (step === 'login_email' || step === 'signup_email') navigate('welcome', -1);
                else if (step === 'login_password') navigate('login_email', -1);
                else if (step === 'signup_password') navigate('signup_email', -1);
                else if (step === 'signup_details') navigate('signup_password', -1);
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10 text-white"
            >
              <ChevronLeft size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm relative h-[400px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          
          {/* WELCOME SCREEN */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full flex flex-col items-center absolute"
            >
              <div className="w-32 h-32 bg-brand-500/20 rounded-full blur-3xl absolute -z-10" />
              <h1 className="text-5xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">NOW</h1>
              <p className="text-muted-foreground mb-12 font-medium">Enter the moment.</p>
              
              <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={() => navigate('signup_email', 1)}
                  className="w-full bg-white text-black hover:bg-white/90 font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  Create Account
                </button>
                <button 
                  onClick={() => navigate('login_email', 1)}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Log In
                </button>
              </div>
            </motion.div>
          )}

          {/* SHARED EMAIL INPUT */}
          {(step === 'login_email' || step === 'signup_email') && (
            <motion.div
              key="email"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full flex flex-col absolute"
            >
              <h2 className="text-2xl font-bold mb-2">What's your email?</h2>
              <p className="text-muted-foreground mb-8 text-sm">We'll use this to secure your account.</p>
              
              <input 
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-brand-500/80 transition-colors mb-6 shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email) {
                    navigate(step === 'login_email' ? 'login_password' : 'signup_password', 1);
                  }
                }}
              />
              
              <button 
                disabled={!email || !email.includes('@')}
                onClick={() => navigate(step === 'login_email' ? 'login_password' : 'signup_password', 1)}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              >
                Continue
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* LOGIN PASSWORD */}
          {step === 'login_password' && (
            <motion.div
              key="login_password"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full flex flex-col absolute"
            >
              <h2 className="text-2xl font-bold mb-2">Enter your password</h2>
              <p className="text-muted-foreground mb-8 text-sm">Welcome back to NOW.</p>
              
              <input 
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-brand-500/80 transition-colors mb-4 shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password) handleLoginSubmit();
                }}
              />

              {error && (
                <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
              )}
              
              <button 
                disabled={!password || isPending}
                onClick={handleLoginSubmit}
                className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                {isPending ? <Loader2 className="animate-spin" size={24} /> : 'Jump In'}
              </button>
            </motion.div>
          )}

          {/* SIGNUP PASSWORD */}
          {step === 'signup_password' && (
            <motion.div
              key="signup_password"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full flex flex-col absolute"
            >
              <h2 className="text-2xl font-bold mb-2">Create a password</h2>
              <p className="text-muted-foreground mb-8 text-sm">Make it at least 6 characters.</p>
              
              <input 
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-brand-500/80 transition-colors mb-6 shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.length >= 6) navigate('signup_details', 1);
                }}
              />
              
              <button 
                disabled={password.length < 6}
                onClick={() => navigate('signup_details', 1)}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              >
                Continue
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* SIGNUP DETAILS */}
          {step === 'signup_details' && (
            <motion.div
              key="signup_details"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full flex flex-col absolute"
            >
              <h2 className="text-2xl font-bold mb-2">Who are you?</h2>
              <p className="text-muted-foreground mb-8 text-sm">Pick your identity on the map.</p>
              
              <input 
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="Username (e.g. ghost_1)"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-brand-500/80 transition-colors mb-4 shadow-inner"
              />

              <input 
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name (e.g. The Ghost)"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-brand-500/80 transition-colors mb-4 shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && username && displayName) handleSignupSubmit();
                }}
              />

              {error && (
                <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
              )}
              
              <button 
                disabled={!username || !displayName || isPending}
                onClick={handleSignupSubmit}
                className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                {isPending ? <Loader2 className="animate-spin" size={24} /> : 'Complete Setup'}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
