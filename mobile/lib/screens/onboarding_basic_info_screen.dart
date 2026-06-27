import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import '../theme.dart';
import '../services/onboarding_service.dart';

class OnboardingBasicInfoScreen extends StatefulWidget {
  const OnboardingBasicInfoScreen({super.key});

  @override
  State<OnboardingBasicInfoScreen> createState() => _OnboardingBasicInfoScreenState();
}

class _OnboardingBasicInfoScreenState extends State<OnboardingBasicInfoScreen> {
  String? _gender;
  final _dobController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleContinue() async {
    if (_gender == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select your gender'), backgroundColor: Colors.red),
      );
      return;
    }
    if (_dobController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your date of birth'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);

    await OnboardingService.saveProfile(
      gender: _gender!,
      dateOfBirth: _dobController.text.trim(),
    );

    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/onboarding/lifestyle');
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(1990),
      firstDate: DateTime(1920),
      lastDate: DateTime.now().subtract(const Duration(days: 365 * 10)),
    );
    if (picked != null) {
      _dobController.text =
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
    }
  }

  @override
  void dispose() {
    _dobController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Basic Information'),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(4),
          child: LinearProgressIndicator(value: 0.33, backgroundColor: Color(0xFFE2E8F0)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Tell us about yourself', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            Text(
              'This helps us calculate your risk factors accurately.',
              style: TextStyle(color: Colors.grey[600], fontSize: 14),
            ),
            const SizedBox(height: 32),
            const Text('Gender', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildGenderOption('Male', LucideIcons.user),
                const SizedBox(width: 12),
                _buildGenderOption('Female', LucideIcons.user),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Date of Birth', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: _pickDate,
              child: AbsorbPointer(
                child: TextField(
                  controller: _dobController,
                  decoration: InputDecoration(
                    hintText: 'YYYY-MM-DD',
                    prefixIcon: const Icon(LucideIcons.calendar, size: 20),
                    filled: true,
                    fillColor: Colors.grey[50],
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[200]!)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[200]!)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.primary)),
                  ),
                ),
              ),
            ),
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

  Widget _buildGenderOption(String label, IconData icon) {
    final isSelected = _gender == label;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _gender = label),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary.withValues(alpha: 0.05) : Colors.white,
            border: Border.all(color: isSelected ? AppTheme.primary : Colors.grey[200]!),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? AppTheme.primary : Colors.grey[400]),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? AppTheme.primary : Colors.grey[600]),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
