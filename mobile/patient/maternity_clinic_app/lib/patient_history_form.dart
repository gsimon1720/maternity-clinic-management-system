import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart'; // Localization සඳහා (ඔබගේ ෆෝල්ඩර පාර අනුව වෙනස් විය හැක)

class PatientHistoryForm extends StatefulWidget {
  final int patientId; //

  const PatientHistoryForm({Key? key, required this.patientId})
    : super(key: key);

  @override
  _PatientHistoryFormState createState() => _PatientHistoryFormState();
}

class _PatientHistoryFormState extends State<PatientHistoryForm> {
  final _formKey = GlobalKey<FormState>();

  // Loading state
  bool _isLoading = true;

  // Form Controllers & Variables
  bool _diabetes = false;
  bool _hypertension = false;
  bool _twinPregnancies = false;
  bool _congenitalDisorders = false;
  bool _thalassemia = false;
  bool _sickleCellDisease = false;
  bool _geneticDisorders = false;
  bool _psychiatricIllness = false;
  final TextEditingController _otherConditionsController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchPatientHistory();
  }

  // පරිවර්තන ලබා ගැනීමට පහසු ක්‍රමයක් (Helper method)
  String _t(BuildContext context, String key) {
    return AppLocalizations.of(context)?.translate(key) ?? key;
  }

  // Database එකෙන් හෝ API එකෙන් Data ගෙන්න ගන්න Function එක (Placeholder)
  Future<void> _fetchPatientHistory() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final data = await Supabase.instance.client
          .from('family_history')
          .select()
          .eq('patient_id', widget.patientId)
          .maybeSingle();

      if (data != null) {
        setState(() {
          _diabetes = data['diabetes'] ?? false;
          _hypertension = data['hypertension'] ?? false;
          _twinPregnancies = data['twin_pregnancies'] ?? false;
          _congenitalDisorders = data['congenital_disorders'] ?? false;
          _thalassemia = data['thalassemia'] ?? false;
          _sickleCellDisease = data['sickle_cell_disease'] ?? false;
          _geneticDisorders = data['genetic_disorders'] ?? false;
          _psychiatricIllness = data['psychiatric_illness'] ?? false;
          _otherConditionsController.text = data['other_conditions'] ?? '';

          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${_t(context, 'error_loading_data')}: $e')),
      );
    }
  }

  @override
  void dispose() {
    _otherConditionsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_t(context, 'patient_history_title')),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section Header
                    Text(
                      _t(context, 'medical_genetic_background'),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blueAccent,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _t(context, 'review_update_conditions_subtitle'),
                      style: const TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                    const SizedBox(height: 20),

                    // Card Container for Conditions
                    Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Column(
                          children: [
                            SwitchListTile(
                              title: Text(_t(context, 'diabetes')),
                              value: _diabetes,
                              onChanged: null,
                            ),
                            const Divider(height: 1),
                            SwitchListTile(
                              title: Text(_t(context, 'hypertension')),
                              value: _hypertension,
                              onChanged: null,
                            ),
                            const Divider(height: 1),
                            SwitchListTile(
                              title: Text(_t(context, 'twin_pregnancies')),
                              value: _twinPregnancies,
                              onChanged: null,
                            ),
                            const Divider(height: 1),
                            SwitchListTile(
                              title: Text(_t(context, 'congenital_disorders')),
                              value: _congenitalDisorders,
                              onChanged: null,
                            ),
                            const Divider(height: 1),
                            SwitchListTile(
                              title: Text(_t(context, 'thalassemia')),
                              value: _thalassemia,
                              onChanged: null,
                            ),
                            const Divider(height: 1),
                            SwitchListTile(
                              title: Text(_t(context, 'sickle_cell_disease')),
                              value: _sickleCellDisease,
                              onChanged: null,
                            ),
                            const Divider(height: 1),
                            SwitchListTile(
                              title: Text(_t(context, 'genetic_disorders')),
                              value: _geneticDisorders,
                              onChanged: null,
                            ),
                            const Divider(height: 1),
                            SwitchListTile(
                              title: Text(_t(context, 'psychiatric_illness')),
                              value: _psychiatricIllness,
                              onChanged: null,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Other Conditions Text Field
                    TextFormField(
                      controller: _otherConditionsController,
                      readOnly: true,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: _t(context, 'other_conditions_label'),
                        hintText: _t(context, 'other_conditions_hint'),
                        alignLabelWithHint: true,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),

                    // Save Button
                  ],
                ),
              ),
            ),
    );
  }
}
