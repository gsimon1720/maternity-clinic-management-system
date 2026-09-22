import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'patient_history_screen.dart'; // We will create this in Step 3

class PatientReportsListScreen extends StatelessWidget {
  final int midwifeId;

  const PatientReportsListScreen({super.key, required this.midwifeId});

  @override
  Widget build(BuildContext context) {
    final supabase = Supabase.instance.client;
    const Color primaryPink = Color(0xfff48fb1);
    const Color bgSoftPink = Color(0xFFF9F0F4);

    return Scaffold(
      backgroundColor: bgSoftPink,
      appBar: AppBar(
        title: const Text("Patient Medical History", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff2D3142),
        elevation: 0,
        centerTitle: true,
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        // 🚀 CHANGED QUERY: We now ask for '*, pregnancy(pregnancy_no)' 
        future: supabase
            .from('patient')
            .select('*, pregnancy(pregnancy_no)')
            .eq('assigned_midwife_id', midwifeId)
            .eq('status', 'approved'),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: primaryPink));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("No patient profiles found."));
          }

          final patients = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: patients.length,
            itemBuilder: (context, index) {
              final patient = patients[index];

              // Step 3: Extract and combine first_name + last_name
              final firstName = patient['first_name']?.toString() ?? '';
              final lastName = patient['last_name']?.toString() ?? '';
              final fullName = '$firstName $lastName'.trim();
              final displayName = fullName.isNotEmpty ? fullName : 'Unknown Patient';

              // Step 4: Extract patient_id from DB
              final patientId = patient['patient_id']?.toString() ?? '';

              // 🚀 NEW LOGIC: Extract and find the highest pregnancy_no
              String pregnancyNoStr = 'N/A';
              if (patient['pregnancy'] != null) {
                List<dynamic> pregnancies = patient['pregnancy'];
                if (pregnancies.isNotEmpty) {
                  // Sort them so the highest pregnancy number is at the top
                  pregnancies.sort((a, b) => (b['pregnancy_no'] ?? 0).compareTo(a['pregnancy_no'] ?? 0));
                  pregnancyNoStr = pregnancies.first['pregnancy_no']?.toString() ?? 'N/A';
                }
              }

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFFFB74D), // Matching dashboard card orange tint
                    child: Icon(Icons.folder_open_rounded, color: Colors.white),
                  ),
                  title: Text(
                      displayName, 
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  // 🚀 UPDATED UI: Showing Preg No right after Patient ID
                  subtitle: Text("Patient ID: $patientId | Preg No: $pregnancyNoStr"),
                  trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.grey),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PatientHistoryScreen(
                          patientId: patientId,
                          patientName: displayName,
                        ),
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