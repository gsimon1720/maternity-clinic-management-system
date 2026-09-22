import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart'; // Localization සඳහා (ඔබගේ ෆෝල්ඩර පාර අනුව වෙනස් විය හැක)

class MedicalHistoryViewPage extends StatefulWidget {
  final int patientId;

  const MedicalHistoryViewPage({Key? key, required this.patientId})
    : super(key: key);

  @override
  _MedicalHistoryViewPageState createState() => _MedicalHistoryViewPageState();
}

class _MedicalHistoryViewPageState extends State<MedicalHistoryViewPage> {
  // Loading state
  bool _isLoading = true;

  // Form Variables (Booleans)
  bool _diabetes = false;
  bool _hypertension = false;
  bool _cardiacDisease = false;
  bool _renalDisease = false;
  bool _hepaticDisease = false;
  bool _thyroidDisease = false;
  bool _bronchialAsthma = false;
  bool _epilepsy = false;
  bool _psychiatricIllness = false;
  bool _tuberculosis = false;
  bool _malignancy = false;
  bool _previousDvt = false;
  bool _bloodTransfusionHistory = false;

  // Strings for Text Fields (View-only)
  String _previousSurgeries = 'None';
  String _drugAllergies = 'None';
  String _otherConditions = 'None';

  @override
  void initState() {
    super.initState();
    _fetchMedicalHistory();
  }

  // පරිවර්තන ලබා ගැනීමට පහසු ක්‍රමයක් (Helper method)
  String _t(BuildContext context, String key) {
    return AppLocalizations.of(context)?.translate(key) ?? key;
  }

  // Supabase හරහා data fetch කිරීම
  Future<void> _fetchMedicalHistory() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await Supabase.instance.client
          .from('medical_surgical_history')
          .select()
          .eq('patient_id', widget.patientId)
          .maybeSingle();

      if (response != null) {
        setState(() {
          _diabetes = response['diabetes'] ?? false;
          _hypertension = response['hypertension'] ?? false;
          _cardiacDisease = response['cardiac_disease'] ?? false;
          _renalDisease = response['renal_disease'] ?? false;
          _hepaticDisease = response['hepatic_disease'] ?? false;
          _thyroidDisease = response['thyroid_disease'] ?? false;
          _bronchialAsthma = response['bronchial_asthma'] ?? false;
          _epilepsy = response['epilepsy'] ?? false;
          _psychiatricIllness = response['psychiatric_illness'] ?? false;
          _tuberculosis = response['tuberculosis'] ?? false;
          _malignancy = response['malignancy'] ?? false;
          _previousDvt = response['previous_dvt'] ?? false;
          _bloodTransfusionHistory =
              response['blood_transfusion_history'] ?? false;

          _previousSurgeries = response['previous_surgeries'] ?? 'None';
          _drugAllergies = response['drug_allergies'] ?? 'None';
          _otherConditions = response['other_conditions'] ?? 'None';
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${_t(context, 'error_loading_history')}: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryPink = Color(0xFFF48FB1);

    return Scaffold(
      appBar: AppBar(
        title: Text(_t(context, 'medical_surgical_history_title')),
        backgroundColor: primaryPink,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: primaryPink))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Section Title
                  Text(
                    _t(context, 'medical_conditions_summary'),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: primaryPink,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _t(context, 'review_medical_background_subtitle'),
                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const SizedBox(height: 16),

                  // Card Container for Boolean Conditions (View-Only Yes/No Badges)
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Column(
                        children: [
                          _buildInfoRow(context, 'diabetes', _diabetes),
                          const Divider(height: 1),
                          _buildInfoRow(context, 'hypertension', _hypertension),
                          const Divider(height: 1),
                          _buildInfoRow(
                            context,
                            'cardiac_disease',
                            _cardiacDisease,
                          ),
                          const Divider(height: 1),
                          _buildInfoRow(
                            context,
                            'renal_disease',
                            _renalDisease,
                          ),
                          const Divider(height: 1),
                          _buildInfoRow(
                            context,
                            'hepatic_disease',
                            _hepaticDisease,
                          ),
                          const Divider(height: 1),
                          _buildInfoRow(
                            context,
                            'thyroid_disease',
                            _thyroidDisease,
                          ),
                          const Divider(height: 1),
                          _buildInfoRow(
                            context,
                            'bronchial_asthma',
                            _bronchialAsthma,
                          ),
                          const Divider(height: 1),
                          _buildInfoRow(context, 'epilepsy', _epilepsy),
                          const Divider(height: 1),
                          _buildInfoRow(
                            context,
                            'psychiatric_illness',
                            _psychiatricIllness,
                          ),
                          const Divider(height: 1),
                          _buildInfoRow(context, 'tuberculosis', _tuberculosis),
                          const Divider(height: 1),
                          _buildInfoRow(context, 'malignancy', _malignancy),
                          const Divider(height: 1),
                          _buildInfoRow(context, 'previous_dvt', _previousDvt),
                          const Divider(height: 1),
                          _buildInfoRow(
                            context,
                            'blood_transfusion_history',
                            _bloodTransfusionHistory,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Section Title for Text Details
                  Text(
                    _t(context, 'additional_details'),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: primaryPink,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Card Container for Text Details (View-Only)
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildTextBox(
                            context,
                            'previous_surgeries',
                            _previousSurgeries,
                          ),
                          const SizedBox(height: 14),
                          const Divider(height: 1),
                          const SizedBox(height: 14),
                          _buildTextBox(
                            context,
                            'drug_allergies',
                            _drugAllergies,
                          ),
                          const SizedBox(height: 14),
                          const Divider(height: 1),
                          const SizedBox(height: 14),
                          _buildTextBox(
                            context,
                            'other_conditions',
                            _otherConditions,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
    );
  }

  // Helper Widget for Boolean Rows (Yes/No badge display)
  Widget _buildInfoRow(BuildContext context, String titleKey, bool value) {
    String displayValue = value
        ? _t(context, 'yes_label')
        : _t(context, 'no_label');
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              _t(context, titleKey),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: value ? Colors.pink.shade50 : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: value ? const Color(0xFFF48FB1) : Colors.grey.shade300,
              ),
            ),
            child: Text(
              displayValue,
              style: TextStyle(
                color: value ? const Color(0xFFD81B60) : Colors.grey.shade700,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Helper Widget for Text Details Display
  Widget _buildTextBox(BuildContext context, String titleKey, String content) {
    String displayContent = (content.isEmpty || content == 'None')
        ? _t(context, 'none_label')
        : content;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _t(context, titleKey),
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Color(0xFFF48FB1),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          displayContent,
          style: const TextStyle(fontSize: 15, color: Colors.black87),
        ),
      ],
    );
  }
}
