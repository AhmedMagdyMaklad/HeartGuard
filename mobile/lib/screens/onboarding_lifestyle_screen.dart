import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import '../theme.dart';
import '../services/onboarding_service.dart';

class OnboardingLifestyleScreen extends StatefulWidget {
  const OnboardingLifestyleScreen({super.key});

  @override
  State<OnboardingLifestyleScreen> createState() => _OnboardingLifestyleScreenState();
}

class _OnboardingLifestyleScreenState extends State<OnboardingLifestyleScreen> {
  String? _smokingStatus;
  double _cigarettesPerDay = 0;
  bool _isLoading = false;

  Future<void> _handleContinue() async {
    setState(() => _isLoading = true);

    final cigarettes = (_smokingStatus == 'Non-smoker' || _smokingStatus == null)
        ? 0
        : _cigarettesPerDay.toInt();

    await OnboardingService.saveLifestyle(cigarettesPerDay: cigarettes);

    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/onboarding/medical-history');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Lifestyle Habits'),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(4),
          child: LinearProgressIndicator(value: 0.66, backgroundColor: Color(0xFFE2E8F0)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Your daily habits', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            Text(
              'Help us understand how your lifestyle impacts your heart health.',
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
            const SizedBox(height: 32),
            _buildSectionTitle('Smoking Status', LucideIcons.info),
            const SizedBox(height: 12),
            _buildSelectableOption('Non-smoker', 'Never or quit long ago', _smokingStatus, (v) => setState(() => _smokingStatus = v)),
            _buildSelectableOption('Occasional', 'Socially or rarely', _smokingStatus, (v) => setState(() => _smokingStatus = v)),
            _buildSelectableOption('Regular', 'Daily or frequently', _smokingStatus, (v) => setState(() => _smokingStatus = v)),

            if (_smokingStatus == 'Occasional' || _smokingStatus == 'Regular') ...[
              const SizedBox(height: 32),
              _buildSectionTitle('Average Cigarettes per day', LucideIcons.cigarette),
              const SizedBox(height: 8),
              Text(
                'Be as accurate as possible for the best health risk assessment.',
                style: TextStyle(color: Colors.grey[500], fontSize: 13),
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Daily Count', style: TextStyle(fontWeight: FontWeight.w600)),
                        Text('${_cigarettesPerDay.toInt()} / day',
                            style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 18)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Slider(
                      value: _cigarettesPerDay,
                      min: 0,
                      max: 40,
                      divisions: 40,
                      activeColor: AppTheme.primary,
                      inactiveColor: const Color(0xFFE2E8F0),
                      onChanged: (value) => setState(() => _cigarettesPerDay = value),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('0', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                          Text('20', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                          Text('40+', style: TextStyle(color: Colors.grey[400], fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 48),
            Row(
              children: [
                Expanded(
                  flex: 1,
                  child: OutlinedButton(
                    onPressed: () => context.pop(),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 56),
                      side: BorderSide(color: Colors.grey[200]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Back', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleContinue,
                    style: ElevatedButton.styleFrom(minimumSize: const Size(0, 56)),
                    child: _isLoading
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Continue'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primary, size: 20),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ],
    );
  }

  Widget _buildSelectableOption(String title, String desc, String? groupValue, ValueChanged<String> onChanged) {
    final isSelected = groupValue == title;
    return GestureDetector(
      onTap: () => onChanged(title),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary.withValues(alpha: 0.05) : Colors.white,
          border: Border.all(color: isSelected ? AppTheme.primary : Colors.grey[200]!),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(desc, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                ],
              ),
            ),
            if (isSelected) const Icon(LucideIcons.checkCircle2, color: AppTheme.primary, size: 20),
          ],
        ),
      ),
    );
  }
}
