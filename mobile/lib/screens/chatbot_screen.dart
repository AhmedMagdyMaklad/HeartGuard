import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../widgets/app_drawer.dart';
import '../models/chat_models.dart';
import '../services/chat_service.dart';
import '../providers/auth_provider.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  List<Map<String, dynamic>> _sessions = [];
  String? _currentSessionId;
  bool _isTyping = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    final name = context.read<AuthProvider>().displayName.split(' ').first;
    setState(() {
      _messages.add(ChatMessage(
        role: ChatRole.assistant,
        content: 'Hello $name! I am your HeartHealth AI. How can I help you today?',
      ));
    });

    _sessions = await ChatService.getSessions();
    if (_sessions.isNotEmpty) {
      _currentSessionId = _sessions.first['id'] as String;
      await _loadMessages(_currentSessionId!);
    } else {
      final session = await ChatService.createSession();
      if (session != null) {
        _currentSessionId = session['id'] as String;
        _sessions = [session];
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _loadMessages(String sessionId) async {
    final msgs = await ChatService.getMessages(sessionId);
    if (mounted) {
      setState(() {
        _messages.clear();
        final name = context.read<AuthProvider>().displayName.split(' ').first;
        _messages.add(ChatMessage(
          role: ChatRole.assistant,
          content: 'Hello $name! I am your HeartHealth AI. How can I help you today?',
        ));
        for (final m in msgs) {
          _messages.add(ChatMessage(
            role: (m['role'] as String) == 'user' ? ChatRole.user : ChatRole.assistant,
            content: m['content'] as String,
          ));
        }
      });
      _scrollToBottom();
    }
  }

  void _handleSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(ChatMessage(role: ChatRole.user, content: text));
      _controller.clear();
      _isTyping = true;
    });
    _scrollToBottom();

    String? sessionId = _currentSessionId;
    if (sessionId == null) {
      final session = await ChatService.createSession(title: text.length > 30 ? text.substring(0, 30) : text);
      if (session != null) {
        sessionId = session['id'] as String;
        _currentSessionId = sessionId;
        _sessions.insert(0, session);
      }
    }

    Map<String, dynamic>? response;
    if (sessionId != null) {
      response = await ChatService.sendMessage(sessionId: sessionId, message: text);
    }

    if (mounted) {
      setState(() {
        _isTyping = false;
        final reply = response?['reply'] as String? ??
            'I could not process your request right now. Please try again.';
        _messages.add(ChatMessage(role: ChatRole.assistant, content: reply));
      });
      _scrollToBottom();
    }
  }

  Future<void> _startNewSession() async {
    final session = await ChatService.createSession();
    if (session != null && mounted) {
      setState(() {
        _currentSessionId = session['id'] as String;
        _sessions.insert(0, session);
        _messages.clear();
        final name = context.read<AuthProvider>().displayName.split(' ').first;
        _messages.add(ChatMessage(
          role: ChatRole.assistant,
          content: 'Hello $name! I am your HeartHealth AI. How can I help you today?',
        ));
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: const AppDrawer(),
      endDrawer: _buildHistoryDrawer(),
      appBar: AppBar(
        title: const Text('Heart Health AI'),
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => context.go('/dashboard'),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.pencil),
            tooltip: 'New Chat',
            onPressed: _startNewSession,
          ),
          IconButton(
            icon: const Icon(LucideIcons.history),
            tooltip: 'Chat History',
            onPressed: () => _scaffoldKey.currentState?.openEndDrawer(),
          ),
          GestureDetector(
            onTap: () => _scaffoldKey.currentState?.openDrawer(),
            child: Padding(
              padding: const EdgeInsets.only(right: 16, left: 8),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppTheme.primary,
                child: Text(context.watch<AuthProvider>().initials,
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) => _buildMessage(_messages[index]),
                  ),
          ),
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  _buildAvatar(ChatRole.assistant),
                  const SizedBox(width: 8),
                  const Text('AI is typing...', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          _buildInput(),
        ],
      ),
    );
  }

  Widget _buildMessage(ChatMessage msg) {
    final isUser = msg.isUser;
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) _buildAvatar(msg.role),
          if (!isUser) const SizedBox(width: 12),
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isUser ? AppTheme.primary : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isUser ? 16 : 0),
                  bottomRight: Radius.circular(isUser ? 0 : 16),
                ),
                boxShadow: [
                  if (!isUser) BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 2)),
                ],
              ),
              child: Text(
                msg.content,
                style: TextStyle(color: isUser ? Colors.white : Colors.black87, fontSize: 15, height: 1.4),
              ),
            ),
          ),
          if (isUser) const SizedBox(width: 12),
          if (isUser) _buildAvatar(msg.role),
        ],
      ),
    );
  }

  Widget _buildAvatar(ChatRole role) {
    final isUser = role == ChatRole.user;
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: isUser ? AppTheme.primary : const Color(0xFFFEF2F2),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: isUser
            ? Text(context.read<AuthProvider>().initials,
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))
            : const Icon(LucideIcons.bot, color: Colors.red, size: 18),
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey[200]!)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                decoration: InputDecoration(
                  hintText: 'Ask about heart health...',
                  filled: true,
                  fillColor: const Color(0xFFF1F5F9),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                onSubmitted: (_) => _handleSend(),
              ),
            ),
            const SizedBox(width: 12),
            GestureDetector(
              onTap: _handleSend,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
                child: const Icon(LucideIcons.send, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryDrawer() {
    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(20, 64, 20, 24),
            decoration: const BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(20), bottomRight: Radius.circular(20)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.history, color: Colors.white, size: 24),
                    SizedBox(width: 12),
                    Text('Chat History', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                  ],
                ),
                SizedBox(height: 8),
                Text('Your past health inquiries', style: TextStyle(color: Colors.white70, fontSize: 14)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: _sessions.isEmpty
                ? const Center(child: Text('No previous sessions', style: TextStyle(color: Colors.grey)))
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _sessions.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final s = _sessions[index];
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(10)),
                            child: const Icon(LucideIcons.messageSquare, size: 20, color: AppTheme.primary),
                          ),
                          title: Text(s['title'] as String? ?? 'Conversation',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                          onTap: () async {
                            _currentSessionId = s['id'] as String;
                            context.pop();
                            await _loadMessages(_currentSessionId!);
                          },
                          trailing: IconButton(
                            icon: const Icon(LucideIcons.trash2, color: Colors.red, size: 18),
                            onPressed: () async {
                              await ChatService.deleteSession(s['id'] as String);
                              setState(() => _sessions.removeAt(index));
                              if (_currentSessionId == s['id']) {
                                _currentSessionId = null;
                              }
                              if (context.mounted) context.pop();
                            },
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
