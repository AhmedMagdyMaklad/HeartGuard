import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface RiskAssessmentEcgPageProps {}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const guidelines = [
  { title: 'Ensure good lighting', desc: 'Avoid shadows or glare on the paper surface.' },
  { title: 'Capture the full strip', desc: 'All wave patterns and text must be visible.' },
  { title: 'Lay paper flat', desc: 'Avoid folds or creases that distort the lines.' },
  { title: 'High resolution', desc: 'Use a minimum of 12MP camera for clear details.' },
];

interface Vitals {
  cholesterol: number;
  bmi: number;
  heart_rate: number;
  glucose: number;
  pulse_pressure: number;
}

const RiskAssessmentEcgPage: React.FC<RiskAssessmentEcgPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const vitals: Vitals | undefined = location.state?.vitals;

  useEffect(() => {
    if (!vitals) {
      navigate('/risk-assessment/vitals');
    }
  }, [vitals, navigate]);

  const initial = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!vitals) return;
    if (!selectedFile) {
      setError('Please upload an ECG image to continue. The AI model requires it to complete the assessment.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('cholesterol', String(vitals.cholesterol));
      formData.append('bmi', String(vitals.bmi));
      formData.append('heart_rate', String(vitals.heart_rate));
      formData.append('glucose', String(vitals.glucose));
      formData.append('pulse_pressure', String(vitals.pulse_pressure));

      const res = await fetch('/api/assessment', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit assessment');
      navigate('/risk-report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vitals) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4 text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="size-10 flex items-center justify-center p-0">
            <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">HeartGuard</h2>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:block text-right">
            <p className="text-xs text-slate-500 font-medium">Clinically Verified</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assessment Portal</p>
          </div>
          <div className="bg-primary rounded-full size-10 flex items-center justify-center text-white font-bold text-sm border-2 border-primary/20">
            {initial}
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-8 px-4 md:px-0">
        <div className="flex flex-col max-w-[640px] flex-1">

          {/* Progress */}
          <motion.div
            className="mb-8 flex flex-col gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Step 2 of 2</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">ECG Analysis</h3>
              </div>
              <span className="text-sm font-semibold text-slate-500">100% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '50%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Vitals Summary */}
          <motion.div
            className="mb-6 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-xl flex flex-wrap gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="w-full text-xs font-bold text-primary uppercase tracking-widest mb-1">Vitals from Step 1</p>
            {[
              { label: 'Cholesterol', value: `${vitals.cholesterol} mg/dL` },
              { label: 'BMI', value: vitals.bmi },
              { label: 'Heart Rate', value: `${vitals.heart_rate} BPM` },
              { label: 'Glucose', value: `${vitals.glucose} mg/dL` },
              { label: 'Pulse Pressure', value: `${vitals.pulse_pressure} mmHg` },
            ].map(v => (
              <div key={v.label} className="text-sm">
                <span className="text-slate-500 font-medium">{v.label}: </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{v.value}</span>
              </div>
            ))}
          </motion.div>

          {error && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form Card */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
              <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-2">Upload ECG Report</h1>
              <p className="text-slate-500 text-base">
                Upload a photo of your ECG strip. The AI model requires it to analyse your cardiac rhythm and produce a complete risk assessment.
              </p>
            </motion.div>

            <div className="p-6 md:p-8 flex flex-col gap-6">

              {/* Upload Area */}
              <motion.div variants={fadeUp}>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,application/pdf"
                />
                <div
                  className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed bg-slate-50 dark:bg-slate-800/50 px-6 py-10 md:py-14 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group ${selectedFile ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-700'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl">{selectedFile ? 'check_circle' : 'cloud_upload'}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-900 dark:text-slate-100 text-lg font-bold text-center">
                      {selectedFile ? selectedFile.name : 'Tap to upload or drag image here'}
                    </p>
                    <p className="text-slate-500 text-sm text-center">
                      {selectedFile
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready for AI analysis`
                        : 'Supported: JPG, PNG, PDF — Required, max 15MB'}
                    </p>
                  </div>
                  {!selectedFile && (
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-colors"
                    >
                      Select File
                    </button>
                  )}
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Guidelines */}
              <motion.div variants={fadeUp} className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Scanning Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guidelines.map((g, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                      <span className="material-symbols-outlined text-green-600 mt-0.5 text-lg">check_circle</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{g.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{g.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={fadeUp} className="mt-4 flex flex-col gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-16 flex items-center justify-center gap-2 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>AI Analyzing — please wait…</span>
                    </>
                  ) : (
                    <>
                      <span>Predict Risk with ECG</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate('/risk-assessment/vitals')}
                  disabled={isSubmitting}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span>Back to Vitals</span>
                </button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-slate-400 text-xs leading-relaxed">
              HeartGuard is a screening tool and does not provide medical diagnosis. Always consult a qualified healthcare professional.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default RiskAssessmentEcgPage;
