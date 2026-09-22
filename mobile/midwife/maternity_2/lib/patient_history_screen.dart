import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PatientHistoryScreen extends StatelessWidget {
  final String patientId;
  final String patientName;

  const PatientHistoryScreen({
    super.key,
    required this.patientId,
    required this.patientName,
  });

  // This function fetches both tables at the exact same time
  Future<Map<String, List<Map<String, dynamic>>>> _fetchPatientReports() async {
    final supabase = Supabase.instance.client;

    final results = await Future.wait([
      supabase
          .from('pnc_visits')
          .select('*, pregnancy!inner(patient_id)')
          .eq('pregnancy.patient_id', patientId),
          
      supabase
          .from('pre_conception_assessment')
          .select('*, pregnancy!inner(patient_id)')
          .eq('pregnancy.patient_id', patientId),
    ]);

    return {
      'pnc': List<Map<String, dynamic>>.from(results[0]),
      'preConception': List<Map<String, dynamic>>.from(results[1]),
    };
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryPink = Color(0xfff48fb1);

    return Scaffold(
      backgroundColor: const Color(0xFFF9F0F4),
      appBar: AppBar(
        title: Text("$patientName's History", style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff2D3142),
        elevation: 0,
        centerTitle: true,
      ),
      body: FutureBuilder<Map<String, List<Map<String, dynamic>>>>(
        future: _fetchPatientReports(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: primaryPink));
          }

          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }

          final pncVisits = snapshot.data?['pnc'] ?? [];
          final preConception = snapshot.data?['preConception'] ?? [];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // --- SECTION 1: PNC VISITS ---
                Text("PNC Visits (${pncVisits.length})", 
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xff2D3142))),
                const SizedBox(height: 8),
                if (pncVisits.isEmpty)
                  const Text("No PNC visit records found.", style: TextStyle(color: Colors.grey))
                else
                  ...pncVisits.asMap().entries.map((entry) {
                    int index = entry.key; // Gets the position (0, 1, 2...)
                    var visit = entry.value; // Gets the actual visit data

                    return Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0xFF81D4FA), // Soft blue
                          child: Icon(Icons.child_care, color: Colors.white),
                        ),
                        // ✅ Title now dynamically shows "Visit 1", "Visit 2", etc.
                        title: Text("Visit ${index + 1}", style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text("Date: ${visit['visit_date'] ?? 'N/A'}"),

                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                        onTap: () {
                          // ✅ UPDATED: Navigates to the details screen!
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ReportDetailScreen(
                                // ✅ Detail screen title also matches the visit number
                                title: "PNC Visit ${index + 1} Details",
                                data: visit, 
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  }),
                const SizedBox(height: 24),

                // --- SECTION 2: PRE-CONCEPTION ASSESSMENT ---
                Text("Pre-Conception Assessments (${preConception.length})", 
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xff2D3142))),
                const SizedBox(height: 8),
                if (preConception.isEmpty)
                  const Text("No pre-conception assessment records found.", style: TextStyle(color: Colors.grey))
                else
                  ...preConception.map((form) => Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Color(0xFFCE93D8), // Soft purple
                        child: Icon(Icons.description, color: Colors.white),
                      ),
                      title: Text("Form ID: #${form['assessment_id'] ?? 'Unknown'}", style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: const Text("Date: Not Recorded"),

                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () {                        
                        // ✅ UPDATED: Navigates to the details screen!
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ReportDetailScreen(
                              title: "Pre-Conception Assessment",
                              data: form, 
                            ),
                          ),
                        );
                      },
                    ),
                  )),
              ],
            ),
          );
        },
      ),
    );
  }
}


// --- 🚀 NEW SCREEN ADDED BELOW ---

class ReportDetailScreen extends StatelessWidget {
  final String title;
  final Map<String, dynamic> data;

  const ReportDetailScreen({super.key, required this.title, required this.data});

  // This helper magically turns database keys like 'mother_temp' into 'Mother Temp'
  String _formatKey(String key) {
    return key
        .split('_')
        .map((word) => word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1)}' : '')
        .join(' ');
  }

  @override
  Widget build(BuildContext context) {
    // Clean the data: Remove the internal 'pregnancy' join data and any empty/null fields
    final displayData = Map.from(data)
      ..removeWhere((key, value) => key == 'pregnancy' || value == null || value == '');

    return Scaffold(
      appBar: AppBar(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xff2D3142),
        elevation: 0,
      ),
      backgroundColor: const Color(0xFFF9F0F4), // Matching your app's background
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: displayData.keys.length,
        itemBuilder: (context, index) {
          String key = displayData.keys.elementAt(index);
          dynamic value = displayData[key];

          return Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              title: Text(
                _formatKey(key),
                style: const TextStyle(fontSize: 13, color: Colors.grey),
              ),
              subtitle: Text(
                value.toString(),
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xff2D3142)),
              ),
            ),
          );
        },
      ),
    );
  }
}