import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../widgets/app_drawer.dart';
import '../services/assessment_service.dart';
import '../providers/auth_provider.dart';
import 'dart:math' as math;
import 'package:flutter_animate/flutter_animate.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  Map<String, dynamic>? _latestAssessment;
  List<Map<String, dynamic>> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final latest = await AssessmentService.getLatestAssessment();
    final history = await AssessmentService.getHistory();
    if (mounted) {
      setState(() {
        _latestAssessment = latest?['assessment'] as Map<String, dynamic>?;
        _history = history;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final name = auth.displayName.split(' ').first;
    final hasAssessment = _latestAssessment != null;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: const AppDrawer(),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.menu, color: AppTheme.primary),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: Row(
          children: [
            SvgPicture.asset('assets/HeartGuard_Logo.svg', height: 24),
            const SizedBox(width: 8),
            const Text('HeartGuard', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          ],
        ),
        actions: [
          GestureDetector(
            onTap: () => _scaffoldKey.currentState?.openDrawer(),
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppTheme.primary,
                child: Text(auth.initials, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildWelcomeHeader(name, hasAssessment),
                    const SizedBox(height: 24),
                    _buildQuickActions(),
                    const SizedBox(height: 32),
                    if (!hasAssessment) _buildEmptyState(),
                    if (hasAssessment) ...[
                      _buildRiskSummarySection(),
                      const SizedBox(height: 32),
                      _buildMetricsGrid(),
                      const SizedBox(height: 32),
                      _buildTrendChart(),
                    ],
                  ].animate(interval: 50.ms).fade(duration: 400.ms).slideY(begin: 0.1, curve: Curves.easeOutQuad),
                ),
              ),
            ),
    );
  }

  Widget _buildWelcomeHeader(String name, bool hasAssessment) {
    String subtitle = 'Complete your first assessment to see insights.';
    if (hasAssessment && _latestAssessment != null) {
      final createdAt = _latestAssessment!['created_at'] as String? ?? '';
      subtitle = createdAt.isNotEmpty ? 'Last assessment: ${createdAt.substring(0, 10)}' : 'Latest assessment loaded.';
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Welcome back, $name', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
        const SizedBox(height: 4),
        Text(subtitle, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () => context.push('/assessment/vitals'),
              icon: const Icon(LucideIcons.refreshCw, size: 16, color: Colors.white),
              label: const Text('New Assessment', style: TextStyle(color: Colors.white)),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => context.go('/chatbot'),
              icon: const Icon(LucideIcons.bot, size: 16),
              label: const Text('Ask AI'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.05), shape: BoxShape.circle),
            child: const Icon(LucideIcons.activity, size: 48, color: AppTheme.primary),
          ),
          const SizedBox(height: 24),
          const Text('No Health Data Yet', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text(
            'Complete your baseline assessment to unlock personalized AI-powered analysis.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskSummarySection() {
    final a = _latestAssessment!;
    final score = (AssessmentService.parseScore(a['combined_risk_score']) * 100).round().clamp(0, 100);
    final level = (a['risk_level'] as String? ?? 'low').toUpperCase();
    final color = _levelColor(a['risk_level'] as String? ?? 'low');

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('HEART HEALTH RISK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
              Icon(LucideIcons.info, size: 16, color: Colors.grey[400]),
            ],
          ),
          const SizedBox(height: 24),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 160,
                height: 160,
                child: CustomPaint(painter: DashboardGaugePainter(score: score, color: color)),
              ),
              Column(
                children: [
                  Text('$score', style: TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: color, height: 1)),
                  Text(level, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
                ],
              ),
            ],
          ),
          if ((a['ecg_classification'] != null && a['ecg_classification'] != 'Unknown') || (a['tabular_risk'] != null)) ...[
            const SizedBox(height: 24),
            Row(
              children: [
                if (a['ecg_classification'] != null && a['ecg_classification'] != 'Unknown')
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: Column(
                        children: [
                          const Text('ECG Risk', style: TextStyle(fontSize: 9, color: Colors.blue, fontWeight: FontWeight.bold)),
                          Text(a['ecg_classification'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                if (a['ecg_classification'] != null && a['ecg_classification'] != 'Unknown' && a['tabular_risk'] != null)
                  const SizedBox(width: 8),
                if (a['tabular_risk'] != null)
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: Column(
                        children: [
                          const Text('Tabular Risk', style: TextStyle(fontSize: 9, color: Colors.orange, fontWeight: FontWeight.bold)),
                          Text(a['tabular_risk'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMetricsGrid() {
    final a = _latestAssessment!;
    final metrics = [
      _MetricInfo('Cholesterol', AssessmentService.parseScore(a['cholesterol']), 'mg/dL'),
      _MetricInfo('BMI', AssessmentService.parseScore(a['bmi']), 'kg/m²'),
      _MetricInfo('Heart Rate', AssessmentService.parseScore(a['heart_rate']), 'BPM'),
      _MetricInfo('Glucose', AssessmentService.parseScore(a['glucose']), 'mg/dL'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Latest Test Results', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: metrics.map(_buildMetricCard).toList(),
        ),
      ],
    );
  }

  Widget _buildMetricCard(_MetricInfo m) {
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
          Text(m.label.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
          const Spacer(),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(m.value.toStringAsFixed(m.unit == 'BPM' || m.unit == 'mg/dL' ? 0 : 1),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
              const SizedBox(width: 4),
              Text(m.unit, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTrendChart() {
    final spots = <FlSpot>[];
    for (int i = 0; i < _history.length && i < 6; i++) {
      final score = AssessmentService.parseScore(_history[i]['combined_risk_score']) * 100;
      spots.add(FlSpot(i.toDouble(), score.clamp(0, 100)));
    }
    if (spots.isEmpty) spots.add(const FlSpot(0, 0));

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Risk Score Trend', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('Tracking your score across assessments', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
          const SizedBox(height: 32),
          SizedBox(
            height: 200,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: 20,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: Colors.grey.withValues(alpha: 0.1),
                    strokeWidth: 1,
                  ),
                ),
                titlesData: const FlTitlesData(
                  show: true,
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: true, reservedSize: 30, interval: 20),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineTouchData: LineTouchData(
                  touchTooltipData: LineTouchTooltipData(
                    getTooltipItems: (touchedSpots) {
                      return touchedSpots.map((spot) => LineTooltipItem(
                        '${spot.y.round()}%',
                        const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      )).toList();
                    },
                  ),
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    curveSmoothness: 0.35,
                    color: AppTheme.primary,
                    barWidth: 4,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.primary.withValues(alpha: 0.3),
                          AppTheme.primary.withValues(alpha: 0.0),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: _latestAssessment != null
                  ? () => context.push('/risk-report', extra: {'assessment': _latestAssessment})
                  : null,
              icon: const Icon(LucideIcons.barChart2, size: 16),
              label: const Text('View Full Report', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Color _levelColor(String level) {
    switch (level.toLowerCase()) {
      case 'high':
        return Colors.red;
      case 'moderate':
        return Colors.amber[700]!;
      default:
        return Colors.green;
    }
  }
}

class _MetricInfo {
  final String label;
  final double value;
  final String unit;
  _MetricInfo(this.label, this.value, this.unit);
}

class DashboardGaugePainter extends CustomPainter {
  final int score;
  final Color color;
  DashboardGaugePainter({required this.score, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi, math.pi, false,
      Paint()..color = const Color(0xFFF1F5F9)..style = PaintingStyle.stroke..strokeWidth = 14..strokeCap = StrokeCap.round,
    );
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi, math.pi * (score / 100), false,
      Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 14..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
