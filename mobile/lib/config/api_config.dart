class ApiConfig {
  // ── PRODUCTION (Vercel) ─────────────────────────────────────────
  static const String baseUrl = 'https://heartguard-app.vercel.app';

  // ── LOCAL DEVELOPMENT (uncomment one, comment out production) ───
  // static const String baseUrl = 'http://localhost:3001';        // Web / iOS Simulator
  // static const String baseUrl = 'http://10.0.2.2:3001';         // Android Emulator
  // static const String baseUrl = 'http://192.168.1.100:3001';    // Physical Device (your LAN IP)
}
