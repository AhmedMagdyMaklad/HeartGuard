enum ChatRole {
  user,
  assistant;
}

class ChatMessage {
  final ChatRole role;
  final String content;
  final DateTime timestamp;

  ChatMessage({
    required this.role,
    required this.content,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isUser => role == ChatRole.user;
}

class ChatHistoryItem {
  final String title;
  final DateTime dateTime;

  ChatHistoryItem({
    required this.title,
    required this.dateTime,
  });

  String get formattedDate {
    // Basic formatting logic (could use intl package)
    return "${dateTime.day}/${dateTime.month}/${dateTime.year}";
  }
}
