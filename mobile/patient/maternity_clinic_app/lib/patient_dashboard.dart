import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart';
import 'custom_app_drawer.dart';
import 'obstetric_history.dart';
import 'pregnancy_status_view.dart';
import 'clinic_care_view.dart';
import 'clinic_investigations_view.dart';
import 'pregnancy_charts_view.dart';
import 'birth_emergency_plan_page.dart';
import 'patient_profile.dart';
import 'postpartum_field_care.dart';
import 'postnatal_clinic_page.dart';
import 'pregnancy_assessment_view_page.dart';

class PatientDashboardPage extends StatefulWidget {
  final int patientId;

  const PatientDashboardPage({super.key, required this.patientId});

  @override
  State<PatientDashboardPage> createState() => _PatientDashboardPageState();
}

class _PatientDashboardPageState extends State<PatientDashboardPage> {
  final supabase = Supabase.instance.client;

  Map<String, dynamic>? patientData;
  Map<String, dynamic>? currentPregnancyData;
  Map<String, dynamic>? postpartumData;
  bool isLoading = true;
  int? pregnancyId;
  String poaFromClinicCare = 'N/A';

  @override
  void initState() {
    super.initState();
    fetchPatientData();
  }

  Future<void> fetchPatientData() async {
    try {
      final response = await supabase
          .from('patient')
          .select()
          .eq('patient_id', widget.patientId)
          .maybeSingle();

      final pregnancyResponse = await supabase
          .from('pregnancy')
          .select()
          .eq('patient_id', widget.patientId)
          .eq('pregnancy_status', 'ACTIVE')
          .maybeSingle();

      setState(() {
        patientData = response;
        if (pregnancyResponse != null) {
          pregnancyId = pregnancyResponse['pregnancy_id'] as int?;
          currentPregnancyData = pregnancyResponse;
        }
        isLoading = false;
      });

      String? fetchedPoa;
      if (pregnancyResponse != null && pregnancyId != null) {
        final clinicCareResponse = await supabase
            .from('clinic_care')
            .select('poa')
            .eq('pregnancy_id', pregnancyId!)
            .order('created_at', ascending: false)
            .limit(1)
            .maybeSingle();

        if (clinicCareResponse != null && clinicCareResponse['poa'] != null) {
          fetchedPoa = clinicCareResponse['poa'].toString();
        }
      }

      setState(() {
        poaFromClinicCare = fetchedPoa ?? 'N/A';
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error loading patient data: $e')));
    }
  }

  int calculatePeriodWeeks(String? lmpDateStr) {
    if (lmpDateStr == null) return 0;
    try {
      DateTime lmpDate = DateTime.parse(lmpDateStr);
      DateTime today = DateTime.now();
      int differenceInDays = today.difference(lmpDate).inDays;
      if (differenceInDays < 0) return 0;
      return (differenceInDays / 7).floor();
    } catch (e) {
      return 0;
    }
  }

  Widget buildDashboardCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFF48FB1).withOpacity(0.15),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.12),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 30),
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFF48FB1)),
        ),
      );
    }

    String firstName = patientData?['first_name'] ?? '';
    String lastName = patientData?['last_name'] ?? '';
    String fullName = '$firstName $lastName'.trim();
    if (fullName.isEmpty) {
      fullName = "Patient";
    }

    int calculatedWeeks = calculatePeriodWeeks(currentPregnancyData?['lmp']);
    int displayWeeks =
        currentPregnancyData?['period_of_amenorrhoea_weeks'] ?? calculatedWeeks;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(
          AppLocalizations.of(context)!.translate("app_name"),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFF48FB1),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      drawer: CustomAppDrawer(
        patientId: widget.patientId,
        patientName: fullName,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(
                left: 20,
                right: 20,
                bottom: 25,
                top: 10,
              ),
              decoration: const BoxDecoration(
                color: Color(0xFFF48FB1),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppLocalizations.of(context)!.translate("welcome_back"),
                    style: const TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    fullName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Banner Section
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.pink.shade50, Colors.white],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: Colors.pink.shade100.withOpacity(0.5),
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppLocalizations.of(
                                  context,
                                )!.translate("healthy_pregnancy"),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF880E4F),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                AppLocalizations.of(
                                  context,
                                )!.translate("banner_desc"),
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Colors.black54,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Image.asset(
                          'assets/dashboard.jpg',
                          height: 95,
                          fit: BoxFit.contain,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 25),

                  // Current Pregnancy Summary Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFFF48FB1).withOpacity(0.3),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.pregnant_woman_rounded,
                              color: Color(0xFFC2185B),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                AppLocalizations.of(
                                  context,
                                )!.translate("current_pregnancy_summary"),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFC2185B),
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        currentPregnancyData == null
                            ? Text(
                                AppLocalizations.of(
                                  context,
                                )!.translate("no_active_pregnancy"),
                                style: const TextStyle(
                                  color: Colors.black54,
                                  fontSize: 13,
                                ),
                              )
                            : Column(
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          "${AppLocalizations.of(context)!.translate("lmp")}: ${currentPregnancyData?['lmp'] ?? 'N/A'}",
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w500,
                                            fontSize: 12.5,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          "${AppLocalizations.of(context)!.translate("edd")}: ${currentPregnancyData?['edd'] ?? 'N/A'}",
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w500,
                                            fontSize: 12.5,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                          textAlign: TextAlign.end,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          "${AppLocalizations.of(context)!.translate("status")}: ${currentPregnancyData?['pregnancy_status'] ?? 'N/A'}",
                                          style: const TextStyle(
                                            color: Colors.black87,
                                            fontSize: 12.5,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          "${AppLocalizations.of(context)!.translate("period")}: $displayWeeks ${AppLocalizations.of(context)!.translate("weeks_label")}",
                                          style: const TextStyle(
                                            color: Colors.black87,
                                            fontSize: 12.5,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                          textAlign: TextAlign.end,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 25),

                  Text(
                    AppLocalizations.of(context)!.translate("categories_title"),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFC2185B),
                    ),
                  ),
                  const SizedBox(height: 15),

                  // Categories Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.85,
                    children: [
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(
                          context,
                        )!.translate("patient_details"),
                        Icons.person_rounded,
                        const Color(0xFFC2185B),
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                PatientProfilePage(patientId: widget.patientId),
                          ),
                        ),
                      ),
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(
                          context,
                        )!.translate("obstetric_history"),
                        Icons.assignment_rounded,
                        const Color(0xFFEC407A),
                        () {
                          if (pregnancyId != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ObstetricHistoryPage(
                                  pregnancyId: pregnancyId!,
                                ),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'No active pregnancy record found for this patient.',
                                ),
                              ),
                            );
                          }
                        },
                      ),
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(
                          context,
                        )!.translate("pregnancy_status"),
                        Icons.analytics_rounded,
                        const Color(0xFFE91E63),
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const PregnancyStatusViewPage(),
                          ),
                        ),
                      ),
                      
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(
                          context,
                        )!.translate("Pregnancy Assessment"),
                        Icons.assessment_rounded,
                        const Color(0xFFC2185B),
                        () {
                          if (pregnancyId != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    PregnancyAssessmentViewPage(
                                      pregnancyId: pregnancyId!,
                                    ),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'No active pregnancy record found for this patient.',
                                ),
                              ),
                            );
                          }
                        },
                      ),
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(context)!.translate("clinic_care"),
                        Icons.local_hospital_rounded,
                        const Color(0xFFF48FB1),
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                ClinicCareViewPage(patientId: widget.patientId),
                          ),
                        ),
                      ),
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(
                          context,
                        )!.translate("investigations_tests"),
                        Icons.science_rounded,
                        const Color(0xFFEC407A),
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ClinicInvestigationsViewPage(
                              patientId: widget.patientId,
                            ),
                          ),
                        ),
                      ),
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(context)!.translate("charts"),
                        Icons.insert_chart_rounded,
                        const Color(0xFFE91E63),
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                const StandardMaternityChartsPage(),
                          ),
                        ),
                      ),
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(
                          context,
                        )!.translate("postpartum_care_appbar"),
                        Icons.child_friendly_rounded,
                        const Color(0xFFF48FB1),
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PregnancyVisitsListPage(
                              patientId: widget.patientId,
                            ),
                          ),
                        ),
                      ),
                      buildDashboardCard(
                        context,
                        AppLocalizations.of(
                          context,
                        )!.translate("postnatal_clinic_care_title"),
                        Icons.medical_services_rounded,
                        const Color(0xFFF48FB1),
                        () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PostnatalClinicPage(
                              patientId: widget.patientId,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Emergency Plan Button
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFFF48FB1).withOpacity(0.15),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.12),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: InkWell(
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const BirthEmergencyPlanPage(),
                        ),
                      ),
                      borderRadius: BorderRadius.circular(20),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 16,
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.red.shade50,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.gpp_maybe_rounded,
                                color: Colors.red.shade400,
                                size: 28,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppLocalizations.of(
                                      context,
                                    )!.translate("emergency_plan"),
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  Text(
                                    AppLocalizations.of(
                                      context,
                                    )!.translate("emergency_plan_desc"),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.black54,
                                    ),
                                  ),
                                   
                                ],
                                
                              ),
                            ),
                            Icon(
                              Icons.chevron_right_rounded,
                              color: Colors.grey.shade400,
                              size: 24,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 25),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
