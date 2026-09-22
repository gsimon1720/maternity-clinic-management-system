import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PreConceptionForm extends StatefulWidget {
  final int patientId;

  const PreConceptionForm({super.key, required this.patientId});

  @override
  State<PreConceptionForm> createState() => _PreConceptionFormState();
}

class _PreConceptionFormState extends State<PreConceptionForm> {
  final Color primaryPink = const Color(0xfff48fb1);
  bool _isLoading = false;

  // Map to hold all boolean fields matching the database columns perfectly
  final Map<String, bool> _boolFields = {
    'consanguinity': false,
    'rubella_immunization': false,
    'pre_pregnancy_screening': false,
    'folic_acid_supplementation': false,
    'planned_pregnancy': false,
    'subfertility_history': false,
    'family_planning_last_used': false,
    'bmi_risk': false,
    'diabetes': false,
    'hypertension': false,
    'malaria': false,
    'heart_disease': false,
    'kidney_disease': false,
    'thyroid_disease': false,
    'epilepsy': false,
    'psychiatric_illness': false,
  };

  final TextEditingController _otherConditionsController = TextEditingController();

  Future<void> _submitForm() async {
    setState(() => _isLoading = true);

    try {
      // 1. Find active pregnancy
      final pregnancyData = await Supabase.instance.client
          .from('pregnancy')
          .select('pregnancy_id')
          .eq('patient_id', widget.patientId)
          .eq('pregnancy_status', 'ACTIVE')
          .order('created_at', ascending: false) // 👈 Sort by most recent
          .limit(1)                              // 👈 Restrict to only 1 row
          .maybeSingle();

      if (pregnancyData == null) {
        throw Exception("No ACTIVE pregnancy record found for this patient. Pre-conception forms are only for active pregnancies.");
      }

      final pregnancyId = pregnancyData['pregnancy_id'];

      // --- 🚀 NEW STEP: Check how many forms already exist ---
      final countResponse = await Supabase.instance.client
          .from('pre_conception_assessment')
          .select('assessment_id')
          .eq('pregnancy_id', pregnancyId)
          .count(CountOption.exact);

final currentCount = countResponse.count;

      if (currentCount >= 10) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Maximum limit of 10 assessments reached for this pregnancy.'), 
              backgroundColor: Colors.orange
            ),
          );
        }
        return; // Stops the function here so it doesn't save!
      }
      // ------------------------------------------------------

      // 2. Prepare payload exactly matching the schema
      final Map<String, dynamic> insertData = {
        'pregnancy_id': pregnancyId,
        'other_conditions': _otherConditionsController.text,
      };
      
      // Add all the booleans to the payload
      insertData.addAll(_boolFields);

      // 3. Insert into database
      await Supabase.instance.client
          .from('pre_conception_assessment')
          .insert(insertData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Form saved successfully!'), backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Helper to make labels readable (e.g. "rubella_immunization" -> "Rubella Immunization")
  String _formatLabel(String key) {
    return key.split('_').map((word) => word[0].toUpperCase() + word.substring(1)).join(' ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F0F4),
      appBar: AppBar(
        title: const Text('Pre-Conception Form'),
        backgroundColor: primaryPink,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Medical History & Risks", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            
            // Dynamically build all switches based on the map
            ..._boolFields.keys.map((key) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: SwitchListTile(
                title: Text(_formatLabel(key), style: const TextStyle(fontWeight: FontWeight.w500)),
                activeColor: primaryPink,
                value: _boolFields[key]!,
                onChanged: (bool value) {
                  setState(() {
                    _boolFields[key] = value;
                  });
                },
              ),
            )),
            
            const SizedBox(height: 16),
            TextField(
              controller: _otherConditionsController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Other Conditions (Text)',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 30),
            
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryPink,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _isLoading ? null : _submitForm,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Save Assessment', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}