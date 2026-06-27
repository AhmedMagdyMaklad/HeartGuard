import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AuthService {
  AuthService._internal();
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;

  String? _token;
  Map<String, dynamic>? _user;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isLoggedIn => _token != null;

  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('session_token');
    final userJson = prefs.getString('user');
    if (userJson != null) {
      _user = jsonDecode(userJson) as Map<String, dynamic>;
    }
  }

  Future<void> _saveToStorage() async {
    final prefs = await SharedPreferences.getInstance();
    if (_token != null) await prefs.setString('session_token', _token!);
    if (_user != null) await prefs.setString('user', jsonEncode(_user));
  }

  Future<void> _clearStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('session_token');
    await prefs.remove('user');
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 200) {
      _token = body['token'] as String;
      _user = body['user'] as Map<String, dynamic>;
      await _saveToStorage();
      return {'success': true, 'user': _user};
    } else {
      return {'success': false, 'error': body['error'] ?? 'Login failed'};
    }
  }

  Future<Map<String, dynamic>> signup(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/auth/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'full_name': name, 'email': email, 'password': password}),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode == 201) {
      _token = body['token'] as String;
      _user = body['user'] as Map<String, dynamic>;
      await _saveToStorage();
      return {'success': true, 'user': _user};
    } else {
      return {'success': false, 'error': body['error'] ?? 'Signup failed'};
    }
  }

  Future<void> logout() async {
    if (_token != null) {
      try {
        await http.post(
          Uri.parse('${ApiConfig.baseUrl}/api/auth/logout'),
          headers: {'Authorization': 'Bearer $_token'},
        );
      } catch (_) {}
    }
    _token = null;
    _user = null;
    await _clearStorage();
  }

  Future<Map<String, dynamic>?> getMe() async {
    if (_token == null) return null;
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/auth/me'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        _user = body['user'] as Map<String, dynamic>;
        await _saveToStorage();
        return _user;
      }
    } catch (_) {}
    return null;
  }
}
