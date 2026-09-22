import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart'; // Localization සඳහා (ඔබගේ ෆෝල්ඩර පාර අනුව වෙනස් විය හැක)

class PastPregnancyDetailsPage extends StatefulWidget {
  final int pregnancyId;

  const PastPregnancyDetailsPage({Key? key, required this.pregnancyId})
    : super(key: key);

  @override
  State<PastPregnancyDetailsPage> createState() =>
      _PastPregnancyDetailsPageState();
}

class _PastPregnancyDetailsPageState extends State<PastPregnancyDetailsPage> {
  final Color primaryColor = const Color(0xFF00796B);

  Map<String, dynamic>? pastDetails;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchPastPregnancyDetails();
  }

  // පරිවර්තන ලබා ගැනීමට පහසු ක්‍රමයක් (Helper method)
  String _t(BuildContext context, String key) {
    return AppLocalizations.of(context)?.translate(key) ?? key;
  }

  // past_obstetric_history table එකෙන් data ගැනීම
  Future<void> _fetchPastPregnancyDetails() async {
    try {
      final response = await Supabase.instance.client
          .from('past_obstetric_history')
          .select()
          .eq('pregnancy_id', widget.pregnancyId)
          .maybeSingle(); // එක් record එකක් පමණක් බලාපොරොත්තු වේ

      setState(() {
        pastDetails = response;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${_t(context, 'error_loading_past_details')}: $e'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(_t(context, 'past_pregnancy_details_title')),
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: primaryColor))
          : pastDetails == null
          ? Center(child: Text(_t(context, 'no_past_details_found')))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: ListView(
                children: [
                  _buildSectionCard(context, 'section_delivery_info', [
                    _buildInfoRow(
                      context,
                      'pregnancy_number_label',
                      pastDetails!['pregnancy_number']?.toString(),
                    ),
                    _buildInfoRow(
                      context,
                      'year_of_delivery_label',
                      pastDetails!['year_of_delivery']?.toString(),
                    ),
                    _buildInfoRow(
                      context,
                      'gestational_age_label',
                      pastDetails!['gestational_age_weeks'] != null
                          ? '${pastDetails!['gestational_age_weeks']} ${_t(context, 'weeks_unit')}'
                          : null,
                    ),
                    _buildInfoRow(
                      context,
                      'outcome_label',
                      pastDetails!['outcome']?.toString(),
                    ),
                    _buildInfoRow(
                      context,
                      'mode_of_delivery_label',
                      pastDetails!['mode_of_delivery']?.toString(),
                    ),
                    _buildInfoRow(
                      context,
                      'place_of_delivery_label',
                      pastDetails!['place_of_delivery']?.toString(),
                    ),
                  ]),
                  const SizedBox(height: 16),
                  _buildSectionCard(context, 'section_baby_details', [
                    _buildInfoRow(
                      context,
                      'baby_sex_label',
                      pastDetails!['sex']?.toString(),
                    ),
                    _buildInfoRow(
                      context,
                      'birth_weight_label',
                      pastDetails!['birth_weight_kg'] != null
                          ? '${pastDetails!['birth_weight_kg']} ${_t(context, 'kg_unit')}'
                          : null,
                    ),
                    _buildInfoRow(
                      context,
                      'child_status_label',
                      pastDetails!['child_status']?.toString(),
                    ),
                  ]),
                  const SizedBox(height: 16),
                  _buildSectionCard(context, 'section_complications_remarks', [
                    _buildInfoRow(
                      context,
                      'antenatal_complications_label',
                      pastDetails!['antenatal_complications']?.toString(),
                    ),
                    _buildInfoRow(
                      context,
                      'postnatal_complications_label',
                      pastDetails!['postnatal_complications']?.toString(),
                    ),
                    _buildInfoRow(
                      context,
                      'remarks_label',
                      pastDetails!['remarks']?.toString(),
                    ),
                  ]),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionCard(
    BuildContext context,
    String titleKey,
    List<Widget> children,
  ) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _t(context, titleKey),
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: primaryColor,
              ),
            ),
            const Divider(height: 20),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String labelKey, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            _t(context, labelKey),
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
          ),
          Text(
            (value == null || value.isEmpty || value == 'null') ? '-' : value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
