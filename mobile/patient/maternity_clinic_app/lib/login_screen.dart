import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart';

import 'patient_dashboard.dart';
import 'register_screen.dart';
import 'waiting_room.dart';
import 'main.dart'; // 🔴 MyApp එකේ setLocale එක ගන්න මේක අනිවාර්යයෙන්ම ඕනේ

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

// 🛠️ මෙතන නම නිවැරදි කරා: _MyAppStateScreen -> _LoginScreenState
class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool isLoading = false;

  final Color primaryPink = const Color(0xfff48fb1);
  final Color darkText = const Color(0xff3a3a3a);

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email and password')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final supabase = Supabase.instance.client;

      // 1. Login using Supabase Auth
      final authResponse = await supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (authResponse.user == null) {
        throw "Invalid login";
      }

      // 2. Get user_id from users table
      final userData = await supabase
          .from('users')
          .select('user_id')
          .eq('email', email)
          .single();

      final int userId = userData['user_id'];

      // 3. Get patient details
      final patientData = await supabase
          .from('patient')
          .select('patient_id, status')
          .eq('user_id', userId)
          .single();

      final int patientId = patientData['patient_id'];
      final String status = patientData['status'];

      // 4. Navigate
      if (status == 'approved') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => PatientDashboardPage(patientId: patientId),
          ),
        );
      } else if (status == 'pending') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => const WaitingRoomScreen(lang: 'si'),
          ),
        );
      } else if (status == 'rejected') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your registration has been rejected by midwife'),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 🌄 Background image
          Positioned.fill(
            child: Opacity(
              opacity: 0.70,
              child: Image.asset(
                'assets/maternity_bg.jpg',
                fit: BoxFit.cover,
                alignment: const Alignment(0.0, -0.2),
              ),
            ),
          ),

          // 🌫 Gradient overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withOpacity(0.15),
                    Colors.white.withOpacity(0.55),
                    Colors.white.withOpacity(0.85),
                  ],
                ),
              ),
            ),
          ),

          // 🌍 DYNAMIC LANGUAGE BUTTON (ENGLISH & SINHALA TOGGLE)
          Positioned(
            top: 45,
            right: 20,
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF48FB1), Color(0xFFF06292)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(25),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFF48FB1).withOpacity(0.45),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: ElevatedButton.icon(
                onPressed: () {
                  Locale currentLocale = Localizations.localeOf(context);

                  if (currentLocale.languageCode == 'en') {
                    MyApp.setLocale(context, const Locale('si'));
                  } else {
                    MyApp.setLocale(context, const Locale('en'));
                  }
                },
                icon: const Icon(
                  Icons.g_translate_rounded,
                  color: Colors.white,
                  size: 16,
                ),
                label: Text(
                  Localizations.localeOf(context).languageCode == 'en'
                      ? "EN"
                      : "SI",
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    letterSpacing: 0.5,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ),
          ),

          // 🧾 UI CONTENT (අර ?? operator සියල්ලම මෙතනින් ඉවත් කර පිරිසිදු කර ඇත)
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  children: [
                    const SizedBox(height: 60),

                    // Welcome Title
                    Text(
                      AppLocalizations.of(context)!.translate("welcome_title"),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.bold,
                        color: darkText,
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Subtitle
                    Text(
                      AppLocalizations.of(context)!.translate("login_subtitle"),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        color: darkText.withOpacity(0.8),
                      ),
                    ),

                    const SizedBox(height: 40),

                    // EMAIL FIELD
                    TextField(
                      controller: _emailController,
                      decoration: InputDecoration(
                        labelText: AppLocalizations.of(
                          context,
                        )!.translate("email"),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.8),
                        prefixIcon: Icon(
                          Icons.email_outlined,
                          color: primaryPink,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // PASSWORD FIELD
                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: AppLocalizations.of(
                          context,
                        )!.translate("password"),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.8),
                        prefixIcon: Icon(
                          Icons.lock_outline,
                          color: primaryPink,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // LOGIN BUTTON
                    SizedBox(
                      height: 56,
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryPink,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 2,
                        ),
                        child: isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                            : Text(
                                AppLocalizations.of(
                                  context,
                                )!.translate("login"),
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // REGISTER LINK
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const RegisterScreen(),
                          ),
                        );
                      },
                      style: TextButton.styleFrom(foregroundColor: primaryPink),
                      child: Text(
                        AppLocalizations.of(
                          context,
                        )!.translate("no_account_register"),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
