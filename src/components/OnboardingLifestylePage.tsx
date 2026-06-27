import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface OnboardingLifestylePageProps {}

const OnboardingLifestylePage: React.FC<OnboardingLifestylePageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cigarettes, setCigarettes] = useState<number | ''>(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  const handleNext = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding/lifestyle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cigarettes_per_day: Number(cigarettes) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save lifestyle data');
      navigate('/onboarding/medical-history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/basic-info');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-display">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">

          {/* Header/Top Nav */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 md:px-10 py-4 bg-white dark:bg-slate-900 sticky top-0 z-50">
            <div className="flex items-center gap-3 text-primary">
              <div className="size-10 flex items-center justify-center p-0">
                <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">HeartGuard</h2>
            </div>
            <ThemeToggle />
            <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{initials}</span>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center py-8 md:py-16 px-4">
            <div className="w-full max-w-[640px] flex flex-col gap-8">

              {/* Progress Section */}
              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">Step 2 of 3</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">66% Complete</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <motion.div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    initial={{ width: '33%' }}
                    animate={{ width: '66%' }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </motion.div>

              {/* Intro Text */}
              <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-bold tracking-tight">Tell us about your lifestyle</h1>
                <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">Your daily habits play a key role in cardiovascular health.</p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <span className="material-symbols-outlined text-red-500 text-xl shrink-0">error</span>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {/* Onboarding Card */}
              <motion.div
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col gap-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Cigarettes Input Section */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-900 dark:text-white text-lg font-semibold">Average Cigarettes per day</label>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Be as accurate as possible for the best health risk assessment.</p>
                  </div>

                  {/* Slider Component */}
                  <div className="flex flex-col gap-4 py-4">
                    <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary/40 rounded-full transition-all"
                        style={{ width: `${Math.min((Number(cigarettes) || 0) / 40 * 100, 100)}%` }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="40"
                        className="absolute top-1/2 -translate-y-1/2 w-full opacity-0 cursor-pointer h-8"
                        value={cigarettes === '' ? 0 : cigarettes}
                        onChange={e => setCigarettes(Number(e.target.value))}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 size-6 bg-primary border-4 border-white dark:border-slate-900 rounded-full shadow-lg pointer-events-none transition-all"
                        style={{ left: `calc(${Math.min((Number(cigarettes) || 0) / 40 * 100, 100)}% - 12px)` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-tighter px-1">
                      <span>0</span>
                      <span>10</span>
                      <span>20</span>
                      <span>30</span>
                      <span>40+</span>
                    </div>
                  </div>

                  {/* Manual Input */}
                  <div className="flex flex-col gap-2">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Or enter exact number</span>
                    <div className="relative">
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                        placeholder="e.g. 5"
                        type="number"
                        min="0"
                        max="100"
                        value={cigarettes}
                        onChange={e => setCigarettes(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">/ day</div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                  <motion.div
                    className="flex gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10 overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="material-symbols-outlined text-primary text-xl shrink-0">info</span>
                    <p className="text-primary text-sm leading-relaxed">
                      Studies show that even a small reduction in daily cigarette consumption can significantly lower heart disease risk within the first year.
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <button
                  onClick={handleBack}
                  className="w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full sm:w-auto sm:flex-[2] flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      Next Step
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </main>

          <footer className="py-8 px-4 text-center">
            <p className="text-slate-400 text-xs">© {new Date().getFullYear()} HeartGuard Health. All medical data is encrypted and secure.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLifestylePage;
