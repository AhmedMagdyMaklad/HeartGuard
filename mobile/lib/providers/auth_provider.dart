import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../services/onboarding_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.unknown;
  bool _onboardingComplete = false;

  AuthStatus get status => _status;
  bool get onboardingComplete => _onboardingComplete;
  Map<String, dynamic>? get user => AuthService().user;
  String get displayName => user?['full_name'] as String? ?? user?['email'] as String? ?? 'User';
  String get initials {
    final name = displayName;
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }

  Future<void> initialize() async {
    await AuthService().loadFromStorage();
    if (AuthService().isLoggedIn) {
      final me = await AuthService().getMe();
      if (me != null) {
        await _checkOnboarding();
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    final result = await AuthService().login(email, password);
    if (result['success'] == true) {
      await _checkOnboarding();
      _status = AuthStatus.authenticated;
      notifyListeners();
      return null;
    }
    return result['error'] as String? ?? 'Login failed';
  }

  Future<String?> signup(String name, String email, String password) async {
    final result = await AuthService().signup(name, email, password);
    if (result['success'] == true) {
      _onboardingComplete = false;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return null;
    }
    return result['error'] as String? ?? 'Signup failed';
  }

  Future<void> logout() async {
    await AuthService().logout();
    _status = AuthStatus.unauthenticated;
    _onboardingComplete = false;
    notifyListeners();
  }

  Future<void> _checkOnboarding() async {
    final status = await OnboardingService.getStatus();
    _onboardingComplete = status != null && OnboardingService.hasCompletedOnboarding(status);
  }

  Future<void> refreshOnboardingStatus() async {
    await _checkOnboarding();
    notifyListeners();
  }
}
