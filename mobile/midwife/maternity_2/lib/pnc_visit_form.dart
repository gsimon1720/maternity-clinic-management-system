import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PncVisitForm extends StatefulWidget {
  final int patientId;

  const PncVisitForm({super.key, required this.patientId});

  @override
  State<PncVisitForm> createState() => _PncVisitFormState();
}

class _PncVisitFormState extends State<PncVisitForm> {
  final Color primaryPink = const Color(0xfff48fb1);
  bool _isLoading = false;

  // Dates
  DateTime _visitDate = DateTime.now();
  DateTime? _nextClinicDate;

  // Map to hold all our Dropdown selections
  final Map<String, String?> _formData = {};

  // Controllers for the few fields that still require typing
  final TextEditingController _tempCtrl = TextEditingController();
  final TextEditingController _fpMethodsCtrl = TextEditingController();
  final TextEditingController _causeOfDeathCtrl = TextEditingController();
  final TextEditingController _remarksCtrl = TextEditingController();

  @override
  void dispose() {
    _tempCtrl.dispose();
    _fpMethodsCtrl.dispose();
    _causeOfDeathCtrl.dispose();
    _remarksCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    setState(() => _isLoading = true);

    try {
      final pregnancyData = await Supabase.instance.client
          .from('pregnancy')
          .select('pregnancy_id')
          .eq('patient_id', widget.patientId)
          .eq('pregnancy_status', 'DELIVERED')
          .order('created_at', ascending: false) // 👈 Sort by most recent
          .limit(1)                              // 👈 Restrict to only 1 row
          .maybeSingle();

      if (pregnancyData == null) throw Exception("No DELIVERED pregnancy record found for this patient. PNC forms are only for delivered mothers.");

      // Build database payload
      // Build database payload
      Map<String, dynamic> insertData = {
        'pregnancy_id': pregnancyData['pregnancy_id'],
        'visit_date': _visitDate.toIso8601String().split('T')[0],
      };

      // 👈 FIX: Explicitly add the clinic date if it is not null
      if (_nextClinicDate != null) {
        insertData['next_clinic_date'] = _nextClinicDate!.toIso8601String().split('T')[0];
      }

      // Add all dropdown selections to payload
      _formData.forEach((key, value) {
        if (value != null && value.isNotEmpty) {
          insertData[key] = value;
        }
      });

      // Add typed text fields to payload
      if (_tempCtrl.text.isNotEmpty) insertData['mother_temp'] = _tempCtrl.text;
      if (_fpMethodsCtrl.text.isNotEmpty) insertData['family_planning_methods'] = _fpMethodsCtrl.text;
      if (_causeOfDeathCtrl.text.isNotEmpty) insertData['cause_of_death'] = _causeOfDeathCtrl.text;
      if (_remarksCtrl.text.isNotEmpty) insertData['other_remarks'] = _remarksCtrl.text;

      // Insert into Supabase
      await Supabase.instance.client.from('pnc_visits').insert(insertData);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('PNC Visit saved successfully!'), backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --- UI HELPER WIDGETS ---

  // Reusable Dropdown Builder
  Widget _buildDropdown(String key, String label, List<String> options) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: DropdownButtonFormField<String>(
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        ),
        value: _formData[key],
        items: options.map((opt) => DropdownMenuItem(value: opt, child: Text(opt))).toList(),
        onChanged: (val) => setState(() => _formData[key] = val),
      ),
    );
  }

  // Fast Yes/No Dropdown Builder
  Widget _buildYesNo(String key, String label) {
    return _buildDropdown(key, label, ['Yes', 'No']);
  }

  // Section Header
  Widget _buildHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Text(title, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: primaryPink)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F0F4),
      appBar: AppBar(title: const Text('PNC Visit Form'), backgroundColor: primaryPink, foregroundColor: Colors.white),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- DATES ---
            Card(
              child: ListTile(
                title: Text("Visit Date: ${_visitDate.toLocal().toString().split(' ')[0]}"),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  DateTime? picked = await showDatePicker(context: context, initialDate: _visitDate, firstDate: DateTime(2020), lastDate: DateTime(2101));
                  if (picked != null) setState(() => _visitDate = picked);
                },
              ),
            ),
            Card(
              child: ListTile(
                title: Text(_nextClinicDate == null 
                    ? "Select Next Clinic Date" 
                    : "Next Clinic Date: ${_nextClinicDate!.toLocal().toString().split(' ')[0]}"),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  DateTime? picked = await showDatePicker(
                    context: context, 
                    // 👈 FIX: Remember the chosen date, or default to today if null
                    initialDate: _nextClinicDate ?? DateTime.now(), 
                    // 👈 FIX: Next Clinic Date should only allow picking future dates
                    firstDate: DateTime.now(), 
                    lastDate: DateTime(2101),
                  );
                  
                  // 👈 FIX: Ensure we only update if a date was actually picked and screen is active
                  if (picked != null && mounted) {
                    setState(() {
                      _nextClinicDate = picked;
                    });
                  }
                },
              ),
            ),
            // --- EDUCATION & PLANNING ---
            _buildHeader("Education & Planning"),
            _buildDropdown('visit_type', 'Visit Type', ['Initial Booking Visit (Weeks 8–12)', 'Standard Routine Checkups (Weeks 16–40+)', 'Reproductive and Well-Woman Visits']),
            _buildYesNo('infant_care_edu', 'Infant Care Educated?'),
            _buildYesNo('danger_signs_newborn_edu', 'Newborn Danger Signs Educated?'),
            _buildYesNo('exclusive_breastfeeding_edu', 'Exclusive Breastfeeding Educated?'),
            _buildYesNo('breastfeeding_positioning_edu', 'Breastfeeding Positioning Educated?'),
            _buildYesNo('breastfeeding_supply_edu', 'Breastfeeding Supply Educated?'),
            _buildYesNo('pnc_danger_signs_edu', 'Maternal PNC Danger Signs Educated?'),
            _buildYesNo('family_planning_importance', 'Family Planning Importance Discussed?'),
            TextField(
              controller: _fpMethodsCtrl,
              decoration: InputDecoration(labelText: 'Family Planning Methods Agreed', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10))),
            ),
            const SizedBox(height: 12),
            _buildYesNo('mother_left_area', 'Mother Left Area?'),
            _buildYesNo('referral_letter_issued', 'Referral Letter Issued?'),

            // --- MATERNAL HEALTH ---
            _buildHeader("Maternal Health"),
            TextField(
              controller: _tempCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(labelText: 'Mother Temperature (°C)', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10))),
            ),
            const SizedBox(height: 12),
            _buildDropdown('mother_anemia', 'Maternal Anemia', ['Normal', 'Mild', 'Moderate', 'Severe']),
            _buildDropdown('mother_breasts', 'Breasts Examination', ['Normal/Soft', 'Engorged', 'Cracked Nipples', 'Mastitis', 'Abscess']),
            _buildDropdown('uterine_involution', 'Uterine Involution', ['Well-contracted', 'Subinvoluted (Boggy)', 'Not Palpable']),
            _buildDropdown('lochia_type', 'Lochia (Discharge) Type', ['Rubra (Red, Days 1-3)', 'Serosa (Pink/Brown, Days 4-10)', 'Alba (White, Days 11-21)', 'Abnormal (Heavy/Clots)']),
            _buildYesNo('lochia_foul_smell', 'Foul Smelling Lochia?'),
            _buildDropdown('perineal_wound_status', 'Perineal Wound Status', ['Intact (No tear)', 'Healing well', 'Inflamed / Swollen', 'Infected / Pus', 'Gaping (Dehiscence)']),
            _buildYesNo('perineal_wound_infected', 'Is Wound Clinically Infected?'),
            _buildYesNo('gauze_retained', 'Vaginal Gauze Retained?'),
            
            // Maternal Symptoms & Mental Health
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text("Maternal Danger Signs / Symptoms", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
            ),
            _buildDropdown('epds_status', 'EPDS (Depression Scale)', ['Low Risk', 'Moderate Risk', 'High Risk']),
            _buildYesNo('mood_changes', 'Noticeable Mood Changes?'),
            _buildYesNo('upper_abdominal_pain', 'Upper Abdominal Pain?'),
            _buildYesNo('diarrhoea', 'Diarrhoea?'),
            _buildYesNo('vomiting', 'Vomiting?'),
            _buildYesNo('difficulty_breathing', 'Difficulty Breathing?'),
            _buildYesNo('blurred_vision_headache', 'Blurred Vision / Severe Headache?'),
            _buildYesNo('calf_pain_dvt', 'Calf Pain (Suspected DVT)?'),

            // --- CHILD HEALTH ---
            _buildHeader("Child Health"),
            _buildDropdown('child_skin_color', 'Child Skin Color', ['Pink / Normal', 'Jaundiced (Yellow)', 'Cyanotic (Blue)', 'Pale']),
            _buildDropdown('umbilical_cord_status', 'Umbilical Cord Status', ['Clean & Dry', 'Moist', 'Infected / Pus', 'Bleeding']),
            _buildDropdown('child_sucking_ability', 'Child Sucking Ability', ['Good / Effective', 'Weak', 'Poor / Unable to suck']),
            _buildDropdown('child_attachment_observed', 'Breast Attachment Observed', ['Good attachment', 'Poor attachment', 'Not observed today']),
            
            // Child Symptoms
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text("Child Danger Signs", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
            ),
            _buildYesNo('child_distress_signs', 'Signs of Respiratory Distress?'),
            _buildYesNo('child_fever', 'Fever?'),
            _buildYesNo('child_grunting', 'Grunting?'),
            
            // Child Other
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text("Other Child Records", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
            ),
            _buildYesNo('child_micronutrients', 'Micronutrients Given?'),
            _buildYesNo('bcg_vaccination', 'BCG Vaccination Received?'),
            _buildYesNo('neonatal_death', 'Neonatal Death?'),
            _buildDropdown('death_age_window', 'If Death: Age Window', ['< 24 Hours', '1 - 7 Days', '8 - 28 Days']),
            _buildYesNo('death_investigated', 'If Death: Investigated?'),
            
            TextField(
              controller: _causeOfDeathCtrl,
              decoration: InputDecoration(labelText: 'Cause of Death (If applicable)', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10))),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _remarksCtrl,
              maxLines: 3,
              decoration: InputDecoration(labelText: 'Other Remarks / General Notes', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10))),
            ),

            const SizedBox(height: 20),

            // --- SUBMIT BUTTON ---
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: primaryPink, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                onPressed: _isLoading ? null : _submitForm,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Save PNC Visit', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}