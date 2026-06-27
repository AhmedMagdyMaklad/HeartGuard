import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { brandAssets } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export interface RiskReportPageProps {}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

interface Assessment {
  id: string;
  cholesterol: number;
  bmi: number;
  heart_rate: number;
  glucose: number;
  pulse_pressure: number;
  ecg_file_url: string | null;
  risk_score: number;
  risk_level: 'low' | 'moderate' | 'high';
  created_at: string;
  // AI fields (null for legacy assessments)
  ecg_classification: string | null;
  tabular_risk: number | null;
  combined_risk_score: number | null;
  analysis_findings: string | null;
  diet_plan: string | null;
  exercise_rec: string | null;
  lifestyle_rec: string | null;
  medical_rec: string | null;
}

function parseAssessment(raw: Record<string, unknown>): Assessment {
  return {
    ...raw,
    cholesterol: Math.round(Number(raw.cholesterol)),
    bmi: Math.round(Number(raw.bmi) * 10) / 10,
    heart_rate: Math.round(Number(raw.heart_rate)),
    glucose: Math.round(Number(raw.glucose)),
    pulse_pressure: Math.round(Number(raw.pulse_pressure)),
    risk_score: Math.round(Number(raw.risk_score)),
    tabular_risk: raw.tabular_risk != null ? Number(raw.tabular_risk) : null,
    combined_risk_score: raw.combined_risk_score != null ? Number(raw.combined_risk_score) : null,
  } as Assessment;
}

function getMetricStatus(type: string, value: number) {
  switch (type) {
    case 'cholesterol':
      if (value >= 240) return { label: 'Elevated', color: 'red' };
      if (value >= 200) return { label: 'Borderline', color: 'amber' };
      return { label: 'Normal', color: 'green' };
    case 'bmi':
      if (value >= 30) return { label: 'Obese', color: 'red' };
      if (value >= 25) return { label: 'Overweight', color: 'amber' };
      if (value < 18.5) return { label: 'Underweight', color: 'amber' };
      return { label: 'Healthy', color: 'green' };
    case 'heart_rate':
      if (value > 100) return { label: 'Elevated', color: 'red' };
      if (value < 60) return { label: 'Low', color: 'amber' };
      return { label: 'Normal', color: 'green' };
    case 'glucose':
      if (value >= 126) return { label: 'Diabetic Range', color: 'red' };
      if (value >= 100) return { label: 'Pre-diabetic', color: 'amber' };
      if (value < 70) return { label: 'Low', color: 'amber' };
      return { label: 'Normal', color: 'green' };
    case 'pulse_pressure':
      if (value > 80) return { label: 'Elevated', color: 'red' };
      if (value > 60) return { label: 'High', color: 'amber' };
      if (value < 25) return { label: 'Low', color: 'amber' };
      return { label: 'Normal', color: 'green' };
    default:
      return { label: 'Normal', color: 'green' };
  }
}

function badgeClass(color: string) {
  if (color === 'red') return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400';
  if (color === 'amber') return 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500';
  return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
}

function riskColor(level: string) {
  if (level === 'high') return '#dc2626';
  if (level === 'moderate') return '#f59e0b';
  return '#16a34a';
}

function riskTextClass(level: string) {
  if (level === 'high') return 'text-red-600';
  if (level === 'moderate') return 'text-amber-500';
  return 'text-green-600';
}

function riskLabel(level: string) {
  if (level === 'high') return 'High Risk';
  if (level === 'moderate') return 'Moderate Risk';
  return 'Low Risk';
}

function shortEcgLabel(cls: string | null): { short: string; detail: string } | null {
  if (!cls) return null;
  const c = cls.toLowerCase();
  if (c.includes('history') || c.includes('hist')) return { short: 'MI History', detail: cls };
  if (c.includes('infarction') || (c.includes('mi') && !c.includes('history'))) return { short: 'Infarction', detail: cls };
  if (c.includes('abnormal') || c.includes('arrhythmia')) return { short: 'Arrhythmia', detail: cls };
  if (c.includes('normal')) return { short: 'Normal', detail: cls };
  return { short: cls, detail: cls };
}

// Fallback analysis (used only when AI fields are absent)
function generateFallbackAnalysis(a: Assessment): string {
  const elevated: string[] = [];
  if (a.cholesterol >= 240) elevated.push('cholesterol (Elevated)');
  else if (a.cholesterol >= 200) elevated.push('cholesterol (Borderline)');
  if (a.bmi >= 30) elevated.push('BMI (Obese)');
  else if (a.bmi >= 25) elevated.push('BMI (Overweight)');
  if (a.heart_rate > 100) elevated.push('heart rate (Elevated)');
  if (a.glucose >= 126) elevated.push('blood glucose (Diabetic Range)');
  else if (a.glucose >= 100) elevated.push('blood glucose (Pre-diabetic)');
  if (a.pulse_pressure > 80) elevated.push('pulse pressure (Elevated)');
  else if (a.pulse_pressure > 60) elevated.push('pulse pressure (High)');

  if (a.risk_level === 'high') {
    return `Based on your clinical data, the AI has identified a significant elevation in cardiovascular risk markers. ${elevated.length > 0 ? `The primary drivers are: ${elevated.join(', ')}.` : ''} Immediate lifestyle adjustments and medical consultation are strongly recommended.`;
  } else if (a.risk_level === 'moderate') {
    return `Your assessment shows a moderate cardiovascular risk profile. ${elevated.length > 0 ? `The following metrics are outside the optimal range: ${elevated.join(', ')}.` : 'Most metrics are within acceptable range.'} Proactive lifestyle changes can meaningfully reduce your risk.`;
  }
  return `Your cardiovascular markers are predominantly within healthy ranges. ${elevated.length > 0 ? `Minor concerns noted for: ${elevated.join(', ')}.` : ''} Continue your current healthy habits and schedule routine check-ins every 6–12 months.`;
}

function getRecommendationCards(a: Assessment) {
  const isHighRisk = a.risk_level === 'high';
  const isMod = a.risk_level === 'moderate';
  const bgClass = isHighRisk
    ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50'
    : isMod
    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50'
    : 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50';
  const iconClass = isHighRisk ? 'text-red-500' : isMod ? 'text-amber-500' : 'text-green-600';

  const fallbackDiet = a.cholesterol >= 200
    ? 'Adopt a low-saturated-fat diet. Increase soluble fibre (oats, legumes) and omega-3 fatty acids to help reduce LDL cholesterol.'
    : 'Maintain a heart-healthy diet rich in vegetables, whole grains, and lean proteins.';
  const fallbackExercise = a.bmi >= 25 || a.risk_level !== 'low'
    ? '150 min of moderate aerobic activity per week. Focus on Zone 2 training to improve cardiovascular efficiency and metabolic health.'
    : 'Maintain your active lifestyle. 150 min/week of moderate exercise is excellent for long-term heart health.';
  const fallbackLifestyle = 'Ensure 7–9 hours of quality sleep per night. Manage stress through mindfulness or relaxation techniques — chronic stress significantly raises cardiovascular risk.';
  const fallbackMedical = isHighRisk
    ? 'Schedule a follow-up with a cardiologist within the next 14 days to discuss lipid-lowering therapy and lifestyle intervention.'
    : isMod
    ? 'Review your diet and exercise plan with your GP. Consider a lipid panel retest in 3 months to track progress.'
    : 'Maintain your current routine. Schedule a routine check-up annually and retake this assessment in 6 months.';

  return [
    { icon: 'restaurant', title: 'Diet Plan', desc: a.diet_plan || fallbackDiet, bgClass, iconClass },
    { icon: 'fitness_center', title: 'Exercise', desc: a.exercise_rec || fallbackExercise, bgClass, iconClass },
    { icon: 'self_improvement', title: 'Lifestyle', desc: a.lifestyle_rec || fallbackLifestyle, bgClass, iconClass },
    { icon: 'medical_services', title: 'Medical', desc: a.medical_rec || fallbackMedical, bgClass, iconClass },
  ];
}

const RiskReportPage: React.FC<RiskReportPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initial = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?';

  useEffect(() => {
    fetch('/api/assessment/latest', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.assessment) navigate('/dashboard');
        else setAssessment(parseAssessment(data.assessment));
      })
      .catch(() => setError('Failed to load your report. Please refresh.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!assessment) return null;

  const circumference = 502;
  const recommendations = getRecommendationCards(assessment);
  const analysisText = assessment.analysis_findings || generateFallbackAnalysis(assessment);
  const hasAiData = !!assessment.analysis_findings;

  const metrics = [
    { key: 'cholesterol', label: 'Cholesterol', value: assessment.cholesterol, unit: 'mg/dL', type: 'cholesterol' },
    { key: 'bmi', label: 'BMI', value: assessment.bmi, unit: 'kg/m²', type: 'bmi' },
    { key: 'heart_rate', label: 'Heart Rate', value: assessment.heart_rate, unit: 'bpm', type: 'heart_rate' },
    { key: 'glucose', label: 'Glucose', value: assessment.glucose, unit: 'mg/dL', type: 'glucose' },
    { key: 'pulse_pressure', label: 'Pulse Pressure', value: assessment.pulse_pressure, unit: 'mmHg', type: 'pulse_pressure' },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 md:px-10 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="size-10 flex items-center justify-center hover:scale-105 transition-transform">
            <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight">HeartGuard</h2>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Medical AI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined mr-2 text-lg">dashboard</span>Dashboard
          </button>
          <div className="size-10 rounded-full border-2 border-primary/20 cursor-pointer overflow-hidden bg-primary flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-8 px-4 md:px-10">
        {error ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 max-w-lg mx-auto mt-8">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <motion.div
            className="flex flex-col max-w-[1024px] flex-1 gap-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >

            {/* Title Row */}
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Risk Assessment Report</h1>
                <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Generated on {new Date(assessment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ID: HG-{assessment.id.slice(0, 6).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined mr-2">download</span>Download PDF
                </button>
              </div>
            </motion.div>

            {/* Risk Score + AI Findings */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Gauge */}
              <motion.div variants={fadeUp} className="lg:col-span-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6">
                  {hasAiData ? 'AI Combined Risk Score' : 'Calculated Risk Score'}
                </p>

                <div className="relative flex items-center justify-center size-48 mb-6">
                  <svg className="size-full transform -rotate-90">
                    <circle className="text-slate-100 dark:text-slate-800" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12" />
                    <motion.circle
                      cx="96" cy="96" fill="transparent" r="80"
                      stroke={riskColor(assessment.risk_level)}
                      strokeDasharray={circumference}
                      strokeLinecap="round"
                      strokeWidth="12"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - (circumference * assessment.risk_score / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className={`text-5xl font-black leading-none ${riskTextClass(assessment.risk_level)}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                    >
                      {assessment.risk_score}%
                    </motion.span>
                    <span className={`font-bold text-sm mt-1 uppercase ${riskTextClass(assessment.risk_level)}`}>
                      {riskLabel(assessment.risk_level)}
                    </span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2">
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-600" />
                  <div className="flex w-full justify-between px-1 text-[10px] font-bold text-slate-400 uppercase">
                    <span>Low</span><span>Moderate</span><span className={riskTextClass(assessment.risk_level)}>High</span>
                  </div>
                </div>

                {/* ECG Classification (only when AI data exists) */}
                {shortEcgLabel(assessment.ecg_classification) && (() => {
                  const ecg = shortEcgLabel(assessment.ecg_classification)!;
                  return (
                    <div className="mt-6 w-full p-3 bg-primary/5 rounded-xl border border-primary/10 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ECG Classification</p>
                      <p className="text-base font-black text-primary">{ecg.short}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{ecg.detail}</p>
                    </div>
                  );
                })()}
              </motion.div>

              {/* AI Findings */}
              <motion.div variants={fadeUp} className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Analysis Findings</h3>
                    {hasAiData && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Powered by HeartGuard AI Model</span>
                    )}
                  </div>
                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                  <p>{analysisText}</p>
                  <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary mt-4">
                    <p className="text-sm italic font-medium text-slate-700 dark:text-slate-200">
                      "{assessment.medical_rec || recommendations.find(r => r.title === 'Medical')?.desc}"
                    </p>
                  </div>
                </div>

                {/* AI model sub-scores */}
                {hasAiData && assessment.tabular_risk != null && (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tabular Risk</p>
                      <p className={`text-xl font-black ${riskTextClass(assessment.risk_level)}`}>
                        {Math.round((assessment.tabular_risk ?? 0) * 100)}%
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">From health metrics</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Combined Score</p>
                      <p className={`text-xl font-black ${riskTextClass(assessment.risk_level)}`}>
                        {Math.round((assessment.combined_risk_score ?? 0) * 100)}%
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Metrics + ECG</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </section>

            {/* Metric Breakdown */}
            <motion.section variants={fadeUp}>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-1">Metric Breakdown</h3>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.map(m => {
                  const status = getMetricStatus(m.type, m.value);
                  return (
                    <div key={m.key} className="flex flex-col bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-slate-400 text-xs font-bold uppercase mb-2">{m.label}</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {m.value} <span className="text-xs font-medium text-slate-500">{m.unit}</span>
                      </span>
                      <span className={`mt-3 px-2 py-1 rounded-full text-[10px] font-bold w-fit uppercase ${badgeClass(status.color)}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
                {/* ECG card */}
                {(() => {
                  const ecg = shortEcgLabel(assessment.ecg_classification);
                  return (
                    <div className="flex flex-col bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-slate-400 text-xs font-bold uppercase mb-2">ECG</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-1">
                        {ecg ? ecg.short : 'On File'}
                      </span>
                      {ecg && ecg.short !== ecg.detail && (
                        <span className="text-[10px] text-slate-400 mt-1 leading-snug">{ecg.detail}</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.section>

            {/* Recommendations */}
            <motion.section variants={fadeUp}>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 px-1">Personalised Recommendations</h3>
              {hasAiData && (
                <p className="text-xs text-slate-400 px-1 mb-6 font-medium uppercase tracking-wider">Generated by AI based on your full health profile</p>
              )}
              {!hasAiData && <div className="mb-6" />}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((r, i) => (
                  <div key={i} className={`flex flex-col p-6 rounded-xl border hover:-translate-y-1 transition-transform ${r.bgClass}`}>
                    <span className={`material-symbols-outlined mb-3 text-2xl ${r.iconClass}`}>{r.icon}</span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{r.title}</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{r.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Action Buttons */}
            <motion.section variants={fadeUp} className="flex flex-col md:flex-row gap-4 py-6 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button
                onClick={() => navigate('/chatbot')}
                className="flex-1 flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined mr-2">chat_bubble</span>Ask Heart Health AI
              </button>
              <button
                onClick={() => navigate('/risk-assessment/vitals')}
                className="flex-1 flex items-center justify-center rounded-lg h-12 px-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-base hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">refresh</span>New Assessment
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 flex items-center justify-center rounded-lg h-12 px-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-base hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined mr-2">arrow_back</span>Dashboard
              </button>
            </motion.section>

          </motion.div>
        )}
      </main>

      <footer className="mt-auto flex flex-col items-center gap-4 py-10 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
          <span className="material-symbols-outlined text-sm">lock</span>
          Your health data is encrypted using AES-256 standards.
        </div>
        <p className="text-slate-500 text-[10px] max-w-2xl px-6 leading-relaxed">
          Disclaimer: This AI-powered report is for informational purposes only and does not constitute medical advice. Always seek the advice of your physician or other qualified health provider.
        </p>
        <div className="text-slate-400 text-xs pt-4">© {new Date().getFullYear()} HeartGuard Medical Systems Inc. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default RiskReportPage;
