import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../providers/auth_provider.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final name = auth.displayName;
    final email = auth.user?['email'] as String? ?? '';
    final initials = auth.initials;

    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: AppTheme.primary),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(initials, style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
            ),
            accountName: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            accountEmail: Text(email),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _buildMenuItem(context, icon: LucideIcons.layoutDashboard, title: 'Dashboard', route: '/dashboard'),
                _buildMenuItem(context, icon: LucideIcons.activity, title: 'New Assessment', route: '/assessment/vitals'),
                _buildMenuItem(context, icon: LucideIcons.messageSquare, title: 'AI Chatbot', route: '/chatbot'),
                const Divider(height: 32),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: OutlinedButton.icon(
              onPressed: () async {
                await context.read<AuthProvider>().logout();
                if (context.mounted) context.go('/');
              },
              icon: const Icon(LucideIcons.logOut, size: 18, color: Colors.red),
              label: const Text('Logout', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: const BorderSide(color: Color(0xFFFFD8D8)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, {required IconData icon, required String title, required String route}) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey[600], size: 22),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
      onTap: () {
        context.pop();
        context.go(route);
      },
    );
  }
}
