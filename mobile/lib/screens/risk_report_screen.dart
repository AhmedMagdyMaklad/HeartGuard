import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../widgets/app_drawer.dart';
import '../services/assessment_service.dart';
import '../providers/auth_provider.dart';
import 'dart:math' as math;

class RiskReportScreen extends StatelessWidget {
  final Map<String, dynamic> data;
  const RiskReportScreen({super.key, required this.data});

  Map<String, dynamic> get _assessment {
    return (data['assessment'] as Map<String, dynamic>?) ?? data;
  }

  int get _riskScore {
    final a = _assessment;
    final combined = AssessmentService.parseScore(a['combined_risk_score']);
    if (combined > 0) return (combined * 100).round().clamp(0, 100);
    return (AssessmentService.parseScore(a['risk_score'])).round().clamp(0, 100);
  }

  String get _riskLevel => (_assessment['risk_level'] as String? ?? 'low').toLowerCase();

  Color _levelColor(String level) {
    switch (level) {
      case 'high': return Colors.red;
      case 'moderate': return Colors.amber[700]!;
      default: return Colors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final score = _riskScore;
    final level = _riskLevel;
    final color = _levelColor(level);
    final a = _assessment;

    return Scaffold(
      backgroundColor: Colors.white,
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('Risk Assessment Report'),
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => context.go('/dashboard'),
        ),
        actions: [
          Builder(
            builder: (ctx) => GestureDetector(
              onTap: () => Scaffold.of(ctx).openDrawer(),
              child: Padding(
                padding: const EdgeInsets.only(right: 16),
                child: CircleAvatar(
                  radius: 16,
                  backgroundColor: AppTheme.primary,
                  child: Text(auth.initials, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildReportHeader(a),
            const SizedBox(height: 32),
            _buildRiskGauge(score, level, color),
            const SizedBox(height: 32),
            _buildAiFindings(a),
            const SizedBox(height: 32),
            _buildMetricBreakdown(a),
            const SizedBox(height: 32),
            _buildRecommendations(a),
            const SizedBox(height: 48),
            _buildActions(context),
          ],
        ),
      ),
    );
  }

  Widget _buildReportHeader(Map<String, dynamic> a) {
    final createdAt = a['created_at'] as String? ?? '';
    final id = (a['id'] as String? ?? '').toUpperCase().replaceAll('-', '').substring(0, math.min(8, (a['id'] as String? ?? '').length));
    final dateStr = createdAt.length >= 10 ? createdAt.substring(0, 10) : 'Today';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Risk Assessment Report', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
        const SizedBox(height: 4),
        Row(
          children: [
            const Icon(LucideIcons.calendar, size: 14, color: Colors.grey),
            const SizedBox(width: 8),
            Text(
              'Generated on $dateStr${id.isNotEmpty ? ' · ID: HG-$id' : ''}',
              style: TextStyle(color: Colors.grey[600], fontSize: 13, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRiskGauge(int score, String level, Color color) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          const Text('AI COMBINED RISK SCORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
          const SizedBox(height: 24),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 180,
                height: 180,
                child: CustomPaint(painter: GaugePainter(score: score, color: color)),
              ),
              Column(
                children: [
                  Text('$score%', style: TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: color, height: 1)),
                  Text(level.toUpperCase(), style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildGaugeLabel('Low', Colors.green),
              _buildGaugeLabel('Moderate', Colors.amber[700]!),
              _buildGaugeLabel('High', Colors.red),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGaugeLabel(String label, Color color) {
    return Column(
      children: [
        Container(width: 40, height: 4, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[500])),
      ],
    );
  }

  Widget _buildAiFindings(Map<String, dynamic> a) {
    final findings = a['analysis_findings'] as String? ??
        'Your assessment has been processed. Review the metrics below and follow the personalised recommendations to improve your heart health.';
    final ecgClass = a['ecg_classification'] as String?;
    final tabularRisk = a['tabular_risk'] as String?;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.primary.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primary.withValues(alpha: 0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(LucideIcons.brainCircuit, color: AppTheme.primary),
              SizedBox(width: 12),
              Text('AI Analysis Findings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          const Text('POWERED BY HEARTGUARD AI MODEL', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.green, letterSpacing: 0.5)),
          const SizedBox(height: 16),
          if (ecgClass != null && ecgClass.isNotEmpty && ecgClass != 'Unknown') ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.activity, color: Colors.blue, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('ECG Classification', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                        Text(ecgClass, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (tabularRisk != null && tabularRisk.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.table, color: Colors.orange, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tabular Data Risk', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold)),
                        Text(tabularRisk, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          Text(findings, style: TextStyle(color: Colors.grey[800], fontSize: 15, height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildMetricBreakdown(Map<String, dynamic> a) {
    final vitals = data['vitals'] as Map<String, double>?;
    final cholesterol = vitals?['cholesterol'] ?? AssessmentService.parseScore(a['cholesterol']);
    final bmi = vitals?['bmi'] ?? AssessmentService.parseScore(a['bmi']);
    final heartRate = vitals?['heart_rate'] ?? AssessmentService.parseScore(a['heart_rate']);
    final glucose = vitals?['glucose'] ?? AssessmentService.parseScore(a['glucose']);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Metric Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _buildMetricCard('Cholesterol', '${cholesterol.toInt()} mg/dL', _scoreStatus(cholesterol, 200, 240)),
            _buildMetricCard('BMI', bmi.toStringAsFixed(1), _scoreStatus(bmi, 25, 30)),
            _buildMetricCard('Heart Rate', '${heartRate.toInt()} BPM', _scoreStatus(heartRate, 100, 120)),
            _buildMetricCard('Glucose', '${glucose.toInt()} mg/dL', _scoreStatus(glucose, 100, 126)),
          ],
        ),
      ],
    );
  }

  String _scoreStatus(double v, double moderate, double high) {
    if (v >= high) return 'Elevated';
    if (v >= moderate) return 'Borderline';
    return 'Normal';
  }

  Widget _buildMetricCard(String label, String value, String status) {
    final statusColor = status == 'Normal' ? Colors.green : status == 'Elevated' ? Colors.red : Colors.amber[700]!;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
            child: Text(status.toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: statusColor)),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendations(Map<String, dynamic> a) {
    final diet = a['diet_plan'] as String? ?? 'Adopt a heart-healthy, low-saturated-fat diet. Increase soluble fibre and omega-3 fatty acids.';
    final exercise = a['exercise_rec'] as String? ?? '150 minutes of moderate aerobic activity per week. Include strength training twice a week.';
    final medical = a['medical_rec'] as String? ?? 'Follow up with your doctor to review your assessment results and discuss next steps.';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Personalised Recommendations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        _buildRecTile(LucideIcons.utensils, 'Diet Plan', diet, Colors.orange),
        _buildRecTile(LucideIcons.activity, 'Exercise', exercise, Colors.blue),
        _buildRecTile(LucideIcons.stethoscope, 'Medical', medical, Colors.red),
      ],
    );
  }

  Widget _buildRecTile(IconData icon, String title, String desc, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.1)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(desc, style: TextStyle(color: Colors.grey[800], fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: () => context.go('/chatbot'),
          style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 56), backgroundColor: AppTheme.primary),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(LucideIcons.messageSquare, color: Colors.white),
              SizedBox(width: 12),
              Text('Ask Heart Health AI', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: () => context.go('/dashboard'),
          style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 56)),
          child: const Text('Back to Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}

class GaugePainter extends CustomPainter {
  final int score;
  final Color color;
  GaugePainter({required this.score, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi * 0.75, math.pi * 1.5, false,
      Paint()..color = const Color(0xFFF1F5F9)..style = PaintingStyle.stroke..strokeWidth = 12..strokeCap = StrokeCap.round,
    );
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi * 0.75, (math.pi * 1.5) * (score / 100), false,
      Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 12..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
