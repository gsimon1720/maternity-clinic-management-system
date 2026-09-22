import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart'; // 📦 Supabase import කරගත්තා
import 'localization/app_localizations.dart';

class PatientProfilePage extends StatefulWidget {
  final dynamic
  patientId; // 🛠️ Added patientId parameter to match navigation needs

  const PatientProfilePage({super.key, this.patientId});

  @override
  State<PatientProfilePage> createState() => _PatientProfilePageState();
}

class _PatientProfilePageState extends State<PatientProfilePage> {
  final _formKey = GlobalKey<FormState>();
  dynamic _resolvedUserId; // Store the fetched user ID for updates

  // 📌 1. Database එකේ columns වලට අදාළව Controllers සියල්ල නිර්මාණය කිරීම
  // Patient Details
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _bloodGroupController = TextEditingController();
  final TextEditingController _bmiController = TextEditingController();
  final TextEditingController _heightController = TextEditingController();
  final TextEditingController _allergiesController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  // Emergency & Health System Details
  final TextEditingController _emergencyNameController =
      TextEditingController();
  final TextEditingController _emergencyAddressController =
      TextEditingController();
  final TextEditingController _emergencyPhoneController =
      TextEditingController();
  final TextEditingController _phmPhoneController = TextEditingController();
  final TextEditingController _mohPhoneController = TextEditingController();
  final TextEditingController _phmAreaController = TextEditingController();
  final TextEditingController _mohAreaController = TextEditingController();

  // Family Details
  final TextEditingController _spouseNameController = TextEditingController();
  final TextEditingController _spouseAgeController = TextEditingController();
  final TextEditingController _patientEducationController =
      TextEditingController();
  final TextEditingController _spouseEducationController =
      TextEditingController();
  final TextEditingController _patientOccupationController =
      TextEditingController();
  final TextEditingController _spouseOccupationController =
      TextEditingController();
  final TextEditingController _marriageAgeController = TextEditingController();

  // Registration & Additional Details
  final TextEditingController _regNumberController = TextEditingController();
  final TextEditingController _regDateController = TextEditingController();
  final TextEditingController _regPlaceController = TextEditingController();
  final TextEditingController _eligibleFamDateController =
      TextEditingController();
  final TextEditingController _motherRegNumController = TextEditingController();
  final TextEditingController _motherRegDateController =
      TextEditingController();
  final TextEditingController _gnDivisionController = TextEditingController();
  final TextEditingController _fieldClinicController = TextEditingController();
  final TextEditingController _hospitalClinicController =
      TextEditingController();
  final TextEditingController _consultantObsController =
      TextEditingController();
  final TextEditingController _antenatalRiskController =
      TextEditingController();

  bool _isLoading = true; // Data load වෙනකම් Loading indicator පෙන්නීමට

  @override
  void initState() {
    super.initState();
    _fetchPatientDataFromSupabase();
  }

  @override
  void dispose() {
    // Memory leaks වළක්වා ගැනීමට controllers සියල්ල dispose කිරීම
    _nameController.dispose();
    _ageController.dispose();
    _bloodGroupController.dispose();
    _bmiController.dispose();
    _heightController.dispose();
    _allergiesController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _emergencyNameController.dispose();
    _emergencyAddressController.dispose();
    _emergencyPhoneController.dispose();
    _phmPhoneController.dispose();
    _mohPhoneController.dispose();
    _phmAreaController.dispose();
    _mohAreaController.dispose();
    _spouseNameController.dispose();
    _spouseAgeController.dispose();
    _patientEducationController.dispose();
    _spouseEducationController.dispose();
    _patientOccupationController.dispose();
    _spouseOccupationController.dispose();
    _marriageAgeController.dispose();
    _regNumberController.dispose();
    _regDateController.dispose();
    _regPlaceController.dispose();
    _eligibleFamDateController.dispose();
    _motherRegNumController.dispose();
    _motherRegDateController.dispose();
    _gnDivisionController.dispose();
    _fieldClinicController.dispose();
    _hospitalClinicController.dispose();
    _consultantObsController.dispose();
    _antenatalRiskController.dispose();
    super.dispose();
  }

  // 📌 2. Supabase එකෙන් Data Fetch කරගැනීම
  Future<void> _fetchPatientDataFromSupabase() async {
    try {
      final supabase = Supabase.instance.client;
      final authUserEmail = supabase.auth.currentUser?.email;

      if (authUserEmail == null) {
        throw 'User not logged in';
      }

      // 1. මුලින්ම public.users table එකෙන් අදාළ user_id (bigint) එක සොයා ගැනීම
      final userResponse = await supabase
          .from('users')
          .select('user_id')
          .eq('email', authUserEmail)
          .single();

      _resolvedUserId = userResponse['user_id'];

      // 2. දැන් එම user_id එක භාවිතයෙන් patient table එකෙන් දත්ත ලබා ගැනීම
      final response = await supabase
          .from('patient')
          .select()
          .eq('user_id', _resolvedUserId)
          .single();

      setState(() {
        _nameController.text =
            "${response['first_name'] ?? ''} ${response['last_name'] ?? ''}"
                .trim();
        _ageController.text = response['age']?.toString() ?? '';
        _bloodGroupController.text = response['blood_group']?.toString() ?? '';
        _bmiController.text = response['bmi']?.toString() ?? '';
        _heightController.text = response['height_cm']?.toString() ?? '';
        _allergiesController.text = response['allergies']?.toString() ?? '';
        _addressController.text = response['address']?.toString() ?? '';
        _phoneController.text = response['phone']?.toString() ?? '';

        _emergencyNameController.text =
            response['emergency_contact_name']?.toString() ?? '';
        _emergencyAddressController.text =
            response['emergency_contact_address']?.toString() ?? '';
        _emergencyPhoneController.text =
            response['emergency_contact_phone']?.toString() ?? '';
        _phmPhoneController.text = response['phm_phone']?.toString() ?? '';
        _mohPhoneController.text = response['moh_phone']?.toString() ?? '';
        _phmAreaController.text = response['phm_area']?.toString() ?? '';
        _mohAreaController.text = response['moh_area']?.toString() ?? '';

        _spouseNameController.text = response['spouse_name']?.toString() ?? '';
        _spouseAgeController.text = response['spouse_age']?.toString() ?? '';
        _patientEducationController.text =
            response['patient_education']?.toString() ?? '';
        _spouseEducationController.text =
            response['spouse_education']?.toString() ?? '';
        _patientOccupationController.text =
            response['patient_occupation']?.toString() ?? '';
        _spouseOccupationController.text =
            response['spouse_occupation']?.toString() ?? '';
        _marriageAgeController.text =
            response['age_at_marriage']?.toString() ?? '';
        _regNumberController.text = response['patient_id']?.toString() ?? '';
        _regDateController.text =
            response['registration_date']?.toString() ?? '';
        _motherRegNumController.text =
            response['pregnancy_id']?.toString() ?? '';
        _motherRegDateController.text =
            response['pregnant_mother_approved_date']?.toString() ?? '';
        _gnDivisionController.text =
            response['grama_niladhari_division']?.toString() ?? '';
        _fieldClinicController.text =
            response['field_clinic_name']?.toString() ?? '';
        _hospitalClinicController.text =
            response['hospital_clinic_name']?.toString() ?? '';
        _consultantObsController.text =
            response['consultant_obstetrician']?.toString() ?? '';

        _isLoading = false;
        _antenatalRiskController.text =
            response['antenatal_risk_conditions']?.toString() ?? '';

        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading data: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  // 📌 3. Supabase වෙත දත්ත Update කිරීම (Save Button එකට අදාළව)
  Future<void> _saveFormToSupabase() async {
    if (_formKey.currentState!.validate()) {
      if (_resolvedUserId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('User ID not found for update.'),
            backgroundColor: Colors.redAccent,
          ),
        );
        return;
      }

      try {
        final supabase = Supabase.instance.client;

        // Editable fields පමණක් update කිරීමට Map කිරීම
        final updatedData = {
          'allergies': _allergiesController.text.trim(),
          'phone': _phoneController.text.trim(),
          'emergency_contact_name': _emergencyNameController.text.trim(),
          'emergency_contact_phone': _emergencyPhoneController.text.trim(),
          'emergency_contact_address': _emergencyAddressController.text.trim(),
          'spouse_name': _spouseNameController.text.trim(),
        };

        await supabase
            .from('patient')
            .update(updatedData)
            .eq('user_id', _resolvedUserId);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.translate("saving_data_msg"),
            ),
            backgroundColor: Colors.green,
          ),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Update failed: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.translate("fix_errors_msg"),
          ),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  // 🌸 Header Section
  Widget buildHeader() {
    return Stack(
      children: [
        Container(
          height: 310,
          width: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFF8BBD0), Color(0xFFE0F7FA)],
            ),
          ),
        ),
        Positioned(
          top: 25,
          left: 0,
          right: 0,
          child: Column(
            children: [
              Container(
                height: 190,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.asset(
                    'assets/mother.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(
                        Icons.pregnant_woman,
                        size: 100,
                        color: Color(0xFFE91E63),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                AppLocalizations.of(
                  context,
                )!.translate("patient_profile_title"),
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF880E4F),
                ),
              ),
              Text(
                AppLocalizations.of(
                  context,
                )!.translate("maternal_health_system"),
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Colors.black54,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // 📝 Dynamic Form Field Builder
  Widget buildField(
    String key,
    String displayLabel, {
    bool isRequired = false,
    bool enabled = true,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? customValidator,
    TextEditingController? controller,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        enabled: enabled,
        keyboardType: keyboardType,
        textInputAction: TextInputAction.next,
        style: const TextStyle(color: Colors.black87),
        decoration: InputDecoration(
          labelText: displayLabel,
          labelStyle: const TextStyle(
            color: Colors.black54,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          filled: true,
          fillColor: enabled ? Colors.white : Colors.grey.shade200,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 15,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: const BorderSide(color: Color(0xFFF48FB1), width: 2),
          ),
          errorMaxLines: 2,
        ),
        validator: (value) {
          if (isRequired && (value == null || value.trim().isEmpty)) {
            return '$displayLabel ${AppLocalizations.of(context)!.translate("is_required")}';
          }
          if (customValidator != null) {
            return customValidator(value);
          }
          return null;
        },
      ),
    );
  }

  String? _phoneValidator(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    final cleanValue = value.trim();
    final phoneRegex = RegExp(r'^\+?[0-9]{7,15}$');
    if (!phoneRegex.hasMatch(cleanValue)) {
      return AppLocalizations.of(context)!.translate("invalid_phone_error");
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    const sectionHeaderStyle = TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.bold,
      color: Color(0xFFC2185B),
    );

    final local = AppLocalizations.of(context)!;

    return Scaffold(
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFC2185B)),
            )
          : SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    buildHeader(),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16.0,
                        vertical: 15.0,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 🤰 1. Patient Details Section
                          Text(
                            local.translate("section_patient_details"),
                            style: sectionHeaderStyle,
                          ),
                          const Divider(color: Color(0xFFF48FB1), thickness: 1),
                          const SizedBox(height: 10),

                          buildField(
                            "patient_name",
                            local.translate("patient_name"),
                            enabled: false,
                            isRequired: true,
                            controller: _nameController,
                          ),
                          buildField(
                            "patient_age",
                            local.translate("patient_age"),
                            enabled: false,
                            keyboardType: TextInputType.number,
                            isRequired: true,
                            controller: _ageController,
                          ),
                          buildField(
                            "blood_group",
                            local.translate("blood_group"),
                            enabled: false,
                            controller: _bloodGroupController,
                          ),
                          buildField(
                            "bmi",
                            local.translate("bmi"),
                            enabled: false,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            controller: _bmiController,
                          ),
                          buildField(
                            "height",
                            local.translate("height"),
                            enabled: false,
                            keyboardType: TextInputType.number,
                            controller: _heightController,
                          ),
                          buildField(
                            "allergies",
                            local.translate("allergies"),
                            controller: _allergiesController,
                          ),
                          buildField(
                            "patient_address",
                            local.translate("patient_address"),
                            enabled: false,
                            controller: _addressController,
                          ),
                          buildField(
                            "patient_phone",
                            local.translate("patient_phone"),
                            keyboardType: TextInputType.phone,
                            customValidator: _phoneValidator,
                            controller: _phoneController,
                          ),

                          const SizedBox(height: 15),

                          // 🚨 2. Emergency Contact Section
                          Text(
                            local.translate("section_emergency_contact"),
                            style: sectionHeaderStyle,
                          ),
                          const Divider(color: Color(0xFFF48FB1), thickness: 1),
                          const SizedBox(height: 10),

                          buildField(
                            "emergency_name",
                            local.translate("emergency_name"),
                            controller: _emergencyNameController,
                          ),
                          buildField(
                            "emergency_address",
                            local.translate("emergency_address"),
                            controller: _emergencyAddressController,
                          ),
                          buildField(
                            "emergency_phone",
                            local.translate("emergency_phone"),
                            keyboardType: TextInputType.phone,
                            customValidator: _phoneValidator,
                            controller: _emergencyPhoneController,
                          ),

                          const SizedBox(height: 15),

                          // 👨‍👩‍👧 3. Family Details Section
                          Text(
                            local.translate("section_family_details"),
                            style: sectionHeaderStyle,
                          ),
                          const Divider(color: Color(0xFFF48FB1), thickness: 1),
                          const SizedBox(height: 10),

                          buildField(
                            "spouse_name",
                            local.translate("spouse_name"),
                            controller: _spouseNameController,
                          ),
                          buildField(
                            "spouse_age",
                            local.translate("spouse_age"),
                            enabled: false,
                            keyboardType: TextInputType.number,
                            controller: _spouseAgeController,
                          ),
                          buildField(
                            "patient_education",
                            local.translate("patient_education"),
                            enabled: false,
                            controller: _patientEducationController,
                          ),
                          buildField(
                            "spouse_education",
                            local.translate("spouse_education"),
                            enabled: false,
                            controller: _spouseEducationController,
                          ),
                          buildField(
                            "patient_occupation",
                            local.translate("patient_occupation"),
                            enabled: false,
                            controller: _patientOccupationController,
                          ),
                          buildField(
                            "spouse_occupation",
                            local.translate("spouse_occupation"),
                            enabled: false,
                            controller: _spouseOccupationController,
                          ),
                          buildField(
                            "marriage_age",
                            local.translate("marriage_age"),
                            enabled: false,
                            keyboardType: TextInputType.number,
                            controller: _marriageAgeController,
                          ),

                          const SizedBox(height: 15),

                          // 📝 4. Registration Details Section
                          Text(
                            local.translate("section_registration_details"),
                            style: sectionHeaderStyle,
                          ),
                          const Divider(color: Color(0xFFF48FB1), thickness: 1),
                          const SizedBox(height: 10),

                          buildField(
                            "reg_number",
                            enabled: false,
                            local.translate("reg_number"),
                            controller: _regNumberController,
                          ),
                          buildField(
                            "reg_date",
                            local.translate("reg_date"),
                            enabled: false,
                            keyboardType: TextInputType.datetime,
                            controller: _regDateController,
                          ),

                          buildField(
                            "mother_reg_date",
                            local.translate("mother_reg_date"),
                            enabled: false,
                            keyboardType: TextInputType.datetime,
                            controller: _motherRegDateController,
                          ),

                          const SizedBox(height: 15),

                          // 🏥 5. Health System Details Section
                          Text(
                            local.translate("section_health_system"),
                            style: sectionHeaderStyle,
                          ),
                          const Divider(color: Color(0xFFF48FB1), thickness: 1),
                          const SizedBox(height: 10),

                          buildField(
                            "gn_division",
                            local.translate("gn_division"),
                            enabled: false,
                            controller: _gnDivisionController,
                          ),
                          buildField(
                            "phm_area",
                            local.translate("phm_area"),
                            enabled: false,
                            controller: _phmAreaController,
                          ),
                          buildField(
                            "moh_area",
                            local.translate("moh_area"),
                            enabled: false,
                            controller: _mohAreaController,
                          ),

                          buildField(
                            "hospital_clinic",
                            local.translate("hospital_clinic"),
                            enabled: false,
                            controller: _hospitalClinicController,
                          ),
                          buildField(
                            "consultant_obs",
                            local.translate("consultant_obs"),
                            enabled: false,
                            controller: _consultantObsController,
                          ),
                          buildField(
                            "antenatal_risk",
                            local.translate("antenatal_risk"),
                            enabled: false,
                            controller: _antenatalRiskController,
                          ),

                          const SizedBox(height: 25),

                          // 💾 Save Button
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFF48FB1),
                                foregroundColor: Colors.white,
                                elevation: 2,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                              ),
                              onPressed: _saveFormToSupabase,
                              child: Text(
                                local.translate("btn_save_profile"),
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(height: 15),

                          // ➡️ Navigation Link Button
                          const SizedBox(height: 25),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
