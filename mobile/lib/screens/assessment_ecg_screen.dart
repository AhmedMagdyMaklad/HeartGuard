import 'dart:io';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import '../theme.dart';
import '../models/assessment_data.dart';
import '../services/assessment_service.dart';

class AssessmentEcgScreen extends StatefulWidget {
  final AssessmentData assessment;
  const AssessmentEcgScreen({super.key, required this.assessment});

  @override
  State<AssessmentEcgScreen> createState() => _AssessmentEcgScreenState();
}

class _AssessmentEcgScreenState extends State<AssessmentEcgScreen> {
  bool _isAnalyzing = false;
  String? _selectedFileName;
  File? _selectedFile;

  Future<void> _pickEcgFile() async {
    final result = await FilePicker.pickFiles(
      type: FileType.image,
      allowMultiple: false,
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _selectedFileName = result.files.single.name;
        _selectedFile = File(result.files.single.path!);
      });
    }
  }

  Future<void> _takePhoto() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() {
        _selectedFileName = image.name;
        _selectedFile = File(image.path);
      });
    }
  }

  void _handleSubmit() async {
    setState(() => _isAnalyzing = true);

    final result = await AssessmentService.submitAssessment(
      cholesterol: widget.assessment.cholesterol,
      bmi: widget.assessment.bmi,
      heartRate: widget.assessment.heartRate,
      glucose: widget.assessment.glucose,
      pulsePressure: widget.assessment.pulsePressure ?? 0,
      ecgFile: _selectedFile,
    );

    if (mounted) {
      setState(() => _isAnalyzing = false);
      if (result != null && result['error'] == null) {
        context.go('/risk-report', extra: {'assessment': result['assessment'] ?? result, 'vitals': widget.assessment.toMap()});
      } else {
        final errMsg = result?['error'] as String? ?? 'Assessment failed. Please try again.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errMsg), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('ECG Analysis'),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(4),
          child: LinearProgressIndicator(value: 1.0, backgroundColor: Color(0xFFE2E8F0)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Upload ECG Report', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
            const SizedBox(height: 8),
            Text(
              'Upload a photo of your ECG strip. Our AI will analyse your cardiac rhythm for a complete assessment.',
              style: TextStyle(color: Colors.grey[600], fontSize: 16),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primary.withValues(alpha: 0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('VITALS FROM PREVIOUS STEP',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primary, letterSpacing: 1)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 16,
                    runSpacing: 8,
                    children: widget.assessment.toMap().entries.map((e) => _buildVitalItem(e.key, e.value)).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _selectedFileName != null ? AppTheme.primary : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1), shape: BoxShape.circle),
                    child: Icon(
                      _selectedFileName != null ? LucideIcons.checkCircle2 : LucideIcons.image,
                      size: 48,
                      color: AppTheme.primary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _selectedFileName ?? 'No ECG strip selected',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _selectedFileName != null ? 'Ready for AI analysis' : 'Supported: JPG, PNG — or skip for vitals-only assessment',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: _isAnalyzing ? null : _takePhoto,
                        icon: const Icon(LucideIcons.camera, size: 18),
                        label: const Text('Camera'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppTheme.primary,
                          side: const BorderSide(color: AppTheme.primary),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton.icon(
                        onPressed: _isAnalyzing ? null : _pickEcgFile,
                        icon: const Icon(LucideIcons.uploadCloud, size: 18),
                        label: const Text('Gallery'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppTheme.primary,
                          side: const BorderSide(color: AppTheme.primary),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text('SCANNING GUIDELINES', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
            const SizedBox(height: 16),
            _buildGuideline(LucideIcons.sun, 'Ensure good lighting', 'Avoid shadows or glare on the paper.'),
            _buildGuideline(LucideIcons.eye, 'Capture full strip', 'All waves and text must be visible.'),
            const SizedBox(height: 48),
            Row(
              children: [
                Expanded(
                  flex: 1,
                  child: OutlinedButton(
                    onPressed: _isAnalyzing ? null : () => context.pop(),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 64),
                      side: BorderSide(color: Colors.grey[200]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text('Back', style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _isAnalyzing ? null : _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(0, 64),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _isAnalyzing
                        ? const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                              SizedBox(width: 12),
                              Text('Analysing...', style: TextStyle(color: Colors.white)),
                            ],
                          )
                        : const Text('Predict Risk', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVitalItem(String label, double value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase().replaceAll('_', ' '), style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
        Text(value.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      ],
    );
  }

  Widget _buildGuideline(IconData icon, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: Colors.green, size: 20),
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
      ),
    );
  }
}
