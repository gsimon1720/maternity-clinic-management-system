import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'localization/app_localizations.dart';

class ObstetricHistoryPage extends StatefulWidget {
  final int pregnancyId; // ලොග් වූ රෝගියාට අදාළව ස්වයංක්‍රීයව ලැබෙන ID එක

  const ObstetricHistoryPage({super.key, required this.pregnancyId});

  @override
  State<ObstetricHistoryPage> createState() => _ObstetricHistoryPageState();
}

class _ObstetricHistoryPageState extends State<ObstetricHistoryPage> {
  final bool isViewOnly = true; // රෝගියාට බැලීමට පමණක් සලසා ඇත
  bool isLoading = true;
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final TextEditingController _gravidityController = TextEditingController();
  final TextEditingController _parityController = TextEditingController();
  final TextEditingController _childrenAliveController =
      TextEditingController();
  final TextEditingController _youngestAgeController = TextEditingController();

  final TextEditingController _lmpController = TextEditingController();
  final TextEditingController _eddController = TextEditingController();
  final TextEditingController _completion40WeeksController =
      TextEditingController();
  final TextEditingController _correctedEddController = TextEditingController();
  final TextEditingController _poaDatingScanController =
      TextEditingController();
  final TextEditingController _doctorSignatureController =
      TextEditingController();
  final TextEditingController _poaRegistrationController =
      TextEditingController();
  final TextEditingController _quickeningDateController =
      TextEditingController();
  final TextEditingController _familyPlanningController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchObstetricHistory();
  }

  @override
  void dispose() {
    // Memory leaks වළක්වා ගැනීමට Controllers dispose කිරීම
    _gravidityController.dispose();
    _parityController.dispose();
    _childrenAliveController.dispose();
    _youngestAgeController.dispose();
    _lmpController.dispose();
    _eddController.dispose();
    _completion40WeeksController.dispose();
    _correctedEddController.dispose();
    _poaDatingScanController.dispose();
    _doctorSignatureController.dispose();
    _poaRegistrationController.dispose();
    _quickeningDateController.dispose();
    _familyPlanningController.dispose();
    super.dispose();
  }

  // 📥 ලබා දුන් pregnancy_id එක හරහා දත්ත ලබා ගැනීම
  Future<void> _fetchObstetricHistory() async {
    try {
      final supabase = Supabase.instance.client;

      final response = await supabase
          .from('present_obstetric_history')
          .select()
          .eq('pregnancy_id', widget.pregnancyId)
          .maybeSingle();

      if (!mounted) return;

      if (response != null) {
        setState(() {
          _gravidityController.text = response['gravida']?.toString() ?? '';
          _parityController.text = response['parity']?.toString() ?? '';
          _childrenAliveController.text =
              response['living_children']?.toString() ?? '';
          _youngestAgeController.text =
              response['youngest_child_age']?.toString() ?? '';

          _lmpController.text = response['lmp']?.toString() ?? '';
          _eddController.text = response['edd']?.toString() ?? '';
          _completion40WeeksController.text =
              response['completion_40_weeks']?.toString() ?? '';
          _correctedEddController.text =
              response['corrected_edd']?.toString() ?? '';

          // 🛑 Fix: DB schema eke column name eka 'poa_at_dating_scan'
          _poaDatingScanController.text =
              response['poa_at_dating_scan']?.toString() ?? '';

          _doctorSignatureController.text =
              response['doctor_signature']?.toString() ?? '';
          _poaRegistrationController.text =
              response['poa_at_registration']?.toString() ?? '';
          _quickeningDateController.text =
              response['quickening_date']?.toString() ?? '';
          _familyPlanningController.text =
              response['family_planning_before_pregnancy']?.toString() ?? '';
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading history: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Widget buildTextField(
    String key,
    String displayLabel,
    TextEditingController controller, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        readOnly: isViewOnly,
        enabled: !isViewOnly,
        decoration: InputDecoration(
          labelText: displayLabel,
          labelStyle: const TextStyle(
            color: Colors.black54,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 16,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
        ),
      ),
    );
  }

  Widget buildDateField(
    String key,
    String displayLabel,
    TextEditingController controller,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        readOnly: true,
        enabled: !isViewOnly,
        decoration: InputDecoration(
          labelText: displayLabel,
          labelStyle: const TextStyle(
            color: Colors.black54,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          filled: true,
          fillColor: Colors.white,
          suffixIcon: const Icon(
            Icons.calendar_month_rounded,
            color: Color(0xFFF48FB1),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 16,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide(color: Colors.grey.shade200, width: 1),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const sectionHeaderStyle = TextStyle(
      fontSize: 15,
      fontWeight: FontWeight.bold,
      color: Color(0xFFC2185B),
      letterSpacing: 0.5,
    );

    final local = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(
          local.translate("obs_history_appbar_title"),
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
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFF48FB1)),
            )
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF880E4F), Color(0xFFC2185B)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.assignment_ind_rounded,
                              color: Colors.white,
                              size: 26,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                local.translate("obs_header_title"),
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: buildTextField(
                              "gravida",
                              local.translate("gravidity_g"),
                              _gravidityController,
                              keyboardType: TextInputType.number,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: buildTextField(
                              "parity",
                              local.translate("parity_p"),
                              _parityController,
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),
                      buildTextField(
                        "living_children",
                        local.translate("children_alive"),
                        _childrenAliveController,
                        keyboardType: TextInputType.number,
                      ),
                      buildTextField(
                        "youngest_child_age",
                        local.translate("youngest_child_age"),
                        _youngestAgeController,
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          const Icon(
                            Icons.date_range_rounded,
                            color: Color(0xFFC2185B),
                            size: 20,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            local.translate("section_key_dates"),
                            style: sectionHeaderStyle,
                          ),
                        ],
                      ),
                      const Divider(
                        color: Color(0xFFF48FB1),
                        thickness: 1,
                        height: 20,
                      ),
                      buildDateField(
                        "lmp",
                        local.translate("lmrp"),
                        _lmpController,
                      ),
                      buildDateField(
                        "edd",
                        local.translate("edd"),
                        _eddController,
                      ),
                      buildDateField(
                        "completion_40_weeks",
                        local.translate("weeks_40_completion"),
                        _completion40WeeksController,
                      ),
                      buildDateField(
                        "corrected_edd",
                        local.translate("us_corrected_edd"),
                        _correctedEddController,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: buildTextField(
                              "poa_dating_scan",
                              local.translate("poa_dating_scan"),
                              _poaDatingScanController,
                              keyboardType: TextInputType.number,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: buildTextField(
                              "doctor_signature",
                              local.translate("scan_signature"),
                              _doctorSignatureController,
                            ),
                          ),
                        ],
                      ),
                      buildTextField(
                        "poa_at_registration",
                        local.translate("poa_at_registration"),
                        _poaRegistrationController,
                        keyboardType: TextInputType.number,
                      ),
                      buildDateField(
                        "quickening_date",
                        local.translate("date_of_quickening"),
                        _quickeningDateController,
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          const Icon(
                            Icons.health_and_safety_rounded,
                            color: Color(0xFFC2185B),
                            size: 20,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            local.translate("section_family_planning"),
                            style: sectionHeaderStyle,
                          ),
                        ],
                      ),
                      const Divider(
                        color: Color(0xFFF48FB1),
                        thickness: 1,
                        height: 20,
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 24),
                        child: TextFormField(
                          controller: _familyPlanningController,
                          maxLines: 3,
                          readOnly: isViewOnly,
                          enabled: !isViewOnly,
                          decoration: InputDecoration(
                            labelText: local.translate(
                              "family_planning_question",
                            ),
                            labelStyle: const TextStyle(
                              color: Colors.black54,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                            alignLabelWithHint: true,
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(15),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(15),
                              borderSide: BorderSide(
                                color: Colors.grey.shade200,
                                width: 1,
                              ),
                            ),
                            disabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(15),
                              borderSide: BorderSide(
                                color: Colors.grey.shade200,
                                width: 1,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
