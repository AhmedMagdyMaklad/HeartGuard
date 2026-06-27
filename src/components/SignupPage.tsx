import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { brandAssets, signupPageData } from "../data/mockData";
import ThemeToggle from "./ThemeToggle";

export interface SignupPageProps {}

interface CreatedUser {
  email: string;
  full_name: string | null;
}

const SignupPage: React.FC<SignupPageProps> = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (!createdUser) return;
    if (countdown === 0) {
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [createdUser, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      setCreatedUser({
        email: data.user.email,
        full_name: data.user.full_name,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <div className="size-10 flex items-center justify-center p-0">
            <img
              src={brandAssets.logo}
              alt="HeartGuard Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-extrabold tracking-tight">
            HeartGuard
          </h2>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="hidden sm:inline text-sm text-slate-500 dark:text-slate-400">
            Already have an account?
          </span>
          <Link
            to="/login"
            className="text-sm font-bold text-primary hover:underline"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-accent-pink/30 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-60" />

        <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side: Content */}
          <motion.div
            className="hidden lg:flex flex-col gap-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent-pink text-primary text-xs font-bold uppercase tracking-wider mb-4">
                New Era of Care
              </span>
              <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100">
                Smart Monitoring for a{" "}
                <span className="text-primary">Healthier Heart.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-md">
                Join thousands of users who trust HeartGuard for real-time
                cardiac insights and proactive health management.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary mb-2">
                  monitoring
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Real-time Data
                </h4>
                <p className="text-sm text-slate-500">
                  Sync with your wearable devices instantly.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-primary mb-2">
                  security
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Secure Privacy
                </h4>
                <p className="text-sm text-slate-500">
                  Your health data is encrypted and private.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {signupPageData.testimonials.map((img, idx) => (
                  <img
                    key={idx}
                    className="size-10 rounded-full border-2 border-background-light object-cover"
                    alt={`User ${idx + 1}`}
                    src={img}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Joined by 12,000+ users this month
              </p>
            </div>
          </motion.div>

          {/* Right Side: Form or Success */}
          <AnimatePresence mode="wait">
            {createdUser ? (
              /* Success Confirmation */
              <motion.div
                key="success"
                className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-xl shadow-primary/5 border border-slate-100 dark:border-slate-800 w-full max-w-md mx-auto flex flex-col items-center text-center gap-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                {/* Animated checkmark */}
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                >
                  <motion.span
                    className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    check_circle
                  </motion.span>
                </motion.div>

                <motion.div
                  className="flex flex-col gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Account Created!
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Welcome to HeartGuard
                    {createdUser.full_name
                      ? `, ${createdUser.full_name.split(" ")[0]}`
                      : ""}
                    ! Your account has been created for{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {createdUser.email}
                    </span>
                    .
                  </p>
                </motion.div>

                {/* Info box */}
                <motion.div
                  className="w-full flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="material-symbols-outlined text-primary text-xl shrink-0">
                    info
                  </span>
                  <p className="text-sm text-primary text-left leading-relaxed">
                    After logging in, you'll complete a short health profile and
                    initial assessment so we can personalise your heart risk
                    insights.
                  </p>
                </motion.div>

                <motion.div
                  className="w-full flex flex-col gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                  >
                    <span>Sign In Now</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <p className="text-xs text-slate-400">
                    Redirecting automatically in{" "}
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {countdown}s
                    </span>
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              /* Sign Up Form */
              <motion.div
                key="form"
                className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-xl shadow-primary/5 border border-slate-100 dark:border-slate-800 w-full max-w-md mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Create Account
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Start your 30-day free trial today.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <span className="material-symbols-outlined text-red-500 text-xl shrink-0">
                      error
                    </span>
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                        person
                      </span>
                      <input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                        placeholder="John Doe"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                        mail
                      </span>
                      <input
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                        placeholder="john@example.com"
                        type="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                        lock
                      </span>
                      <input
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                        placeholder="Min. 8 characters"
                        type={showPassword ? "text" : "password"}
                        minLength={8}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Policy Checkbox */}
                  <div className="flex items-start gap-3 py-2">
                    <div className="flex items-center h-5">
                      <input
                        required
                        className="size-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-slate-50 dark:bg-slate-800"
                        id="terms"
                        type="checkbox"
                      />
                    </div>
                    <label
                      className="text-sm text-slate-600 dark:text-slate-400 leading-tight"
                      htmlFor="terms"
                    >
                      I agree to the{" "}
                      <a
                        className="text-primary font-semibold hover:underline"
                        href="#"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        className="text-primary font-semibold hover:underline"
                        href="#"
                      >
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?
                  <Link
                    to="/login"
                    className="text-primary font-bold hover:underline ml-1"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 dark:text-slate-600 text-sm">
        <p>© 2024 HeartGuard Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignupPage;
