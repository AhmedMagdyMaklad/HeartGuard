import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: Row(
          children: [
            SvgPicture.asset('assets/HeartGuard_Logo.svg', height: 28),
            const SizedBox(width: 8),
            Text(
              'HeartGuard',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primary,
                  ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {}, // Navigate to Login
            child: const Text('Log in'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHero(context),
            _buildFeatures(context),
            _buildHowItWorks(context),
            _buildCTA(context),
          ].animate(interval: 100.ms).fade(duration: 500.ms).slideY(begin: 0.1, curve: Curves.easeOutQuart),
        ),
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.sparkles, size: 16, color: AppTheme.primary),
                SizedBox(width: 8),
                Text(
                  'Now powered by Qwen2.5 72B Instruct for Medical Analysis',
                  style: TextStyle(
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          RichText(
            text: TextSpan(
              style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: Colors.black,
                    height: 1.2,
                  ),
              children: [
                const TextSpan(text: 'Predict and Prevent '),
                TextSpan(
                  text: 'Heart Disease ',
                  style: TextStyle(color: AppTheme.primary),
                ),
                const TextSpan(text: 'with AI-Powered Insights'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Medical-grade analysis for a healthier heart. Use our advanced AI to monitor risks, track clinical data, and receive personalized health recommendations based on global cardiovascular standards.',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              ElevatedButton(
                onPressed: () => context.go('/signup'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppTheme.primary,
                  side: const BorderSide(color: AppTheme.primary),
                  minimumSize: const Size(140, 56),
                ),
                child: const Text('Get Started'),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () => context.go('/login'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(140, 56),
                ),
                child: const Text('Sign In'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Row(
            children: [
              Text(
                'Trusted by 500+ Cardiologists worldwide',
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeatures(BuildContext context) {
    final features = [
      {'icon': LucideIcons.lineChart, 'title': 'AI Risk Prediction', 'desc': 'Predictive analytics using machine learning to identify potential heart issues.'},
      {'icon': LucideIcons.activity, 'title': 'Personalized Recs', 'desc': 'Actionable diet, exercise, and lifestyle advice tailored specifically to you.'},
      {'icon': LucideIcons.clipboardList, 'title': 'Test Tracking', 'desc': 'Securely log and monitor your clinical blood tests and ECG results.'},
      {'icon': LucideIcons.bot, 'title': 'Heart Chatbot', 'desc': '24/7 AI assistance powered by medical LLMs to answer your concerns.'},
    ];

    return Container(
      color: Colors.grey[50],
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: Column(
        children: [
          const Text(
            'CORE CAPABILITIES',
            style: TextStyle(
              color: AppTheme.primary,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Advanced Features for Your Heart Health',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 32),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 1,
            childAspectRatio: 2.5,
            mainAxisSpacing: 16,
            children: features.map((f) => _buildFeatureCard(f)).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(Map<String, dynamic> f) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(f['icon'] as IconData, color: AppTheme.primary, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  f['title'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                ),
                const SizedBox(height: 4),
                Text(
                  f['desc'] as String,
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHowItWorks(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: Column(
        children: [
          Text(
            'Your Path to a Healthier Heart',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 32),
          _buildStep(1, 'Create Account', 'Sign up securely and complete your basic health profile.'),
          _buildStep(2, 'Enter Results', 'Input your recent clinical data or sync with your provider.'),
          _buildStep(3, 'AI Prediction', 'Our neural networks analyze 50+ biomarkers instantly.'),
          _buildStep(4, 'Get Suggestions', 'Receive a personalized plan vetted by cardiologists.'),
        ],
      ),
    );
  }

  Widget _buildStep(int num, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.primary,
            radius: 14,
            child: Text(
              num.toString(),
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                const SizedBox(height: 4),
                Text(desc, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCTA(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          const Text(
            'Ready to prioritize your heart health?',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Join over 50,000 proactive individuals using HeartGuard.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[400], fontSize: 16),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () => context.go('/signup'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 56),
              backgroundColor: AppTheme.primary,
            ),
            child: const Text('Get Started Now', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
