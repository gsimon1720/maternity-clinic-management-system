import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart'; // Localization සඳහා (ඔබගේ ෆෝල්ඩර පාර අනුව වෙනස් විය හැක)

class PregnancyAssessmentViewPage extends StatefulWidget {
  final int pregnancyId;

  const PregnancyAssessmentViewPage({super.key, required this.pregnancyId});

  @override
  State<PregnancyAssessmentViewPage> createState() =>
      _PregnancyAssessmentViewState();
}

class _PregnancyAssessmentViewState extends State<PregnancyAssessmentViewPage> {
  bool isLoading = true;
  Map<String, dynamic> _data = {};

  @override
  void initState() {
    super.initState();
    _fetchAssessmentData();
  }

  // පරිවර්තන ලබා ගැනීමට පහසු ක්‍රමයක් (Helper method)
  String _t(BuildContext context, String key) {
    return AppLocalizations.of(context)?.translate(key) ?? key;
  }

  // 🔄 Fetch assessment data from Supabase based on active pregnancy
  Future<void> _fetchAssessmentData() async {
    setState(() {
      isLoading = true;
    });

    try {
      final supabase = Supabase.instance.client;

      final data = await supabase
          .from('pre_conception_assessment')
          .select()
          .eq('pregnancy_id', widget.pregnancyId)
          .single();

      setState(() {
        _data = data;
      });
    } catch (e) {
      print("Error loading assessment data: $e");
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  // Helper to format boolean fields into Yes/No readable text
  String _formatBoolean(BuildContext context, dynamic value) {
    if (value == null) return '--';
    return (value == true || value == 'true')
        ? _t(context, 'yes_label')
        : _t(context, 'no_label');
  }

  // UI Helper to build clean rows
  Widget buildDataRow(BuildContext context, String labelKey, dynamic value) {
    String label = _t(context, labelKey);

    String displayValue;
    if (value is bool ||
        (value is String && (value == 'true' || value == 'false'))) {
      displayValue = _formatBoolean(context, value);
    } else if (value?.toString().isNotEmpty == true) {
      displayValue = value.toString();
    } else {
      displayValue = _t(context, 'none_not_specified');
    }

    Color valueColor = displayValue == _t(context, 'yes_label')
        ? Colors.teal.shade700
        : (displayValue == _t(context, 'no_label')
              ? Colors.black87
              : Colors.black87);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 3,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: Colors.black54,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            flex: 2,
            child: Text(
              displayValue,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: valueColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildSectionHeader(
    BuildContext context,
    String titleKey,
    IconData icon,
  ) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFFC2185B), size: 20),
        const SizedBox(width: 8),
        Text(
          _t(context, titleKey),
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Color(0xFF880E4F),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(
          _t(context, 'pregnancy_assessment_title'),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFF48FB1),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFC2185B)),
            )
          : _data.isEmpty
          ? Center(
              child: Text(
                _t(context, 'no_assessment_records'),
                style: const TextStyle(color: Colors.black54, fontSize: 14),
              ),
            )
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1️⃣ PRE-CONCEPTION & LIFESTYLE CARD
                    buildSectionHeader(
                      context,
                      'section_pre_conception',
                      Icons.health_and_safety_rounded,
                    ),
                    const Divider(color: Color(0xFFF48FB1), height: 15),
                    Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                        side: BorderSide(
                          color: Colors.grey.shade200,
                          width: 1.5,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Column(
                          children: [
                            buildDataRow(
                              context,
                              'consanguinity',
                              _data['consanguinity'],
                            ),
                            buildDataRow(
                              context,
                              'rubella_immunization',
                              _data['rubella_immunization'],
                            ),
                            buildDataRow(
                              context,
                              'pre_pregnancy_screening',
                              _data['pre_pregnancy_screening'],
                            ),
                            buildDataRow(
                              context,
                              'folic_acid_supplementation',
                              _data['folic_acid_supplementation'],
                            ),
                            buildDataRow(
                              context,
                              'planned_pregnancy',
                              _data['planned_pregnancy'],
                            ),
                            buildDataRow(
                              context,
                              'subfertility_history',
                              _data['subfertility_history'],
                            ),
                            buildDataRow(
                              context,
                              'family_planning_last_used',
                              _data['family_planning_last_used'],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 2️⃣ MEDICAL & CHRONIC CONDITIONS CARD
                    buildSectionHeader(
                      context,
                      'section_medical_risks',
                      Icons.medical_information_rounded,
                    ),
                    const Divider(color: Color(0xFFF48FB1), height: 15),
                    Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                        side: BorderSide(
                          color: Colors.grey.shade200,
                          width: 1.5,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Column(
                          children: [
                            buildDataRow(
                              context,
                              'bmi_risk',
                              _data['bmi_risk'],
                            ),
                            buildDataRow(
                              context,
                              'diabetes',
                              _data['diabetes'],
                            ),
                            buildDataRow(
                              context,
                              'hypertension',
                              _data['hypertension'],
                            ),
                            buildDataRow(context, 'malaria', _data['malaria']),
                            buildDataRow(
                              context,
                              'heart_disease',
                              _data['heart_disease'],
                            ),
                            buildDataRow(
                              context,
                              'kidney_disease',
                              _data['kidney_disease'],
                            ),
                            buildDataRow(
                              context,
                              'thyroid_disease',
                              _data['thyroid_disease'],
                            ),
                            buildDataRow(
                              context,
                              'epilepsy',
                              _data['epilepsy'],
                            ),
                            buildDataRow(
                              context,
                              'psychiatric_illness',
                              _data['psychiatric_illness'],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 3️⃣ OTHER CONDITIONS CARD
                    buildSectionHeader(
                      context,
                      'section_other_observations',
                      Icons.notes_rounded,
                    ),
                    const Divider(color: Color(0xFFF48FB1), height: 15),
                    Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                        side: BorderSide(
                          color: Colors.grey.shade200,
                          width: 1.5,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Column(
                          children: [
                            buildDataRow(
                              context,
                              'other_conditions',
                              _data['other_conditions'],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 25),
                  ],
                ),
              ),
            ),
    );
  }
}
