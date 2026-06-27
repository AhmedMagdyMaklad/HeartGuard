import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface OnboardingBasicInfoPageProps {}

const OnboardingBasicInfoPage: React.FC<OnboardingBasicInfoPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gender, date_of_birth: dob }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      navigate('/onboarding/lifestyle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen relative flex h-auto w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 md:px-10 py-4 bg-white dark:bg-slate-900 sticky top-0 z-50">
          <div className="flex items-center gap-3 text-primary">
            <div className="size-10 flex items-center justify-center p-0">
              <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight tracking-tight">HeartGuard</h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-colors">help_outline</span>
            <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex flex-1 justify-center py-8 px-4 md:py-12">
          <div className="layout-content-container flex flex-col max-w-[560px] flex-1">

            {/* Progress Section */}
            <motion.div
              className="flex flex-col gap-4 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex gap-6 justify-between items-end">
                <div>
                  <p className="text-primary text-sm font-bold uppercase tracking-wider">Step 1 of 3</p>
                  <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold">Basic Information</p>
                </div>
                <p className="text-slate-500 text-sm font-medium">33% Complete</p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '33%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              className="flex flex-col gap-3 mb-10"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">Let's get to know you</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">This information helps us provide more accurate heart health insights and personalized recommendations.</p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="material-symbols-outlined text-red-500 text-xl shrink-0">error</span>
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Form Card */}
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col gap-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Gender Selection */}
              <div className="flex flex-col gap-4">
                <label className="text-slate-900 dark:text-slate-100 text-base font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">person</span>
                  What is your gender?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`relative flex items-center justify-center gap-3 rounded-lg border-2 p-4 cursor-pointer hover:border-primary/50 transition-colors group ${gender === 'male' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'}`}>
                    <input className="hidden" name="gender" type="radio" value="male" checked={gender === 'male'} onChange={() => setGender('male')} />
                    <span className={`font-medium ${gender === 'male' ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>Male</span>
                  </label>
                  <label className={`relative flex items-center justify-center gap-3 rounded-lg border-2 p-4 cursor-pointer hover:border-primary/50 transition-colors group ${gender === 'female' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'}`}>
                    <input className="hidden" name="gender" type="radio" value="female" checked={gender === 'female'} onChange={() => setGender('female')} />
                    <span className={`font-medium ${gender === 'female' ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>Female</span>
                  </label>
                </div>
              </div>

              {/* Date of Birth Selection */}
              <div className="flex flex-col gap-4">
                <label className="text-slate-900 dark:text-slate-100 text-base font-semibold flex items-center gap-2" htmlFor="dob">
                  <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    required
                    className="w-full rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-transparent px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-0 outline-none transition-colors appearance-none"
                    id="dob"
                    name="dob"
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                  />
                </div>
                <p className="text-slate-500 text-xs italic">We use your age to calculate risk factors relative to your demographic.</p>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      Next Step
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            <motion.div
              className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Your data is encrypted and secure
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OnboardingBasicInfoPage;
