import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'daily_patients_screen.dart';
import 'patient_reports_list_screen.dart';
import 'upcoming_visits_screen.dart';
import 'register_patient_screen.dart';

class DashboardScreen extends StatefulWidget {
  final String username;
  final int midwifeId;

  const DashboardScreen({super.key, required this.username, required this.midwifeId});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> { 
  final _supabase = Supabase.instance.client;

  // Theme colors
  final Color primaryPink = const Color(0xfff48fb1);
  final Color bgSoftPink = const Color(0xFFF9F0F4);
  final Color textDark = const Color(0xff2D3142);
  final Color textLight = const Color(0xff9094A6);

  // 🚀 FETCH NEAREST PNC CLINIC VISIT FROM SUPABASE (Fixed Query)
  Future<Map<String, dynamic>?> _fetchNearestPncVisit() async {
    final String todayStr = DateTime.now().toIso8601String().split('T')[0];

    try {
      final response = await _supabase
          .from('pnc_visits')
          .select('''
            next_clinic_date,
            pregnancy!inner(
              patient!inner(
                first_name,
                last_name,
                assigned_midwife_id
              )
            )
          ''')
          .not('next_clinic_date', 'is', null)
          .gte('next_clinic_date', todayStr)
          // 🚀 Target assigned_midwife_id on the PATIENT table
          .eq('pregnancy.patient.assigned_midwife_id', widget.midwifeId)
          .order('next_clinic_date', ascending: true)
          .limit(1)
          .maybeSingle();

      return response;
    } catch (e) {
      debugPrint('Error fetching nearest PNC visit: $e');
      return null;
    }
  }

  // Pure Dart date formatter (e.g. "2026-09-18" -> "Sep 18, 2026")
  String _formatClinicDate(String? rawDate) {
    if (rawDate == null || rawDate.isEmpty) return 'No Date';
    try {
      final dt = DateTime.parse(rawDate);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return "${months[dt.month - 1]} ${dt.day}, ${dt.year}";
    } catch (_) {
      return rawDate;
    }
  }

  // Logout Handler
  Future<void> _handleLogout() async {
    final bool? shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text("Logout"),
        content: const Text("Are you sure you want to log out of your account?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text("Cancel", style: TextStyle(color: textDark.withOpacity(0.6))),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Logout", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (shouldLogout == true) {
      await _supabase.auth.signOut();
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgSoftPink,
      bottomNavigationBar: BottomNavigationBar(
        selectedItemColor: primaryPink,
        unselectedItemColor: Colors.grey.shade400,
        showSelectedLabels: false,
        showUnselectedLabels: false,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month_rounded), label: 'Schedule'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildDailySummaryCard(),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Text(
                  "Quick Actions",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: textDark,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                  children: [
                    _buildActionCard(
                      title: "Patients",
                      icon: Icons.pregnant_woman_rounded,
                      color: primaryPink,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => DailyPatientsScreen(
                              username: widget.username,
                              midwifeId: widget.midwifeId,
                            ),
                          ),
                        );
                      },
                    ),
                    // 🚀 ADD PATIENT REPLACES ALL RECORDS
                    _buildActionCard(
  title: "Add Patient",
  icon: Icons.person_add_rounded,
  color: const Color(0xFF81C784), 
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RegisterPatientScreen(
          midwifeId: widget.midwifeId,
        ),
      ),
    );
  },
),
                    _buildActionCard(
                      title: "Schedule",
                      icon: Icons.event_note_rounded,
                      color: const Color(0xFF64B5F6),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => UpcomingVisitsScreen(
                              midwifeId: widget.midwifeId,
                            ),
                          ),
                        );
                      },
                    ),
                    _buildActionCard(
                      title: "Reports",
                      icon: Icons.analytics_rounded,
                      color: const Color(0xFFFFB74D),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PatientReportsListScreen(
                              midwifeId: widget.midwifeId,
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  // --- UI HELPER WIDGETS ---

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 30, 24, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Good morning,",
                style: TextStyle(fontSize: 16, color: textLight),
              ),
              const SizedBox(height: 4),
              Text(
                "Midwife ${widget.username}",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: textDark,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
          
          // Logout Button
          GestureDetector(
            onTap: _handleLogout,
            child: Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.redAccent.withOpacity(0.12),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 22),
            ),
          )
        ],
      ),
    );
  }

  // 🚀 DYNAMIC PNC NEAREST CLINIC VISIT CARD
  Widget _buildDailySummaryCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: FutureBuilder<Map<String, dynamic>?>(
        future: _fetchNearestPncVisit(),
        builder: (context, snapshot) {
          String patientName = "Loading...";
          String clinicDateStr = "Checking schedule...";
          bool hasData = false;

          if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasData && snapshot.data != null) {
              final data = snapshot.data!;
              final rawDate = data['next_clinic_date'] as String?;
              final pregnancyData = data['pregnancy'] as Map<String, dynamic>?;
              final patientData = pregnancyData?['patient'] as Map<String, dynamic>?;

              final firstName = patientData?['first_name'] ?? '';
              final lastName = patientData?['last_name'] ?? '';

              patientName = "$firstName $lastName".trim();
              if (patientName.isEmpty) patientName = "Unknown Patient";

              clinicDateStr = _formatClinicDate(rawDate);
              hasData = true;
            } else {
              patientName = "No Upcoming Visits";
              clinicDateStr = "All PNC clinic visits are complete";
            }
          }

          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => UpcomingVisitsScreen(midwifeId: widget.midwifeId),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [primaryPink, primaryPink.withOpacity(0.85)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: primaryPink.withOpacity(0.35),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  )
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.calendar_month_rounded, color: Colors.white, size: 20),
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            "NEAREST PNC CLINIC DATE",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                      const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white70, size: 16),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Patient Name
                  Text(
                    patientName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Next Clinic Date
                  Row(
                    children: [
                      const Icon(Icons.event_available_rounded, color: Colors.white70, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        clinicDateStr,
                        style: TextStyle(
                          color: hasData ? Colors.white : Colors.white70,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildActionCard({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                color: textDark,
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
          ],
        ),
      ),
    );
  }
}