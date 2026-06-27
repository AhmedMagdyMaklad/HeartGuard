import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class AssessmentService {
  static Future<Map<String, dynamic>?> submitAssessment({
    required double cholesterol,
    required double bmi,
    required double heartRate,
    required double glucose,
    required double pulsePressure,
    File? ecgFile,
  }) async {
    try {
      http.MultipartFile? multipartFile;
      if (ecgFile != null) {
        multipartFile = await http.MultipartFile.fromPath('file', ecgFile.path);
      }

      final streamedResponse = await ApiService.multipartPost(
        '/api/assessment',
        fields: {
          'cholesterol': cholesterol.toString(),
          'bmi': bmi.toString(),
          'heart_rate': heartRate.toString(),
          'glucose': glucose.toString(),
          'pulse_pressure': pulsePressure.toString(),
        },
        file: multipartFile,
      );

      final response = await http.Response.fromStream(streamedResponse);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      }
      return {'error': jsonDecode(response.body)['error'] ?? 'Assessment failed'};
    } catch (e) {
      return {'error': 'Network error: $e'};
    }
  }

  static Future<Map<String, dynamic>?> getLatestAssessment() async {
    try {
      final response = await ApiService.get('/api/assessment/latest');
      if (response.statusCode == 200) {
        return ApiService.decode(response);
      }
    } catch (_) {}
    return null;
  }

  static Future<List<Map<String, dynamic>>> getHistory() async {
    try {
      final response = await ApiService.get('/api/assessment/history');
      if (response.statusCode == 200) {
        final body = ApiService.decode(response);
        final assessments = body['assessments'] as List<dynamic>? ?? [];
        return assessments.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  static double parseScore(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString()) ?? 0.0;
  }
}
