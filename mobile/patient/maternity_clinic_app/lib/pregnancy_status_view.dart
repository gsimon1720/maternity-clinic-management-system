import 'package:flutter/material.dart';
import 'localization/app_localizations.dart'; // 🌍 Localization සම්බන්ධ කළා

class PregnancyStatusViewPage extends StatefulWidget {
  const PregnancyStatusViewPage({super.key});

  @override
  State<PregnancyStatusViewPage> createState() =>
      _PregnancyStatusViewPageState();
}

class _PregnancyStatusViewPageState extends State<PregnancyStatusViewPage> {
  final _formKey = GlobalKey<FormState>();

  // 📝 Conditions වල තත්ත්වය track කරන variables
  bool ageRisk = false;
  bool fiveOrMorePregnancies = false;
  bool hypertensionRisk = false;
  bool vaginalBleeding = false;
  bool multiplePregnancy = false;
  bool excessiveVomiting = false;
  bool uncertainEDD = false;

  final TextEditingController _othersController = TextEditingController();

  // 🌸 Custom Switch Row Widget (Localization අනුකූලයි)
  Widget buildRiskSwitchRow(
    String title,
    bool value,
    ValueChanged<bool>? onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: const Color(0xFFF48FB1).withOpacity(0.15)),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ListTile(
          title: Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
          trailing: Switch(
            value: value,
            onChanged: null,
            activeColor: const Color(0xFFE91E63),
            activeTrackColor: const Color(0xFFF8BBD0),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // 💡 කෙටියෙන් translation එක variable එකකට ගත්තා
    final local = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: const Color(0xFFFFF1F3), // Soft Pink Background
      appBar: AppBar(
        title: Text(
          local.translate("preg_status_appbar_title"),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFF48FB1),
        centerTitle: true,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ℹ️ ඉහළින්ම තියෙන උපදෙස් කාඩ්පත
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFFF48FB1).withOpacity(0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.info_outline_rounded,
                        color: Color(0xFFC2185B),
                        size: 28,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          local.translate("preg_status_instruction"),
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.black54,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                Text(
                  local.translate("preg_status_section_title"),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFC2185B),
                  ),
                ),
                const SizedBox(height: 10),

                // 🗂️ Table 03 හි ඇති ප්‍රශ්න සියල්ලම (Localized)
                buildRiskSwitchRow(
                  local.translate("risk_age"),
                  ageRisk,

                  (val) => setState(() => ageRisk = val),
                ),
                buildRiskSwitchRow(
                  local.translate("risk_five_pregnancies"),
                  fiveOrMorePregnancies,
                  (val) => setState(() => fiveOrMorePregnancies = val),
                ),
                buildRiskSwitchRow(
                  local.translate("risk_hypertension"),
                  hypertensionRisk,
                  (val) => setState(() => hypertensionRisk = val),
                ),
                buildRiskSwitchRow(
                  local.translate("risk_bleeding"),
                  vaginalBleeding,
                  (val) => setState(() => vaginalBleeding = val),
                ),
                buildRiskSwitchRow(
                  local.translate("risk_multiple_pregnancy"),
                  multiplePregnancy,
                  (val) => setState(() => multiplePregnancy = val),
                ),
                buildRiskSwitchRow(
                  local.translate("risk_vomiting"),

                  excessiveVomiting,
                  (val) => setState(() => excessiveVomiting = val),
                ),
                buildRiskSwitchRow(
                  local.translate("risk_uncertain_edd"),
                  uncertainEDD,
                  (val) => setState(() => uncertainEDD = val),
                ),

                const SizedBox(height: 12),

                // ✏️ Others (Specify) කොටස
                Text(
                  local.translate("preg_status_others_label"),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _othersController,
                  enabled: false,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: local.translate("preg_status_others_hint"),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: const BorderSide(
                        color: Color(0xFFF48FB1),
                        width: 1.5,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 30),

                // 💾 Save Button එක (Standard Flutter Implementation)
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
