import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart';

class PatientDiagnosisPage extends StatefulWidget {
  final int patientId; // 👈 Dashboard එකෙන් ලැබෙන Patient ID එක

  const PatientDiagnosisPage({super.key, required this.patientId});

  @override
  State<PatientDiagnosisPage> createState() => _PatientDiagnosisPageState();
}

class _PatientDiagnosisPageState extends State<PatientDiagnosisPage> {
  final Color primaryPink = const Color(0xFFF48FB1);
  final supabase = Supabase.instance.client;
  bool isLoading = true;
  Map<String, dynamic>? latestDiagnosis;

  @override
  void initState() {
    super.initState();
    fetchDiagnosisData();
  }

  // 🔄 Supabase එකෙන් Diagnosis දත්ත Fetch කරගැනීම
  Future<void> fetchDiagnosisData() async {
    try {
      final response = await supabase
          .from(
            'diagnosis',
          ) // 👈 ඔයාගේ Table එකේ නම (අවශ්‍ය නම් මෙහි නම වෙනස් කරන්න)
          .select()
          .eq('patient_id', widget.patientId)
          .order('diagnosis_date', ascending: false)
          .maybeSingle();

      setState(() {
        latestDiagnosis = response;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading diagnosis data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final localization = AppLocalizations.of(context)!;

    // Boolean අගයන් (true/false) Yes/No ලෙස පෙන්වීමට helper function එකක්
    String formatBoolean(dynamic value) {
      if (value == null) return '';
      return value == true ? 'Yes' : 'No';
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          localization.translate("diagnosis_details_title"),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: primaryPink,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: primaryPink))
          : latestDiagnosis == null
          ? Center(
              child: Text(
                "No diagnosis records found.",
                style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildReadOnlyView(
                    "Diagnosis Date",
                    latestDiagnosis?['diagnosis_date']?.toString(),
                  ),
                  _buildReadOnlyView(
                    "Hypertension",
                    formatBoolean(latestDiagnosis?['hypertension']),
                  ),
                  _buildReadOnlyView(
                    "Multiple Pregnancy",
                    formatBoolean(latestDiagnosis?['multiple_pregnancy']),
                  ),
                  _buildReadOnlyView(
                    "Vaginal Bleeding",
                    formatBoolean(latestDiagnosis?['vaginal_bleeding']),
                  ),
                  _buildReadOnlyView(
                    "Gestational Diabetes",
                    formatBoolean(latestDiagnosis?['gestational_diabetes']),
                  ),
                  _buildReadOnlyView(
                    "Anemia",
                    formatBoolean(latestDiagnosis?['anemia']),
                  ),
                  _buildReadOnlyView(
                    "Risk Level",
                    latestDiagnosis?['risk_level']?.toString(),
                  ),
                  _buildReadOnlyView(
                    "Other Conditions",
                    latestDiagnosis?['other_conditions']?.toString(),
                  ),
                  _buildReadOnlyView(
                    "Doctor Comments",
                    latestDiagnosis?['doctor_comments']?.toString(),
                  ),
                ],
              ),
            ),
    );
  }

  // අදාළ UI Design එක සඳහා Box Widget එක
  Widget _buildReadOnlyView(String label, String? value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: primaryPink.withOpacity(0.4), width: 1.2),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: primaryPink,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            (value != null && value.isNotEmpty) ? value : "Data here",
            style: TextStyle(
              fontSize: 15,
              color: (value != null && value.isNotEmpty)
                  ? Colors.black87
                  : Colors.grey.shade400,
            ),
          ),
        ],
      ),
    );
  }
}
