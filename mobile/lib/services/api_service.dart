import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class ApiService {
  static Future<Map<String, String>> _headers({bool json = true}) async {
    final headers = <String, String>{};
    if (json) headers['Content-Type'] = 'application/json';
    final token = AuthService().token;
    if (token != null) headers['Authorization'] = 'Bearer $token';
    return headers;
  }

  static Uri _uri(String path, [Map<String, String>? queryParams]) =>
      Uri.parse('${ApiConfig.baseUrl}$path').replace(queryParameters: queryParams);

  static Future<http.Response> get(String path, {Map<String, String>? query}) async {
    return http.get(_uri(path, query), headers: await _headers());
  }

  static Future<http.Response> post(String path, {Object? body}) async {
    return http.post(
      _uri(path),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    );
  }

  static Future<http.Response> put(String path, {Object? body}) async {
    return http.put(
      _uri(path),
      headers: await _headers(),
      body: body != null ? jsonEncode(body) : null,
    );
  }

  static Future<http.Response> delete(String path) async {
    return http.delete(_uri(path), headers: await _headers());
  }

  static Future<http.StreamedResponse> multipartPost(
    String path, {
    required Map<String, String> fields,
    http.MultipartFile? file,
  }) async {
    final uri = _uri(path);
    final request = http.MultipartRequest('POST', uri);
    final token = AuthService().token;
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    request.fields.addAll(fields);
    if (file != null) request.files.add(file);
    return request.send();
  }

  static Map<String, dynamic> decode(http.Response response) {
    return jsonDecode(response.body) as Map<String, dynamic>;
  }
}
