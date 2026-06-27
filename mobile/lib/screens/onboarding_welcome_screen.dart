import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../theme.dart';

class OnboardingWelcomeScreen extends StatelessWidget {
  const OnboardingWelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft, color: Colors.black54),
          onPressed: () => context.go('/'),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 48),
              Center(
                child: SvgPicture.asset('assets/HeartGuard_Logo.svg', height: 64),
              ),
              const SizedBox(height: 48),
              Text(
                'Welcome to HeartGuard',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 16),
              Text(
                'Let\'s personalize your journey. We\'ll ask a few questions to understand your heart health baseline.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600], fontSize: 16, height: 1.5),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: [
                    _buildStep(context, LucideIcons.user, 'Basic Info', 'Age, gender, and physical metrics.'),
                    const SizedBox(height: 16),
                    _buildStep(context, LucideIcons.activity, 'Lifestyle', 'Habits, diet, and activity levels.'),
                    const SizedBox(height: 16),
                    _buildStep(context, LucideIcons.clipboardList, 'Medical History', 'Conditions and family history.'),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: () => context.go('/onboarding/basic-info'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: const Text('Start Personalization'),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep(BuildContext context, IconData icon, String title, String desc) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppTheme.primary, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              Text(desc, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
            ],
          ),
        ),
      ],
    );
  }
}
