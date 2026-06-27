import 'api_service.dart';

class OnboardingService {
  static Future<Map<String, dynamic>?> getStatus() async {
    try {
      final response = await ApiService.get('/api/onboarding/status');
      if (response.statusCode == 200) {
        return ApiService.decode(response);
      }
    } catch (_) {}
    return null;
  }

  static Future<bool> saveProfile({
    required String gender,
    required String dateOfBirth,
  }) async {
    try {
      final response = await ApiService.put('/api/onboarding/profile', body: {
        'gender': gender.toLowerCase(),
        'date_of_birth': dateOfBirth,
      });
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<bool> saveLifestyle({required int cigarettesPerDay}) async {
    try {
      final response = await ApiService.put('/api/onboarding/lifestyle', body: {
        'cigarettes_per_day': cigarettesPerDay,
      });
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<bool> saveMedicalHistory({
    required List<String> conditions,
    required bool hasTestResults,
  }) async {
    try {
      final response = await ApiService.put('/api/onboarding/medical-history', body: {
        'conditions': conditions,
        'has_test_results': hasTestResults,
      });
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static bool hasCompletedOnboarding(Map<String, dynamic> status) {
    return status['profile'] != null;
  }
}
