import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'patient_action_screen.dart'; // We will need this file next!

class DailyPatientsScreen extends StatefulWidget {
  final String username;
  final int midwifeId;

  const DailyPatientsScreen({
    super.key,
    required this.username,
    required this.midwifeId,
  });

  @override
  State<DailyPatientsScreen> createState() => _DailyPatientsScreenState();
}

class _DailyPatientsScreenState extends State<DailyPatientsScreen> {
  final _supabase = Supabase.instance.client;
  
  // Theme colors matching your dashboard
  final Color primaryPink = const Color(0xfff48fb1);
  final Color bgSoftPink = const Color(0xFFF9F0F4); 
  final Color textDark = const Color(0xff2D3142);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgSoftPink,
      appBar: AppBar(
        title: const Text(
          "Patient's assigned",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: textDark,
        elevation: 0,
        centerTitle: true,
      ),
      
      // 🚀 CHANGED QUERY: We now ask for '*, pregnancy(pregnancy_no)' 
      // This automatically joins the patient's pregnancy records!
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _supabase
            .from('patient')
            .select('*, pregnancy(pregnancy_no,pregnancy_status)')
            .eq('assigned_midwife_id', widget.midwifeId)
            .eq('status', 'approved'),
        builder: (context, snapshot) {
          
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator(color: primaryPink));
          }
          
          if (snapshot.hasError) {
            return Center(child: Text("Error loading patients: ${snapshot.error}"));
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_available_rounded, size: 64, color: primaryPink.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  Text(
                    "No patients assigned.",
                    style: TextStyle(fontSize: 18, color: textDark.withOpacity(0.7)),
                  ),
                ],
              ),
            );
          }

          final patients = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: patients.length,
            itemBuilder: (context, index) {
              final patient = patients[index];

              final firstName = patient['first_name']?.toString() ?? '';
              final lastName = patient['last_name']?.toString() ?? '';
              final fullName = '$firstName $lastName'.trim();
              
              // 🚀 NEW LOGIC: Extract and find the highest pregnancy_no
              String pregnancyNoStr = 'N/A';
              String pregnancyStatusStr = '';
              if (patient['pregnancy'] != null) {
                List<dynamic> pregnancies = patient['pregnancy'];
                if (pregnancies.isNotEmpty) {
                  // Sort them so the highest pregnancy number is at the top
                  pregnancies.sort((a, b) => (b['pregnancy_no'] ?? 0).compareTo(a['pregnancy_no'] ?? 0));
                  pregnancyNoStr = pregnancies.first['pregnancy_no']?.toString() ?? 'N/A';
                  pregnancyStatusStr = pregnancies.first['pregnancy_status']?.toString() ?? 'Unknown';
                }
              }
              
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: primaryPink.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: primaryPink.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.pregnant_woman_rounded, color: primaryPink),
                  ),
                  title: Text(
                    fullName.isNotEmpty ? fullName : 'Unknown Patient',
                    style: TextStyle(fontWeight: FontWeight.bold, color: textDark, fontSize: 16),
                  ),
                  // 🚀 UPDATED UI: Showing Preg No right after Age
                  subtitle: Text(
                   "Age: ${patient['age']?.toString() ?? 'N/A'} | Preg No: $pregnancyNoStr ($pregnancyStatusStr)\nTap to fill field notes",
                    style: TextStyle(color: textDark.withOpacity(0.6)),
                  ),
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 16, color: primaryPink),
                  
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PatientActionScreen(patientData: patient),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}