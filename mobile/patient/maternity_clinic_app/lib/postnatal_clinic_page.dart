import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart';

class PostnatalClinicPage extends StatefulWidget {
  final int patientId;

  const PostnatalClinicPage({super.key, required this.patientId});

  @override
  State<PostnatalClinicPage> createState() => _PostnatalClinicPageState();
}

class _PostnatalClinicPageState extends State<PostnatalClinicPage> {
  final Color primaryPink = const Color(0xFFF48FB1);
  final supabase = Supabase.instance.client;
  bool isLoading = true;
  Map<String, dynamic>? latestVisit;

  @override
  void initState() {
    super.initState();
    fetchPostnatalClinicData();
  }

  // 🔄 Supabase එකෙන් දත්ත Fetch කරගැනීම
  Future<void> fetchPostnatalClinicData() async {
    try {
      // 1. මුලින්ම patient ට අදාළ ACTIVE pregnancy_id එක සොයාගැනීම
      final pregnancyRes = await supabase
          .from('pregnancy')
          .select('pregnancy_id')
          .eq('patient_id', widget.patientId)
          .eq('pregnancy_status', 'ACTIVE')
          .maybeSingle();

      if (pregnancyRes != null) {
        final int pregnancyId = pregnancyRes['pregnancy_id'];

        // 2. Database Table එකෙන් ළඟම (latest) වාර්තාව ලබා ගැනීම
        // (Table Name එක ඔබේ Supabase එකට අනුව 'postnatal_clinic_care' හෝ 'pnc_visits' ලෙස යොදන්න)
        final response = await supabase
            .from('postnatal_clinic_care')
            .select()
            .eq('pregnancy_id', pregnancyId)
            .eq(
              'is_deleted',
              false,
            ) // Soft delete වී නැති දත්ත පමණක් ලබා ගැනීමට
            .order('visit_date', ascending: false)
            .maybeSingle();

        setState(() {
          latestVisit = response;
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
        SnackBar(content: Text('Error loading postnatal clinic data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final localization = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          localization.translate("postnatal_clinic_care_title"),
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
          : latestVisit == null
          ? Center(
              child: Text(
                "No postnatal clinic records found.",
                style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // 1. සායනික මූලික තොරතුරු
                  _buildReadOnlyView(
                    localization.translate("date"),
                    latestVisit?['visit_date']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("doctor"),
                    _formatExaminedBy(
                      latestVisit?['examined_by'],
                      latestVisit?['designation'],
                    ),
                  ),

                  // 2. ශාරීරික රෝග ලක්ෂණ පරීක්ෂාව
                  _buildReadOnlyView(
                    localization.translate("postnatal_breast_problems"),
                    latestVisit?['breast_problems']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("postnatal_abnormal_discharge"),
                    latestVisit?['abnormal_vaginal_discharge']
                        ?.toString(), // 👈 Updated key
                  ),
                  _buildReadOnlyView(
                    localization.translate(
                      "postnatal_excessive_vaginal_bleeding",
                    ),
                    latestVisit?['excessive_vaginal_bleeding']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("postnatal_pallor"),
                    latestVisit?['pallor']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("postnatal_icterus"),
                    latestVisit?['icterus']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("postnatal_oedema"),
                    latestVisit?['oedema']?.toString(),
                  ),

                  // 3. රුධිර පීඩනය සහ පද්ධතිමය පරීක්ෂණ
                  _buildReadOnlyView(
                    localization.translate("postnatal_bp"),
                    (latestVisit?['blood_pressure_systolic'] != null &&
                            latestVisit?['blood_pressure_diastolic'] !=
                                null) // 👈 Updated keys
                        ? "${latestVisit!['blood_pressure_systolic']}/${latestVisit!['blood_pressure_diastolic']} mmHg"
                        : null,
                  ),
                  _buildReadOnlyView(
                    localization.translate("cardiovascular_system"),
                    latestVisit?['cardiovascular_system']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("respiratory_system"),
                    latestVisit?['respiratory_system']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("abdominal_examination"),
                    latestVisit?['abdominal_examination']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("vaginal_examination"),
                    latestVisit?['vaginal_examination']?.toString(),
                  ),

                  // 4. මානසික සෞඛ්‍යය
                  _buildReadOnlyView(
                    localization.translate("postnatal_epds_score"),
                    latestVisit?['mental_status_epds']
                        ?.toString(), // 👈 Updated key
                  ),
                  _buildReadOnlyView(
                    localization.translate("other_mental_status"),
                    latestVisit?['other_mental_status']?.toString(), // 👈 Added
                  ),

                  // 5. හඳුනාගත් ගැටලු සහ පවුල් සැලසුම්
                  _buildReadOnlyView(
                    localization.translate("postnatal_identified_problems"),
                    latestVisit?['problems_identified']
                        ?.toString(), // 👈 Updated key
                  ),
                  _buildReadOnlyView(
                    localization.translate("family_planning_method"),
                    latestVisit?['family_planning_method']?.toString(),
                  ),
                  _buildReadOnlyView(
                    localization.translate("reason_for_choice"),
                    latestVisit?['reason_for_choice']?.toString(), // 👈 Added
                  ),
                  _buildReadOnlyView(
                    localization.translate("postnatal_special_notes"),
                    latestVisit?['special_notes']?.toString(),
                  ),

                  // 6. ඊළඟ සායන වාරයේ විස්තර (Next Clinic Details)
                  if (latestVisit?['clinic_date'] != null) ...[
                    const Divider(height: 32, thickness: 1),
                    _buildReadOnlyView(
                      "Next Clinic Place",
                      latestVisit?['clinic_place']?.toString(),
                    ),
                    _buildReadOnlyView(
                      "Next Clinic Date & Time",
                      _formatNextClinicDateTime(
                        latestVisit?['clinic_date'],
                        latestVisit?['clinic_time'],
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  // 👨‍⚕️ නිලධාරියාගේ නම සහ තනතුර එකට Format කරගැනීමට Helper Function එකක්
  String? _formatExaminedBy(String? name, String? designation) {
    if (name == null || name.isEmpty) return null;
    if (designation != null && designation.isNotEmpty) {
      return "$name ($designation)";
    }
    return name;
  }

  // 📅 ඊළඟ සායන දිනය සහ වේලාව එකට Format කරගැනීමට Helper Function එකක්
  String? _formatNextClinicDateTime(dynamic date, dynamic time) {
    if (date == null) return null;
    String dateStr = date.toString();
    if (time != null && time.toString().isNotEmpty) {
      return "$dateStr at ${time.toString()}";
    }
    return dateStr;
  }

  // 🎨 UI Display Card Component එක
  Widget _buildReadOnlyView(String label, String? value) {
    final bool hasData = value != null && value.trim().isNotEmpty;

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
            hasData ? value : "Not Specified / No Record",
            style: TextStyle(
              fontSize: 15,
              fontWeight: hasData ? FontWeight.w500 : FontWeight.normal,
              color: hasData ? Colors.black87 : Colors.grey.shade400,
            ),
          ),
        ],
      ),
    );
  }
}
