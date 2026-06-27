import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';

class AssessmentVitalsScreen extends StatefulWidget {
  const AssessmentVitalsScreen({super.key});

  @override
  State<AssessmentVitalsScreen> createState() => _AssessmentVitalsScreenState();
}

class _AssessmentVitalsScreenState extends State<AssessmentVitalsScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _controllers = {
    'cholesterol': TextEditingController(),
    'bmi': TextEditingController(),
    'heartRate': TextEditingController(),
    'glucose': TextEditingController(),
    'pulsePressure': TextEditingController(),
  };

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _handleNext() {
    if (_formKey.currentState!.validate()) {
      final vitals = {
        'cholesterol': double.tryParse(_controllers['cholesterol']!.text) ?? 0.0,
        'bmi': double.tryParse(_controllers['bmi']!.text) ?? 0.0,
        'heart_rate': double.tryParse(_controllers['heartRate']!.text) ?? 0.0,
        'glucose': double.tryParse(_controllers['glucose']!.text) ?? 0.0,
        'pulse_pressure': double.tryParse(_controllers['pulsePressure']!.text) ?? 0.0,
      };
      context.push('/assessment/ecg', extra: vitals);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Health Metrics'),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(4),
          child: LinearProgressIndicator(value: 0.5, backgroundColor: Color(0xFFE2E8F0)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Heart Risk Assessment',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              Text(
                'Enter your current health metrics to receive a personalised heart disease risk prediction.',
                style: TextStyle(color: Colors.grey[600], fontSize: 16),
              ),
              const SizedBox(height: 32),
              _buildMetricField(
                label: 'Total Cholesterol',
                controller: _controllers['cholesterol']!,
                unit: 'mg/dL',
                hint: 'Normal range: 125–200 mg/dL',
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _buildMetricField(
                      label: 'BMI',
                      controller: _controllers['bmi']!,
                      unit: 'kg/m²',
                      hint: 'Normal: 18.5–24.9',
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildMetricField(
                      label: 'Heart Rate',
                      controller: _controllers['heartRate']!,
                      unit: 'BPM',
                      hint: 'Normal: 60–100',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _buildMetricField(
                      label: 'Glucose',
                      controller: _controllers['glucose']!,
                      unit: 'mg/dL',
                      hint: 'Normal: 70–99',
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildMetricField(
                      label: 'Pulse Pressure',
                      controller: _controllers['pulsePressure']!,
                      unit: 'mmHg',
                      hint: 'Normal: 25–60',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              Row(
                children: [
                  Expanded(
                    flex: 1,
                    child: OutlinedButton(
                      onPressed: () => context.go('/dashboard'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 64),
                        side: BorderSide(color: Colors.grey[200]!),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: Text('Cancel', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _handleNext,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(0, 64),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Next: ECG', style: TextStyle(fontSize: 16)),
                          SizedBox(width: 8),
                          Icon(LucideIcons.arrowRight, size: 18),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricField({
    required String label,
    required TextEditingController controller,
    required String unit,
    required String hint,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.blueGrey)),
            const Icon(LucideIcons.info, size: 16, color: Colors.grey),
          ],
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            suffixText: unit,
            suffixStyle: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) return 'Required';
            if (double.tryParse(value) == null) return 'Invalid';
            return null;
          },
        ),
      ],
    );
  }
}
