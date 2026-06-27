enum RiskLevel {
  low,
  moderate,
  high;

  String get label => name.toUpperCase();
}

class HealthMetric {
  final String label;
  final String value;
  final String unit;
  final String status;
  final RiskLevel riskLevel;

  HealthMetric({
    required this.label,
    required this.value,
    required this.unit,
    required this.status,
    required this.riskLevel,
  });
}
