import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { brandAssets, loginPageData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);

      // Check if the user has completed onboarding
      const statusRes = await fetch('/api/onboarding/status', { credentials: 'include' });
      const statusData = await statusRes.json();

      if (!statusData.profile) {
        // First-time user — no profile yet, send to onboarding
        navigate('/onboarding/welcome');
      } else {
        // Returning user — profile exists, go to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFCFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 font-display relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">

        {/* Left Side: Login Form */}
        <motion.div
          className="p-8 lg:p-16 flex flex-col justify-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center gap-2 mb-10 w-fit cursor-pointer group">
            <div className="size-14 flex items-center justify-center p-0">
              <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">HeartGuard</h1>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400">Enter your credentials to access your heart health dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-red-500 text-xl shrink-0">error</span>
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot Password?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">Stay logged in for 30 days</label>
            </div>

            {/* Action Button */}
            <button
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              New to HeartGuard?
              <Link to="/signup" className="text-primary font-bold hover:underline ml-1">Create an Account</Link>
            </p>
          </div>

          <div className="mt-12 flex justify-center gap-6 text-xs text-slate-400">
            <a className="hover:text-slate-600 dark:hover:text-slate-300" href="#">Privacy Policy</a>
            <a className="hover:text-slate-600 dark:hover:text-slate-300" href="#">Terms of Service</a>
            <a className="hover:text-slate-600 dark:hover:text-slate-300" href="#">Help Center</a>
          </div>
        </motion.div>

        {/* Right Side: Illustration & Branding */}
        <motion.div
          className="hidden lg:flex relative bg-slate-50 dark:bg-slate-800/50 items-center justify-center p-12 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute top-0 right-0 p-10 opacity-10 text-primary">
            <span className="material-symbols-outlined text-9xl">ecg_heart</span>
          </div>
          <div className="absolute bottom-0 left-0 p-10 opacity-10 text-primary">
            <span className="material-symbols-outlined text-9xl">monitor_heart</span>
          </div>

          <div className="relative z-10 w-full max-w-md text-center group">
            <div className="mb-8 relative inline-block group-hover:scale-105 transition-transform duration-500">
              <div
                className="w-72 h-72 rounded-full bg-primary/5 flex items-center justify-center mx-auto border-4 border-white dark:border-slate-700 shadow-2xl overflow-hidden"
                style={{ backgroundImage: `url('${loginPageData.heroImg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-700 p-4 rounded-xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-600"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-lg">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">BPM Range</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">72 - 84</p>
                </div>
              </motion.div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Precision Monitoring for Your Heart</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              HeartGuard uses advanced AI to track your cardiovascular health in real-time, providing actionable insights to keep your heart strong.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-2">verified_user</span>
                <p className="text-sm font-bold dark:text-slate-200">HIPAA Compliant</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-2">bolt</span>
                <p className="text-sm font-bold dark:text-slate-200">Instant Analysis</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#083fb4 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
