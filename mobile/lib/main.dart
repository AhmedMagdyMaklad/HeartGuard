import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme.dart';
import 'router.dart';
import 'providers/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final authProvider = AuthProvider();
  await authProvider.initialize();
  runApp(HeartGuardApp(authProvider: authProvider));
}

class HeartGuardApp extends StatelessWidget {
  final AuthProvider authProvider;
  const HeartGuardApp({super.key, required this.authProvider});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: authProvider,
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp.router(
            title: 'HeartGuard',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: ThemeMode.light,
            routerConfig: buildRouter(auth),
          );
        },
      ),
    );
  }
}
