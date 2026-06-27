import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface OnboardingWelcomePageProps {}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const OnboardingWelcomePage: React.FC<OnboardingWelcomePageProps> = () => {
  const { user } = useAuth();
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : user?.email?.split('@')[0] ?? 'there';
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen relative flex w-full flex-col overflow-x-hidden">
      
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 md:px-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <div className="size-10 flex items-center justify-center p-0">
            <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">HeartGuard</h2>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</span>
            <span className="text-sm font-medium">{user?.full_name ?? user?.email ?? ''}</span>
          </div>
          <div className="size-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{initials}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[600px] bg-[radial-gradient(circle_at_center,#FFD8D8_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,#4c1d95_0%,transparent_70%)] -z-10 opacity-40 rounded-full blur-3xl"></div>
        
        <motion.div 
          className="max-w-3xl w-full text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
        >
          {/* Welcome Illustration / Icon */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-accent-pink/30 rounded-full blur-xl"></div>
              <div className="relative size-24 md:size-32 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center border border-primary/10">
                <span className="material-symbols-outlined text-5xl md:text-6xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>health_metrics</span>
              </div>
            </div>
          </motion.div>
          
          {/* Headline */}
          <motion.div variants={fadeUp} className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1]">
              Welcome to HeartGuard, <span className="text-primary">{firstName}!</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Your journey to a healthier heart starts here. We use clinical-grade AI to monitor your cardiovascular well-being and provide proactive insights for a longer, more vibrant life.
            </p>
          </motion.div>
          
          {/* Main Action Card */}
          <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl shadow-primary/5 border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-accent-pink/40 rounded-full">
              <span className="material-symbols-outlined text-red-500 text-sm">emergency_home</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Initial Assessment</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Establish your baseline</h3>
              <p className="text-slate-500 dark:text-slate-400">Takes only 2 minutes. Our AI will analyze your profile to create a personalized heart-health roadmap.</p>
            </div>
            <div className="w-full flex flex-col gap-4 mt-2">
              <Link to="/onboarding/basic-info" className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group">
                Take Your First Risk Assessment
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>
          </motion.div>

          {/* Reassurance Badges */}
          <motion.div variants={fadeUp} className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
              <span className="text-xs font-bold uppercase tracking-tighter text-slate-500">HIPAA Compliant</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
              <span className="text-xs font-bold uppercase tracking-tighter text-slate-500">Advanced AI Models</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl">medical_services</span>
              <span className="text-xs font-bold uppercase tracking-tighter text-slate-500">Physician Reviewed</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="p-8 text-center text-slate-400 dark:text-slate-600 text-sm mt-auto">
        <p>© {new Date().getFullYear()} HeartGuard AI Health Systems. For informational purposes only.</p>
      </footer>
    </div>
  );
};

export default OnboardingWelcomePage;
