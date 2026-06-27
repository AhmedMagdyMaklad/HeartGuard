import 'api_service.dart';

class ChatService {
  static Future<List<Map<String, dynamic>>> getSessions() async {
    try {
      final response = await ApiService.get('/api/chat/sessions');
      if (response.statusCode == 200) {
        final body = ApiService.decode(response);
        final sessions = body['sessions'] as List<dynamic>? ?? [];
        return sessions.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>?> createSession({String title = 'New Conversation'}) async {
    try {
      final response = await ApiService.post('/api/chat/sessions', body: {'title': title});
      if (response.statusCode == 200 || response.statusCode == 201) {
        final body = ApiService.decode(response);
        return body['session'] as Map<String, dynamic>?;
      }
    } catch (_) {}
    return null;
  }

  static Future<bool> deleteSession(String sessionId) async {
    try {
      final response = await ApiService.delete('/api/chat/sessions/$sessionId');
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<List<Map<String, dynamic>>> getMessages(String sessionId) async {
    try {
      final response = await ApiService.get('/api/chat/messages', query: {'session_id': sessionId});
      if (response.statusCode == 200) {
        final body = ApiService.decode(response);
        final messages = body['messages'] as List<dynamic>? ?? [];
        return messages.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>?> sendMessage({
    required String sessionId,
    required String message,
  }) async {
    try {
      final response = await ApiService.post('/api/chat/message', body: {
        'session_id': sessionId,
        'content': message,
      });
      if (response.statusCode == 200) {
        final body = ApiService.decode(response);
        final msgObj = body['message'] as Map<String, dynamic>?;
        final reply = msgObj?['content'] as String? ?? body['reply'] as String?;
        return {'reply': reply};
      }
    } catch (_) {}
    return null;
  }
}
