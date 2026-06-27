import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'screens/landing_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/onboarding_welcome_screen.dart';
import 'screens/onboarding_basic_info_screen.dart';
import 'screens/onboarding_lifestyle_screen.dart';
import 'screens/onboarding_medical_history_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/assessment_vitals_screen.dart';
import 'screens/assessment_ecg_screen.dart';
import 'screens/risk_report_screen.dart';
import 'screens/chatbot_screen.dart';
import 'models/assessment_data.dart';

GoRouter buildRouter(AuthProvider auth) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: auth,
    redirect: (context, state) {
      if (auth.status == AuthStatus.unknown) return null;

      final loggedIn = auth.status == AuthStatus.authenticated;
      final loc = state.matchedLocation;
      final goingToAuth = loc == '/login' || loc == '/signup' || loc == '/';
      final goingToOnboarding = loc.startsWith('/onboarding');

      if (!loggedIn && !goingToAuth) return '/login';
      if (loggedIn && goingToAuth) {
        if (!auth.onboardingComplete) return '/onboarding';
        return '/dashboard';
      }
      if (loggedIn && !auth.onboardingComplete && !goingToOnboarding) {
        return '/onboarding';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const LandingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/chatbot',
        builder: (context, state) => const ChatbotScreen(),
      ),
      GoRoute(
        path: '/risk-report',
        builder: (context, state) {
          final data = (state.extra as Map<String, dynamic>?) ?? {};
          return RiskReportScreen(data: data);
        },
      ),
      GoRoute(
        path: '/assessment/vitals',
        builder: (context, state) => const AssessmentVitalsScreen(),
      ),
      GoRoute(
        path: '/assessment/ecg',
        builder: (context, state) {
          final vitalsMap = state.extra as Map<String, double>;
          return AssessmentEcgScreen(assessment: AssessmentData.fromMap(vitalsMap));
        },
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingWelcomeScreen(),
        routes: [
          GoRoute(
            path: 'basic-info',
            builder: (context, state) => const OnboardingBasicInfoScreen(),
          ),
          GoRoute(
            path: 'lifestyle',
            builder: (context, state) => const OnboardingLifestyleScreen(),
          ),
          GoRoute(
            path: 'medical-history',
            builder: (context, state) => const OnboardingMedicalHistoryScreen(),
          ),
        ],
      ),
    ],
  );
}
