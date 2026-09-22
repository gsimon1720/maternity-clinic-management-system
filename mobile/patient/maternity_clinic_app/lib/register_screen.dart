import 'dart:io';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';

import 'localization/app_localizations.dart';
import 'main.dart';
import 'validators.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  // Text Controllers
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _nicController = TextEditingController();
  final _dobController = TextEditingController();
  final _ageController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _bloodGroupController = TextEditingController();
  final _allergiesController = TextEditingController();
  final _patientEducationController = TextEditingController();
  final _patientOccupationController = TextEditingController();

  final _emergencyNameController = TextEditingController();
  final _emergencyPhoneController = TextEditingController();
  final _emergencyAddressController = TextEditingController();

  final _spouseNameController = TextEditingController();
  final _spouseAgeController = TextEditingController();
  final _spouseEducationController = TextEditingController();
  final _spouseOccupationController = TextEditingController();
  final _ageAtMarriageController = TextEditingController();

  final _gramaNiladhariController = TextEditingController();
  final _mohAreaController = TextEditingController(text: "Borella");
  final _phmAreaController = TextEditingController();
  final _midwifeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  // Dropdown States
  List<Map<String, dynamic>> _zonesList = [];
  Map<String, dynamic>? _selectedZone;
  int? _assignedMidwifeUserId;
  bool _isFetchingDetails = false;

  XFile? pickedFile;
  final ImagePicker picker = ImagePicker();
  bool isLoading = false;
  bool isZonesLoading = true;

  final Color primaryPink = const Color(0xfff48fb1);

  @override
  void initState() {
    super.initState();
    _fetchZones();
  }

  Future<void> _fetchZones() async {
    try {
      final response = await Supabase.instance.client
          .from('zones')
          .select('zone_id, area_id, zone_name, zone_code')
          .order('zone_name', ascending: true);

      setState(() {
        _zonesList = List<Map<String, dynamic>>.from(response);
        isZonesLoading = false;
      });
    } catch (e) {
      setState(() => isZonesLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Error fetching Zones: $e")));
      }
    }
  }

  Future<void> _onZoneSelected(Map<String, dynamic>? zone) async {
    if (zone == null) return;

    setState(() {
      _selectedZone = zone;
      _assignedMidwifeUserId = null;
      _isFetchingDetails = true;
      _phmAreaController.text = "Loading...";
      _midwifeController.text = "Loading...";
    });

    final supabase = Supabase.instance.client;
    final int areaId = zone['area_id'];

    try {
      final areaData = await supabase
          .from('areas')
          .select('area_name, area_code')
          .eq('area_id', areaId)
          .maybeSingle();

      if (areaData != null) {
        _phmAreaController.text =
            "${areaData['area_name']} (${areaData['area_code']})";
      } else {
        _phmAreaController.text = "Area Not Found";
      }
    } catch (e) {
      _phmAreaController.text = "Area Error";
    }

    try {
      final midwifeData = await supabase
          .from('users')
          .select('user_id, full_name')
          .eq('area_id', areaId)
          .eq('role', 'MIDWIFE')
          .maybeSingle();

      if (midwifeData != null) {
        _assignedMidwifeUserId = midwifeData['user_id'];
        _midwifeController.text = midwifeData['full_name'] ?? 'Assigned';
      } else {
        _midwifeController.text = "Not Assigned Yet";
      }
    } catch (e) {
      _midwifeController.text = "Midwife Error";
    } finally {
      setState(() => _isFetchingDetails = false);
    }
  }

  Future<void> pickImage() async {
    final result = await picker.pickImage(source: ImageSource.gallery);
    if (result != null) {
      setState(() => pickedFile = result);
    }
  }

  // --- Date Picker and Auto Age Calculation ---
  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: primaryPink,
              onPrimary: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final today = DateTime.now();
      int age = today.year - picked.year;
      if (today.month < picked.month ||
          (today.month == picked.month && today.day < picked.day)) {
        age--;
      }

      setState(() {
        _dobController.text =
            "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
        _ageController.text = age.toString();
      });
    }
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedZone == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select your Street/Zone Address")),
      );
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.translate("passwords_dont_match"),
          ),
        ),
      );
      return;
    }

    if (pickedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.translate("upload_report_warning"),
          ),
        ),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final supabase = Supabase.instance.client;

      final existing = await supabase
          .from('patient')
          .select()
          .eq('email', _emailController.text.trim())
          .maybeSingle();

      if (existing != null) {
        setState(() => isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Email already exists")));
        return;
      }

      final AuthResponse authResponse = await supabase.auth.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      final userData = await supabase
          .from('users')
          .insert({
            'email': _emailController.text.trim(),
            'full_name':
                "${_firstNameController.text.trim()} ${_lastNameController.text.trim()}",
            'role': 'PATIENT',
            'password_hash': _passwordController.text,
          })
          .select()
          .single();

      final userId = userData['user_id'];

      if (authResponse.user == null) {
        throw 'Authentication failed.';
      }

      final file = File(pickedFile!.path);
      final fileName =
          '${DateTime.now().millisecondsSinceEpoch}_${pickedFile!.name}';
      final storagePath = 'reports/$fileName';

      await supabase.storage
          .from('pregnancy-reports')
          .upload(storagePath, file);
      final reportUrl = supabase.storage
          .from('pregnancy-reports')
          .getPublicUrl(storagePath);

      await supabase.from('patient').insert({
        'user_id': userId,
        'first_name': _firstNameController.text.trim(),
        'last_name': _lastNameController.text.trim(),
        'nic': _nicController.text.trim(),
        'dob': _dobController.text.isEmpty ? null : _dobController.text,
        'age': int.tryParse(_ageController.text.trim()),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address':
            "${_addressController.text.trim()}, ${_selectedZone!['zone_name']}",
        'zone_id': _selectedZone!['zone_id'],
        'area_id': _selectedZone!['area_id'],
        'assigned_midwife_id': _assignedMidwifeUserId,
        'blood_group': _bloodGroupController.text.trim(),
        'allergies': _allergiesController.text.trim(),
        'patient_education': _patientEducationController.text.trim(),
        'patient_occupation': _patientOccupationController.text.trim(),
        'emergency_contact_name': _emergencyNameController.text.trim(),
        'emergency_contact_phone': _emergencyPhoneController.text.trim(),
        'emergency_contact_address': _emergencyAddressController.text.trim(),
        'spouse_name': _spouseNameController.text.trim(),
        'spouse_age': int.tryParse(_spouseAgeController.text.trim()),
        'spouse_education': _spouseEducationController.text.trim(),
        'spouse_occupation': _spouseOccupationController.text.trim(),
        'age_at_marriage': int.tryParse(_ageAtMarriageController.text.trim()),
        'grama_niladhari_division': _gramaNiladhariController.text.trim(),
        'phm_area': _phmAreaController.text.trim(),
        'moh_area': _mohAreaController.text.trim(),
        'pregnancy_report_url': reportUrl,
        'status': 'pending',
      });

      if (!mounted) return;
      setState(() => isLoading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.translate("registration_success"),
          ),
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  Widget buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? Function(String?)? validator,
    bool obscure = false,
    bool readOnly = false,
    TextInputType keyboardType = TextInputType.text,
    VoidCallback? onTap,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        validator: validator,
        obscureText: obscure,
        readOnly: readOnly,
        keyboardType: keyboardType,
        onTap: onTap,
        maxLines: maxLines,
        style: const TextStyle(fontSize: 15),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.grey[700]),
          prefixIcon: Icon(icon, color: primaryPink, size: 22),
          filled: true,
          fillColor: Colors.grey[50],
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: primaryPink, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Colors.redAccent),
          ),
          contentPadding: const EdgeInsets.symmetric(
            vertical: 16,
            horizontal: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard(String title, IconData icon, List<Widget> children) {
    return Card(
      elevation: 3,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      margin: const EdgeInsets.only(bottom: 24),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: primaryPink.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: primaryPink, size: 26),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(color: Colors.black12, height: 1),
            const SizedBox(height: 20),
            ...children,
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _nicController.dispose();
    _dobController.dispose();
    _ageController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _bloodGroupController.dispose();
    _allergiesController.dispose();
    _patientEducationController.dispose();
    _patientOccupationController.dispose();
    _emergencyNameController.dispose();
    _emergencyPhoneController.dispose();
    _emergencyAddressController.dispose();
    _spouseNameController.dispose();
    _spouseAgeController.dispose();
    _spouseEducationController.dispose();
    _spouseOccupationController.dispose();
    _ageAtMarriageController.dispose();
    _gramaNiladhariController.dispose();
    _mohAreaController.dispose();
    _phmAreaController.dispose();
    _midwifeController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: primaryPink,
        elevation: 0,
        title: Text(AppLocalizations.of(context)!.translate("register_title")),
        actions: [
          TextButton(
            onPressed: () {
              Locale current = Localizations.localeOf(context);
              if (current.languageCode == 'en') {
                MyApp.setLocale(context, const Locale('si'));
              } else {
                MyApp.setLocale(context, const Locale('en'));
              }
            },
            child: Text(
              Localizations.localeOf(context).languageCode == 'en'
                  ? "SI"
                  : "EN",
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // --- 1. Personal Details Card ---
              _buildSectionCard(
                AppLocalizations.of(context)!.translate("personal_details"),
                Icons.person,
                [
                  buildTextField(
                    controller: _firstNameController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("first_name"),
                    icon: Icons.person,
                    validator: Validators.name,
                  ),
                  buildTextField(
                    controller: _lastNameController,
                    label: AppLocalizations.of(context)!.translate("last_name"),
                    icon: Icons.person_outline,
                  ),
                  buildTextField(
                    controller: _nicController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("nic_number"),
                    icon: Icons.badge,
                    validator: Validators.nic,
                  ),
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: buildTextField(
                          controller: _dobController,
                          label: AppLocalizations.of(context)!.translate("dob"),
                          icon: Icons.calendar_today,
                          readOnly: true,
                          onTap: () => _selectDate(context),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 1,
                        child: buildTextField(
                          controller: _ageController,
                          label: AppLocalizations.of(context)!.translate("age"),
                          icon: Icons.cake,
                          readOnly: true,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // --- 2. Contact & Area Info Card ---
              _buildSectionCard(
                AppLocalizations.of(context)!.translate("contact_location"),
                Icons.location_on_rounded,
                [
                  buildTextField(
                    controller: _phoneController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("telephone_number"),
                    icon: Icons.phone,
                    keyboardType: TextInputType.phone,
                    validator: Validators.phone,
                  ),
                  buildTextField(
                    controller: _emailController,
                    label: AppLocalizations.of(context)!.translate("email"),
                    icon: Icons.email,
                    validator: Validators.email,
                  ),
                  buildTextField(
                    controller: _addressController,
                    label: AppLocalizations.of(context)!.translate("address"),
                    icon: Icons.home,
                    maxLines: 2,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: isZonesLoading
                        ? const Center(child: CircularProgressIndicator())
                        : DropdownButtonFormField<Map<String, dynamic>>(
                            decoration: InputDecoration(
                              labelText: AppLocalizations.of(
                                context,
                              )!.translate("select_street"),
                              prefixIcon: Icon(
                                Icons.add_location,
                                color: primaryPink,
                              ),
                              filled: true,
                              fillColor: Colors.grey[50],
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: Colors.grey.shade300,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: primaryPink,
                                  width: 2,
                                ),
                              ),
                            ),
                            value: _selectedZone,
                            items: _zonesList.map((zone) {
                              return DropdownMenuItem<Map<String, dynamic>>(
                                value: zone,
                                child: Text(zone['zone_name']),
                              );
                            }).toList(),
                            onChanged: _onZoneSelected,
                            validator: (val) => val == null
                                ? "Please select your street/zone"
                                : null,
                          ),
                  ),
                  buildTextField(
                    controller: _gramaNiladhariController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("grama_niladhari_division"),
                    icon: Icons.location_city,
                  ),
                  buildTextField(
                    controller: _phmAreaController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("phm_area_auto"),
                    icon: Icons.map,
                    readOnly: true,
                  ),
                  buildTextField(
                    controller: _midwifeController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("assigned_midwife"),
                    icon: Icons.health_and_safety,
                    readOnly: true,
                  ),
                ],
              ),

              // --- 3. Medical & Education Card ---
              _buildSectionCard(
                AppLocalizations.of(context)!.translate("health_education"),
                Icons.medical_information,
                [
                  Row(
                    children: [
                      Expanded(
                        child: buildTextField(
                          controller: _bloodGroupController,
                          label: AppLocalizations.of(
                            context,
                          )!.translate("blood_group"),
                          icon: Icons.bloodtype,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: buildTextField(
                          controller: _allergiesController,
                          label: AppLocalizations.of(
                            context,
                          )!.translate("allergies"),
                          icon: Icons.warning_amber_rounded,
                        ),
                      ),
                    ],
                  ),
                  buildTextField(
                    controller: _patientEducationController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("patient_education"),
                    icon: Icons.school,
                  ),
                  buildTextField(
                    controller: _patientOccupationController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("patient_occupation"),
                    icon: Icons.work,
                  ),
                ],
              ),

              // --- 4. Spouse Details Card ---
              _buildSectionCard(
                AppLocalizations.of(context)!.translate("spouse_details"),
                Icons.family_restroom,
                [
                  buildTextField(
                    controller: _spouseNameController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("spouse_name"),
                    icon: Icons.people,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: buildTextField(
                          controller: _spouseAgeController,
                          label: AppLocalizations.of(
                            context,
                          )!.translate("spouse_age"),
                          icon: Icons.cake,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: buildTextField(
                          controller: _ageAtMarriageController,
                          label: AppLocalizations.of(
                            context,
                          )!.translate("age_at_marriage"),
                          icon: Icons.favorite,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                  buildTextField(
                    controller: _spouseEducationController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("spouse_education"),
                    icon: Icons.school_outlined,
                  ),
                  buildTextField(
                    controller: _spouseOccupationController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("spouse_occupation"),
                    icon: Icons.work_outline,
                  ),
                ],
              ),

              // --- 5. Emergency Contact Card ---
              _buildSectionCard(
                AppLocalizations.of(context)!.translate("emergency_contact"),
                Icons.contact_emergency,
                [
                  buildTextField(
                    controller: _emergencyNameController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("emergency_contact_name"),
                    icon: Icons.person,
                  ),
                  buildTextField(
                    controller: _emergencyPhoneController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("emergency_contact_phone"),
                    icon: Icons.phone_forwarded,
                    keyboardType: TextInputType.phone,
                  ),
                  buildTextField(
                    controller: _emergencyAddressController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("emergency_contact_address"),
                    icon: Icons.location_on,
                  ),
                ],
              ),

              // --- 6. Account Setup & File Upload Card ---
              _buildSectionCard(
                AppLocalizations.of(context)!.translate("account_documents"),
                Icons.security,
                [
                  buildTextField(
                    controller: _passwordController,
                    label: AppLocalizations.of(context)!.translate("password"),
                    icon: Icons.lock,
                    obscure: true,
                    validator: Validators.password,
                  ),
                  buildTextField(
                    controller: _confirmPasswordController,
                    label: AppLocalizations.of(
                      context,
                    )!.translate("confirm_password"),
                    icon: Icons.lock_outline,
                    obscure: true,
                  ),

                  const SizedBox(height: 10),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: primaryPink.withOpacity(0.05),
                      border: Border.all(color: primaryPink.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.description,
                          size: 40,
                          color: primaryPink.withOpacity(0.6),
                        ),
                        const SizedBox(height: 10),
                        ElevatedButton.icon(
                          onPressed: pickImage,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: primaryPink,
                            elevation: 0,
                            side: BorderSide(color: primaryPink),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          icon: const Icon(Icons.upload_file),
                          label: Text(
                            AppLocalizations.of(
                              context,
                            )!.translate("upload_report_btn"),
                          ),
                        ),
                        if (pickedFile != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: Text(
                              "Selected: ${pickedFile!.name}",
                              style: const TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.w600,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // --- Submit Button ---
              SizedBox(
                height: 55,
                child: ElevatedButton(
                  onPressed: isLoading || _isFetchingDetails ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryPink,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    elevation: 3,
                  ),
                  child: isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          AppLocalizations.of(
                            context,
                          )!.translate("submit_registration"),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
