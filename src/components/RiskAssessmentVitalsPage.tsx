import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface RiskAssessmentVitalsPageProps {}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fields = [
  { name: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', placeholder: '180', hint: 'Normal range: 125–200 mg/dL', min: 1, step: 1 },
  { name: 'bmi', label: 'BMI', unit: 'kg/m²', placeholder: '24.5', hint: 'Normal: 18.5–24.9', min: 1, step: 0.1 },
  { name: 'heartRate', label: 'Heart Rate', unit: 'BPM', placeholder: '72', hint: 'Normal resting: 60–100 BPM', min: 1, step: 1 },
  { name: 'glucose', label: 'Glucose', unit: 'mg/dL', placeholder: '95', hint: 'Fasting normal: 70–99 mg/dL', min: 1, step: 1 },
  { name: 'pulsePressure', label: 'Pulse Pressure', unit: 'mmHg', placeholder: '40', hint: 'Normal: 25–60 mmHg', min: 1, step: 1 },
];

const RiskAssessmentVitalsPage: React.FC<RiskAssessmentVitalsPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    cholesterol: '',
    bmi: '',
    heartRate: '',
    glucose: '',
    pulsePressure: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initial = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      const val = formData[f.name as keyof typeof formData];
      if (!val || isNaN(Number(val)) || Number(val) <= 0) {
        newErrors[f.name] = `${f.label} is required and must be a positive number`;
      }
    });
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    navigate('/risk-assessment/ecg', {
      state: {
        vitals: {
          cholesterol: Number(formData.cholesterol),
          bmi: Number(formData.bmi),
          heart_rate: Number(formData.heartRate),
          glucose: Number(formData.glucose),
          pulse_pressure: Number(formData.pulsePressure),
        }
      }
    });
  };

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
          <div className="bg-primary rounded-full size-10 flex items-center justify-center border-2 border-primary/20 text-white font-bold text-sm">
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
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Step 1 of 2</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Health Metrics</h3>
              </div>
              <span className="text-sm font-semibold text-slate-500">50% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '25%' }}
                animate={{ width: '50%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp} className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
              <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-2">Heart Risk Assessment</h1>
              <p className="text-slate-500 text-base">Enter your current health metrics to receive a personalised heart disease risk prediction.</p>
            </motion.div>

            <div className="p-6 md:p-8 flex flex-col gap-6">

              {/* Cholesterol - full width */}
              <motion.div variants={fadeUp} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold uppercase tracking-wide">
                    Total Cholesterol
                  </label>
                  <span className="material-symbols-outlined text-slate-400 text-[20px] cursor-help" title="Normal range: 125–200 mg/dL">info</span>
                </div>
                <div className="relative">
                  <input
                    name="cholesterol"
                    value={formData.cholesterol}
                    onChange={handleChange}
                    className={`w-full h-14 pl-4 pr-16 rounded-lg border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg font-medium ${errors.cholesterol ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                    placeholder="e.g. 180"
                    type="number"
                    min={1}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">mg/dL</span>
                </div>
                {errors.cholesterol && <p className="text-xs text-red-500">{errors.cholesterol}</p>}
              </motion.div>

              {/* 2-col grid for remaining fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.slice(1).map(f => (
                  <motion.div key={f.name} variants={fadeUp} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold uppercase tracking-wide">{f.label}</label>
                      <span className="material-symbols-outlined text-slate-400 text-[20px] cursor-help" title={f.hint}>info</span>
                    </div>
                    <div className="relative">
                      <input
                        name={f.name}
                        value={formData[f.name as keyof typeof formData]}
                        onChange={handleChange}
                        className={`w-full h-14 pl-4 pr-16 rounded-lg border bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg font-medium ${errors[f.name] ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
                        placeholder={f.placeholder}
                        type="number"
                        min={f.min}
                        step={f.step}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">{f.unit}</span>
                    </div>
                    {errors[f.name] && <p className="text-xs text-red-500">{errors[f.name]}</p>}
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <motion.div variants={fadeUp} className="mt-4 flex flex-col gap-4">
                <button
                  onClick={handleNext}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <span>Next: Upload ECG</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span>Back to Dashboard</span>
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
              <a className="text-primary hover:underline font-medium ml-1 cursor-pointer">Learn more.</a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default RiskAssessmentVitalsPage;
