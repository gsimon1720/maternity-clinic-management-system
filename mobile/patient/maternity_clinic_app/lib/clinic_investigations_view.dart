import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ClinicInvestigationsViewPage extends StatefulWidget {
  final int patientId;

  const ClinicInvestigationsViewPage({super.key, required this.patientId});

  @override
  State<ClinicInvestigationsViewPage> createState() =>
      _ClinicInvestigationsViewPageState();
}

class _ClinicInvestigationsViewPageState
    extends State<ClinicInvestigationsViewPage> {
  bool isLoading = true;
  Map<String, dynamic> _data = {};

  @override
  void initState() {
    super.initState();
    _fetchPatientData();
  }

  // 🔄 Supabase database eken adala patientge data fetch karana function eka
  Future<void> _fetchPatientData() async {
    setState(() {
      isLoading = true;
    });

    try {
      final supabase = Supabase.instance.client;

      final data = await supabase
          .from('routine_investigations')
          .select('''
            *,
            pregnancy!inner(
              patient_id,
              pregnancy_status
            )
          ''')
          .eq('pregnancy.patient_id', widget.patientId)
          .eq('pregnancy.pregnancy_status', 'ACTIVE')
          .single();

      setState(() {
        _data = data;
      });
    } catch (e) {
      print("Error loading investigations: $e");
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  // 🧪 Syphilis Data mapping
  Map<String, dynamic> get _syphilisData {
    if (_data.isEmpty) return {};
    final resultVal = _data['syphilis_result']?.toString() ?? '';
    String formattedResult = 'Pending / Not Done';
    if (resultVal == 'R') {
      formattedResult = 'R (Reactive)';
    } else if (resultVal == 'NR') {
      formattedResult = 'NR (Non-Reactive)';
    }

    return {
      'poa': '${_data['syphilis_poa'] ?? '--'} Weeks',
      'sampleDate': _data['syphilis_sample_date'] ?? '--',
      'resultDate': _data['syphilis_result_date'] ?? '--',
      'result': formattedResult,
      'referralDate': _data['syphilis_referral_date'] ?? 'Not applicable',
    };
  }

  // 🩸 General Investigations Data mapping
  List<Map<String, String>> get _investigations {
    if (_data.isEmpty) return [];
    return [
      {
        'test': 'Blood Sugar (1st Test)',
        'poa': '${_data['bs_1_poa'] ?? '--'} Weeks',
        'result': '${_data['bs_1_result'] ?? '--'} mg/dL',
      },
      {
        'test': 'Blood Sugar (2nd Test)',
        'poa': '${_data['bs_2_poa'] ?? '--'} Weeks',
        'result': '${_data['bs_2_result'] ?? '--'} mg/dL',
      },
      {
        'test': 'Haemoglobin - Hb (1st Test)',
        'poa': '${_data['hb_1_poa'] ?? '--'} Weeks',
        'result': '${_data['hb_1_result'] ?? '--'} g/dL',
      },
      {
        'test': 'Haemoglobin - Hb (2nd Test)',
        'poa': '${_data['hb_2_poa'] ?? '--'} Weeks',
        'result': '${_data['hb_2_result'] ?? '--'} g/dL',
      },
      {
        'test': 'HIV Screening Sample Date',
        'poa': '--',
        'result': 'Taken (${_data['hiv_sample_date'] ?? '--'})',
      },
      {
        'test': 'HIV Result Informed to Mother',
        'poa': '--',
        'result': 'Informed (${_data['hiv_result_date'] ?? '--'})',
      },
      {
        'test': 'Blood Film Test for Malaria',
        'poa': '${_data['malaria_poa'] ?? '--'} Weeks',
        'result': _data['malaria_result']?.toString().isNotEmpty == true
            ? _data['malaria_result']
            : 'Pending',
      },
    ];
  }

  final List<Map<String, String>> _generalCheckups = const [
    {
      'trimester': 'T1 (1st Trimester)',
      'auscultation': 'Normal',
      'mental': 'Healthy / Normal',
      'respiratory': 'Clear',
      'breast': 'Examined - Normal',
      'goiter': 'Absent',
    },
    {
      'trimester': 'T2 (2nd Trimester)',
      'auscultation': 'Pending',
      'mental': 'Healthy / Normal',
      'respiratory': 'Clear',
      'breast': 'Not Examined',
      'goiter': 'Absent',
    },
  ];

  Widget buildDataRow(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black54,
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),
          Expanded(
            flex: 2,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: valueColor ?? Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFFC2185B), size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Color(0xFF880E4F),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(
          "Medical Investigations (Patient ID: ${widget.patientId})",
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFF48FB1),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFC2185B)),
            )
          : _data.isEmpty
          ? const Center(
              child: Text(
                "No active investigations found for this patient.",
                style: TextStyle(color: Colors.black54, fontSize: 14),
              ),
            )
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1️⃣ SYPHILIS SCREENING CARD
                    buildSectionHeader(
                      "Syphilis Screening",
                      Icons.biotech_rounded,
                    ),
                    const Divider(color: Color(0xFFF48FB1), height: 15),
                    Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                        side: BorderSide(
                          color: Colors.grey.shade200,
                          width: 1.5,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Column(
                          children: [
                            buildDataRow(
                              "POA at Blood Sampling",
                              _syphilisData['poa'],
                            ),
                            buildDataRow(
                              "Date of Blood Sampling",
                              _syphilisData['sampleDate'],
                            ),
                            buildDataRow(
                              "Date of Result Received",
                              _syphilisData['resultDate'],
                            ),
                            buildDataRow(
                              "Result",
                              _syphilisData['result'],
                              valueColor: Colors.teal.shade700,
                            ),
                            buildDataRow(
                              "If (R) Date of Referral",
                              _syphilisData['referralDate'],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 2️⃣ LABORATORY INVESTIGATIONS CARD
                    buildSectionHeader(
                      "Laboratory Investigations",
                      Icons.science_rounded,
                    ),
                    const Divider(color: Color(0xFFF48FB1), height: 15),
                    Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                        side: BorderSide(
                          color: Colors.grey.shade200,
                          width: 1.5,
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _investigations.length,
                          separatorBuilder: (context, index) =>
                              const Divider(height: 16, color: Colors.black12),
                          itemBuilder: (context, index) {
                            final item = _investigations[index];
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['test']!,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "POA: ${item['poa']}",
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Colors.black45,
                                      ),
                                    ),
                                    Text(
                                      "Result: ${item['result']}",
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFFC2185B),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 3️⃣ HEART & MENTAL HEALTH CHECKUP CARD
                    buildSectionHeader(
                      "Heart & Mental Health Checkup",
                      Icons.favorite_rounded,
                    ),
                    const Divider(color: Color(0xFFF48FB1), height: 15),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _generalCheckups.length,
                      itemBuilder: (context, index) {
                        final check = _generalCheckups[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: Colors.pink.shade50,
                              width: 1.5,
                            ),
                          ),
                          child: ExpansionTile(
                            title: Text(
                              check['trimester']!,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            leading: const Icon(
                              Icons.assignment_turned_in_rounded,
                              color: Color(0xFFC2185B),
                              size: 20,
                            ),
                            childrenPadding: const EdgeInsets.all(14),
                            children: [
                              buildDataRow(
                                "Auscultation (Heart)",
                                check['auscultation']!,
                              ),
                              buildDataRow("Mental Health", check['mental']!),
                              buildDataRow(
                                "Respiratory System",
                                check['respiratory']!,
                              ),
                              buildDataRow(
                                "Breast Examination",
                                check['breast']!,
                              ),
                              buildDataRow("Goiter", check['goiter']!),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
