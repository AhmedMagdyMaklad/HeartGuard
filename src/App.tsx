import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import OnboardingWelcomePage from './components/OnboardingWelcomePage';
import OnboardingBasicInfoPage from './components/OnboardingBasicInfoPage';
import OnboardingLifestylePage from './components/OnboardingLifestylePage';
import OnboardingMedicalHistoryPage from './components/OnboardingMedicalHistoryPage';
import RiskAssessmentVitalsPage from './components/RiskAssessmentVitalsPage';
import RiskAssessmentEcgPage from './components/RiskAssessmentEcgPage';
import DashboardPage from './components/DashboardPage';
import RiskReportPage from './components/RiskReportPage';
import ChatbotPage from './components/ChatbotPage';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/onboarding/welcome" element={<ProtectedRoute><OnboardingWelcomePage /></ProtectedRoute>} />
      <Route path="/onboarding/basic-info" element={<ProtectedRoute><OnboardingBasicInfoPage /></ProtectedRoute>} />
      <Route path="/onboarding/lifestyle" element={<ProtectedRoute><OnboardingLifestylePage /></ProtectedRoute>} />
      <Route path="/onboarding/medical-history" element={<ProtectedRoute><OnboardingMedicalHistoryPage /></ProtectedRoute>} />
      <Route path="/risk-assessment/vitals" element={<ProtectedRoute><RiskAssessmentVitalsPage /></ProtectedRoute>} />
      <Route path="/risk-assessment/ecg" element={<ProtectedRoute><RiskAssessmentEcgPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      {/* Legacy redirect — keep for any bookmarked links */}
      <Route path="/dashboard-results" element={<Navigate to="/dashboard" replace />} />
      <Route path="/risk-report" element={<ProtectedRoute><RiskReportPage /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
      <Route path="*" element={<GuestRoute><LandingPage /></GuestRoute>} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
