import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart'; // 🌍 Localization import කළා

class ClinicCareViewPage extends StatefulWidget {
  final int patientId; // 👈 Patient ID එක dashboard එකෙන් ලැබේ

  const ClinicCareViewPage({super.key, required this.patientId});

  @override
  State<ClinicCareViewPage> createState() => _ClinicCareViewPageState();
}

class _ClinicCareViewPageState extends State<ClinicCareViewPage> {
  final supabase = Supabase.instance.client;
  bool isLoading = true;
  List<Map<String, dynamic>> visits = [];

  @override
  void initState() {
    super.initState();
    fetchClinicCareData();
  }

  // 🔄 Supabase එකෙන් Clinic Care දත්ත Fetch කරගැනීම
  Future<void> fetchClinicCareData() async {
    try {
      // 1. මුලින්ම patient ට අදාළ active pregnancy_id එක සොයාගැනීම
      final pregnancyRes = await supabase
          .from('pregnancy')
          .select('pregnancy_id')
          .eq('patient_id', widget.patientId)
          .eq('pregnancy_status', 'ACTIVE')
          .maybeSingle();

      if (pregnancyRes != null) {
        final int pregnancyId = pregnancyRes['pregnancy_id'];

        // 2. ඊටපස්සේ එම pregnancy_id එකට අදාළ clinic_care වාර්තා ලබා ගැනීම
        final response = await supabase
            .from('clinic_care')
            .select()
            .eq('pregnancy_id', pregnancyId)
            .order('visit_date', ascending: false);

        setState(() {
          visits = List<Map<String, dynamic>>.from(response);
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading clinic care data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final local = AppLocalizations.of(context)!;

    // 🛠️ Detail Row Widget (Localized)
    Widget buildDetailRow(String labelKey, String? value, IconData icon) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFFC2185B), size: 18),
            const SizedBox(width: 10),
            Text(
              "${local.translate(labelKey)}:",
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.black54,
                fontSize: 13,
              ),
            ),
            const Spacer(),
            Expanded(
              flex: 2,
              child: Text(
                value ?? 'N/A',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                  fontSize: 13,
                ),
                textAlign: TextAlign.right,
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(
          local.translate("clinic_care_appbar"),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFF48FB1),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFF48FB1)),
            )
          : visits.isEmpty
          ? Center(
              child: Text(
                "No clinic records found.",
                style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Header Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF880E4F), Color(0xFFC2185B)],
                      ),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.local_hospital_rounded,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            local.translate("clinic_header_title"),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 15),

                  // Visits List (Auto-filled from Database with clean border fix)
                  ...visits.map(
                    (visit) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFFF48FB1).withOpacity(0.3),
                          width: 1.2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: ExpansionTile(
                          tilePadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 4,
                          ),
                          childrenPadding: const EdgeInsets.only(bottom: 12),
                          backgroundColor: Colors.white,
                          collapsedBackgroundColor: Colors.white,
                          title: Text(
                            "${local.translate('visit_date')}: ${visit['visit_date'] ?? 'N/A'}",
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF880E4F),
                              fontSize: 15,
                            ),
                          ),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              "${local.translate('poa')}: ${visit['poa'] ?? 'N/A'}",
                              style: const TextStyle(color: Colors.black54),
                            ),
                          ),
                          children: [
                            const Divider(
                              height: 1,
                              thickness: 0.8,
                              color: Color(0xFFFCE4EC),
                            ),
                            const SizedBox(height: 8),
                            buildDetailRow(
                              "weight",
                              visit['weight'] != null
                                  ? "${visit['weight']} kg"
                                  : null,
                              Icons.monitor_weight_rounded,
                            ),
                            buildDetailRow(
                              "bp",
                              (visit['bp_systolic'] != null &&
                                      visit['bp_diastolic'] != null)
                                  ? "${visit['bp_systolic']}/${visit['bp_diastolic']} mmHg"
                                  : null,
                              Icons.monitor_heart_rounded,
                            ),
                            buildDetailRow(
                              "urine_sugar",
                              visit['urine_sugar'],
                              Icons.water_drop_rounded,
                            ),
                            buildDetailRow(
                              "urine_albumin",
                              visit['urine_albumin'],
                              Icons.water_drop_rounded,
                            ),
                            buildDetailRow(
                              "pallor",
                              visit['pallor'],
                              Icons.face_rounded,
                            ),
                            buildDetailRow(
                              "oedema_ankle",
                              visit['oedema_ankle'],
                              Icons.accessibility_rounded,
                            ),
                            buildDetailRow(
                              "oedema_facial",
                              visit['oedema_facial'],
                              Icons.face_retouching_natural,
                            ),
                            buildDetailRow(
                              "fundal_height",
                              visit['fundal_height'] != null
                                  ? "${visit['fundal_height']} cm"
                                  : null,
                              Icons.straighten_rounded,
                            ),
                            buildDetailRow(
                              "foetal_lie",
                              visit['foetal_lie'],
                              Icons.child_care_rounded,
                            ),
                            buildDetailRow(
                              "presentation",
                              visit['presentation'],
                              Icons.pregnant_woman_rounded,
                            ),
                            buildDetailRow(
                              "engagement",
                              visit['engagement'],
                              Icons.done_rounded,
                            ),
                            buildDetailRow(
                              "fm",
                              visit['fm'],
                              Icons.bolt_rounded,
                            ),
                            buildDetailRow(
                              "fhs",
                              visit['fhs'] != null
                                  ? "${visit['fhs']} bpm"
                                  : null,
                              Icons.favorite_rounded,
                            ),
                            buildDetailRow(
                              "iron",
                              visit['iron'],
                              Icons.medication_rounded,
                            ),
                            buildDetailRow(
                              "folate",
                              visit['folate'],
                              Icons.medication_rounded,
                            ),
                            buildDetailRow(
                              "calcium",
                              visit['calcium'],
                              Icons.medication_rounded,
                            ),
                            buildDetailRow(
                              "vitamin_c",
                              visit['vitamin_c'],
                              Icons.medication_rounded,
                            ),
                            buildDetailRow(
                              "food_supplementation",
                              visit['food_supplementation'],
                              Icons.restaurant_rounded,
                            ),
                            buildDetailRow(
                              "officer_signature",
                              visit['officer_signature'],
                              Icons.badge_rounded,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
