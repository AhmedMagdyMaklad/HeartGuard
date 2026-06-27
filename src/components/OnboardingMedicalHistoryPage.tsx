import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface OnboardingMedicalHistoryPageProps {}

const conditionsList = [
  'Hypertension',
  'Diabetes',
  'Stroke',
  'High Blood Pressure',
];

const OnboardingMedicalHistoryPage: React.FC<OnboardingMedicalHistoryPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [hasTestResults, setHasTestResults] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const handleNext = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/onboarding/medical-history', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conditions: selectedConditions, has_test_results: hasTestResults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save medical history');
      if (hasTestResults) {
        navigate('/risk-assessment/vitals');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/lifestyle');
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
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">Step 3 of 3</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">100% Complete</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <motion.div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    initial={{ width: '66%' }}
                    animate={{ width: '100%' }}
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
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-bold tracking-tight">Your Medical History</h1>
                <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">Previous health conditions help us assess your risk more accurately and tailor your wellness plan.</p>
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
                {/* Conditions Grid */}
                <div className="flex flex-col gap-4">
                  <label className="text-slate-900 dark:text-white text-lg font-semibold mb-2">Select any existing conditions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conditionsList.map((condition, idx) => (
                      <motion.label
                        key={condition}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition-all ${
                          selectedConditions.includes(condition) ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                      >
                        <span className="text-slate-900 dark:text-slate-100 font-medium text-sm">{condition}</span>
                        <input
                          className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0 transition-all"
                          type="checkbox"
                          checked={selectedConditions.includes(condition)}
                          onChange={() => toggleCondition(condition)}
                        />
                      </motion.label>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                {/* Test Results Toggle */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-slate-900 dark:text-white font-semibold text-base">Medical Test Results</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">After completing this profile, you will be prompted to enter your specific clinical laboratory results.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={hasTestResults}
                      onChange={() => setHasTestResults(!hasTestResults)}
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                  </label>
                </div>

                <motion.div
                  className="flex gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10 overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="material-symbols-outlined text-primary text-xl shrink-0">verified_user</span>
                  <p className="text-primary text-sm leading-relaxed pb-1">
                    All medical history is strictly confidential, encrypted, and HIPAA compliant.
                  </p>
                </motion.div>
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
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
                      Complete Profile
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">check_circle</span>
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

export default OnboardingMedicalHistoryPage;
