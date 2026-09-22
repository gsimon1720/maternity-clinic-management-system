import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class RegisterPatientScreen extends StatefulWidget {
  final int midwifeId;

  const RegisterPatientScreen({super.key, required this.midwifeId});

  @override
  State<RegisterPatientScreen> createState() => _RegisterPatientScreenState();
}

class _RegisterPatientScreenState extends State<RegisterPatientScreen> {
  final _supabase = Supabase.instance.client;
  final _formKey = GlobalKey<FormState>();

  // Fixed/Unchangeable Variables
  int? _clinicId;
  int? _areaId;
  bool _isLoadingMidwifeData = true;
  bool _isSaving = false;

  // Form Controllers
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _nicController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();

  // Dropdown Values
  String? _selectedBloodGroup;
  String? _selectedEducation;
  String? _selectedOccupation = 'Housewife'; // Default

  // Dropdown Options
  final List<String> _bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  final List<String> _educationLevels = ['Primary', 'O/L', 'A/L', 'Diploma', 'Degree', 'None'];
  final List<String> _occupations = ['Housewife', 'Employed', 'Self-employed', 'Student', 'Unemployed'];

  // Theme Colors
  final Color primaryPink = const Color(0xfff48fb1);
  final Color bgSoftPink = const Color(0xFFF9F0F4);
  final Color textDark = const Color(0xff2D3142);

  @override
  void initState() {
    super.initState();
    _fetchMidwifeDetails();
  }

  Future<void> _fetchMidwifeDetails() async {
    try {
      // 🚀 Changed 'midwife' to 'midwives' to match your Supabase database table name!
      final response = await _supabase
          .from('midwives') 
          .select('clinic_id, area_id')
          .eq('user_id', widget.midwifeId) 
          .maybeSingle();

      if (mounted) {
        setState(() {
          if (response != null) {
            _clinicId = response['clinic_id'];
            _areaId = response['area_id'];
          }
          _isLoadingMidwifeData = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching midwife details: $e');
      if (mounted) setState(() => _isLoadingMidwifeData = false);
    }
  }

  // 🚀 Save the Patient to the Database
  Future<void> _savePatient() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      await _supabase.from('patient').insert({
        'assigned_midwife_id': widget.midwifeId,
        'clinic_id': _clinicId,
        'area_id': _areaId,
        'first_name': _firstNameController.text.trim(),
        'last_name': _lastNameController.text.trim(),
        'nic': _nicController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'age': int.tryParse(_ageController.text.trim()),
        'blood_group': _selectedBloodGroup,
        'patient_education': _selectedEducation,
        'patient_occupation': _selectedOccupation,
        'status': 'pending', // Default status for new patients
        'registration_date': DateTime.now().toIso8601String().split('T')[0],
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Patient registered successfully!'), backgroundColor: Colors.green),
        );
        Navigator.pop(context); // Go back to dashboard
      }
    } catch (e) {
      debugPrint("Error saving patient: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgSoftPink,
      appBar: AppBar(
        backgroundColor: bgSoftPink,
        elevation: 0,
        iconTheme: IconThemeData(color: textDark),
        title: Text("Add New Patient", style: TextStyle(color: textDark, fontWeight: FontWeight.bold)),
      ),
      body: _isLoadingMidwifeData
          ? Center(child: CircularProgressIndicator(color: primaryPink))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 🔒 UNCHANGEABLE FACTORS SECTION
                    Text("System Assignment", style: TextStyle(color: primaryPink, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(child: _buildReadOnlyField("Midwife ID", widget.midwifeId.toString())),
                        const SizedBox(width: 16),
                        Expanded(child: _buildReadOnlyField("Clinic ID", _clinicId?.toString() ?? 'N/A')),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // 📝 PATIENT DETAILS SECTION
                    Text("Patient Details", style: TextStyle(color: primaryPink, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 12),
                    
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(controller: _firstNameController, label: "First Name", icon: Icons.person),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildTextField(controller: _lastNameController, label: "Last Name"),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: _buildTextField(controller: _nicController, label: "NIC Number", icon: Icons.badge),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          flex: 1,
                          child: _buildTextField(controller: _ageController, label: "Age", keyboardType: TextInputType.number),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(controller: _phoneController, label: "Phone Number", icon: Icons.phone, keyboardType: TextInputType.phone),
                    const SizedBox(height: 16),
                    _buildTextField(controller: _addressController, label: "Home Address", icon: Icons.home, maxLines: 2),
                    const SizedBox(height: 24),

                    // 🔽 DROPDOWN SELECTIONS SECTION
                    Text("Medical & Background", style: TextStyle(color: primaryPink, fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 12),
                    
                    _buildDropdown(
                      label: "Blood Group",
                      value: _selectedBloodGroup,
                      items: _bloodGroups,
                      onChanged: (val) => setState(() => _selectedBloodGroup = val),
                    ),
                    const SizedBox(height: 16),
                    
                    _buildDropdown(
                      label: "Education Level",
                      value: _selectedEducation,
                      items: _educationLevels,
                      onChanged: (val) => setState(() => _selectedEducation = val),
                    ),
                    const SizedBox(height: 16),
                    
                    _buildDropdown(
                      label: "Occupation",
                      value: _selectedOccupation,
                      items: _occupations,
                      onChanged: (val) => setState(() => _selectedOccupation = val),
                    ),
                    const SizedBox(height: 40),

                    // 💾 SAVE BUTTON
                    SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _savePatient,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryPink,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text("Register Patient", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }

  // --- WIDGET HELPERS ---

  Widget _buildReadOnlyField(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: textDark.withOpacity(0.5), fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 15, color: textDark.withOpacity(0.8), fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    IconData? icon,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: (value) => value == null || value.isEmpty ? 'Required' : null,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: icon != null ? Icon(icon, color: primaryPink, size: 20) : null,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: primaryPink, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}