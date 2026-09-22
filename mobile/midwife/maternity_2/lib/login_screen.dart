import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget { 
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool isLoading = false; // Fixed: Matches the variable used in build method

  final Color primaryPink = const Color(0xfff48fb1);
  final Color darkText = const Color(0xff3a3a3a);

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // The login function
  Future<void> _loginUser() async {
    setState(() {
      isLoading = true; // Fixed to match your variable name
    });

    try {
      // Fixed: Now uses _usernameController to match your declaration
      final email = _usernameController.text.trim(); 
      final password = _passwordController.text.trim();

      // 1. Authenticate securely with Supabase Auth
      final AuthResponse res = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (res.session != null && mounted) {
        // 2. Fetch the user's role from YOUR 'users' table
        final userData = await Supabase.instance.client
            .from('users')
            .select('role, user_id, full_name') // Pulling the role and ID
            .eq('email', email)
            .maybeSingle(); 

        if (userData == null) {
          throw Exception("User authenticated, but profile not found in the users table.");
        }

        final String role = userData['role'];
        final String midwifeName = userData['full_name'] ?? 'Midwife'; // Gets the name, defaults to 'Midwife' if null
        final int midwifeId = userData['user_id'];
        // 3. Route the user based on their role
        if (mounted) {
          if (role == 'MIDWIFE') {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
  builder: (context) => DashboardScreen(
    username: midwifeName,
    midwifeId: midwifeId, // Make sure 'midwifeId' is passed here!
  ),
),
            );
          } else if (role == 'PATIENT') {
            // Temporarily commented out until you build this screen!
            /*
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const PatientDashboardScreen()), 
            );
            */
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Patient Dashboard coming soon!')),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Access denied for role: $role')),
            );
          }
        }
      }
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login Failed: ${e.message}'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false; // Fixed to match your variable name
        });
      }
    }
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
                'assets/images/maternal.jpg', 
                fit: BoxFit.cover,
                alignment: const Alignment(0.0, -0.2),
                errorBuilder: (context, error, stackTrace) {
                  return Container(color: Colors.pink.shade50);
                },
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

          // UI CONTENT
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  children: [
                    const SizedBox(height: 60),

                    // Welcome Title
                    Text(
                      "Welcome to\nMaternity Care",
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
                      "Sign in to your patient account",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        color: darkText.withOpacity(0.8),
                      ),
                    ),

                    const SizedBox(height: 40),

                    // EMAIL FIELD
                    TextField(
                      controller: _usernameController,
                      decoration: InputDecoration(
                        labelText: "Email", // Changed to Email to match Supabase Auth
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.8),
                        prefixIcon: Icon(
                          Icons.person_outlined,
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
                        labelText: "Password",
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
                        onPressed: isLoading ? null : _loginUser, // Fixed: Now matches function name
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
                            : const Text(
                                "Login",
                                style: TextStyle(
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
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Registration screen coming soon!'),
                          ),
                        );
                      },
                      style: TextButton.styleFrom(foregroundColor: primaryPink),
                      child: const Text("Don't have an account? Register"),
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