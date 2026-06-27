import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { landingPageData, brandAssets } from '../data/mockData';
import ThemeToggle from './ThemeToggle';

export interface LandingPageProps {}

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LandingPage: React.FC<LandingPageProps> = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-10 flex items-center justify-center p-0">
                <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HeartGuard</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors">How It Works</a>
              <a href="#trust" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors">Trust</a>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login" className="hidden sm:flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                Log in
              </Link>
              <Link to="/signup" className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-bold shadow-sm hover:bg-primary/90 transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="flex flex-col gap-8"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Now powered by Qwen2.5 72B Instruct for Medical Analysis
                </motion.div>
                <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                  Predict and Prevent <span className="text-primary">Heart Disease</span> with AI-Powered Insights
                </motion.h1>
                <motion.p variants={fadeIn} className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                  Medical-grade analysis for a healthier heart. Use our advanced AI to monitor risks, track clinical data, and receive personalized health recommendations based on global cardiovascular standards.
                </motion.p>
                <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
                  <Link to="/signup" className="bg-primary text-white rounded-xl px-8 py-4 text-lg font-bold shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all">
                    Get Started Free
                  </Link>
                </motion.div>
                <motion.div variants={fadeIn} className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    {landingPageData.hero.doctors.map((doc, idx) => (
                      <img key={idx} alt={`Doctor ${idx + 1}`} className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 object-cover" src={doc} />
                    ))}
                  </div>
                  <span>Trusted by 500+ Cardiologists worldwide</span>
                </motion.div>
              </motion.div>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <img alt="AI Interface" className="w-full h-auto object-cover" src={landingPageData.hero.mainImg} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Core Capabilities</h2>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">Advanced Features for Your Heart Health</h3>
              <p className="text-slate-600 dark:text-slate-400">Our suite of medical-grade tools provides comprehensive insights into your cardiovascular well-being using the latest in biometric analysis.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {landingPageData.features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white dark:bg-background-dark" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">Your Path to a Healthier Heart</h3>
            </motion.div>
            <div className="relative">
              <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800"></div>
              <div className="grid lg:grid-cols-4 gap-12 lg:gap-8">
                {landingPageData.howItWorks.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    className="relative flex flex-col items-center text-center group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <div className="w-24 h-24 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 rounded-full flex items-center justify-center text-primary shadow-xl z-10 mb-6 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-4xl">{step.icon}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                    <p className="text-slate-500 text-sm">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Security Section */}
        <section className="py-20 bg-primary text-white overflow-hidden relative" id="trust">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-3xl sm:text-4xl font-black mb-6">Your Privacy is Our Primary Responsibility</h3>
                <p className="text-white/80 text-lg mb-8 leading-relaxed">
                  We understand that medical data is the most sensitive information you own. HeartGuard is built from the ground up with security as the foundation.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-300">verified</span>
                    <span>HIPAA &amp; GDPR Compliant infrastructure</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-300">verified</span>
                    <span>End-to-end AES-256 bit encryption</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-300">verified</span>
                    <span>Anonymized data for AI training</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div 
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <span className="material-symbols-outlined text-3xl mb-4">shield</span>
                  <h5 className="font-bold mb-1">Secure Storage</h5>
                  <p className="text-sm text-white/70">Encrypted databases with multi-layer firewalls.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <span className="material-symbols-outlined text-3xl mb-4">lock</span>
                  <h5 className="font-bold mb-1">Zero-Knowledge</h5>
                  <p className="text-sm text-white/70">We never sell or share your data with third parties.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <span className="material-symbols-outlined text-3xl mb-4">gpp_good</span>
                  <h5 className="font-bold mb-1">Medical Ethics</h5>
                  <p className="text-sm text-white/70">Vetted by an independent medical ethics board.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  <span className="material-symbols-outlined text-3xl mb-4">sync_saved_locally</span>
                  <h5 className="font-bold mb-1">Self-Custody</h5>
                  <p className="text-sm text-white/70">Export or delete all your data at any time.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 lg:p-16 text-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-6">Ready to prioritize your heart health?</h3>
                <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">Join over 50,000 proactive individuals who are using HeartGuard to stay ahead of cardiovascular risks.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup" className="bg-primary text-white rounded-xl px-10 py-4 text-lg font-bold shadow-lg hover:bg-primary/90 transition-all">Start Your Risk Assessment</Link>
                  <Link to="/login" className="bg-white text-slate-900 rounded-xl px-10 py-4 text-lg font-bold hover:bg-slate-100 transition-all">Speak to a Specialist Chatbot</Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="size-14 flex items-center justify-center p-0">
                  <img src={brandAssets.logo} alt="HeartGuard Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HeartGuard</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                AI-powered cardiovascular health monitoring and risk prediction platform. Not a replacement for professional medical diagnosis.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-xl">share</span></button>
                <button className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-xl">rss_feed</span></button>
              </div>
            </div>
            <div>
              <h5 className="text-slate-900 dark:text-white font-bold mb-6">Product</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="hover:text-primary transition-colors" href="#">Risk Assessment</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Monitoring Tools</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">For Clinicians</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">API Access</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-slate-900 dark:text-white font-bold mb-6">Resources</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="hover:text-primary transition-colors" href="#">Medical Blog</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Research Papers</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Cardiologist Directory</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Support Center</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-slate-900 dark:text-white font-bold mb-6">Company</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Our Team</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">© 2024 HeartGuard AI Technologies Inc. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-slate-500">
              <span>English (US)</span>
              <a className="hover:text-primary transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
