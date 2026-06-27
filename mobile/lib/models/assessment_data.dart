class AssessmentData {
  final double cholesterol;
  final double bmi;
  final double heartRate;
  final double glucose;
  final double? pulsePressure;
  final String? ecgFilePath;
  final DateTime timestamp;

  AssessmentData({
    required this.cholesterol,
    required this.bmi,
    required this.heartRate,
    required this.glucose,
    this.pulsePressure,
    this.ecgFilePath,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  Map<String, double> toMap() {
    return {
      'cholesterol': cholesterol,
      'bmi': bmi,
      'heart_rate': heartRate,
      'glucose': glucose,
      if (pulsePressure != null) 'pulse_pressure': pulsePressure!, // ignore: use_null_aware_elements
    };
  }

  factory AssessmentData.fromMap(Map<String, double> map) {
    return AssessmentData(
      cholesterol: map['cholesterol'] ?? 0,
      bmi: map['bmi'] ?? 0,
      heartRate: map['heart_rate'] ?? 0,
      glucose: map['glucose'] ?? 0,
      pulsePressure: map['pulse_pressure'],
    );
  }
}
