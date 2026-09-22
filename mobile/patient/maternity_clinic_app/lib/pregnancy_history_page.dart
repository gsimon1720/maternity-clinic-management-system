import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'baby_details_view_page.dart';
import 'obstetric_history.dart';
import 'past_pregnancy_details_page.dart';
import 'localization/app_localizations.dart';

class PregnancyHistoryPage extends StatefulWidget {
  final String patientName;
  final int patientId;

  const PregnancyHistoryPage({
    Key? key,
    required this.patientName,
    required this.patientId,
  }) : super(key: key);

  @override
  State<PregnancyHistoryPage> createState() => _PregnancyHistoryPageState();
}

class _PregnancyHistoryPageState extends State<PregnancyHistoryPage> {
  final Color primaryColor = const Color(0xFFF48FB1);

  String selectedFilter = 'All';
  List<Map<String, dynamic>> pregnancyRecords = [];
  bool isLoading = true;
  bool isUploading = false;

  @override
  void initState() {
    super.initState();
    _fetchPregnancyHistory();
  }

  String _t(BuildContext context, String key) {
    return AppLocalizations.of(context)?.translate(key) ?? key;
  }

  Future<void> _fetchPregnancyHistory() async {
    try {
      final response = await Supabase.instance.client
          .from('pregnancy')
          .select('''
            pregnancy_id,
            pregnancy_no,
            pregnancy_status,
            registration_date,
            pregnant_mother_register_number,
            past_obstetric_history(*)
          ''')
          .eq('patient_id', widget.patientId)
          .order('pregnancy_no', ascending: true);

      setState(() {
        pregnancyRecords = List<Map<String, dynamic>>.from(response);
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${_t(context, 'error_loading_data')}: $e')),
      );
    }
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return Colors.green;
      case 'DELIVERED':
        return Colors.blueGrey;
      case 'MISCARRIAGE':
      case 'TERMINATED':
        return Colors.redAccent;
      case 'REFERRED':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  Future<void> _uploadReportAndAddNewPregnancy() async {
    try {
      final existingRequest = await Supabase.instance.client
          .from('pregnancy_request')
          .select()
          .eq('patient_id', widget.patientId)
          .eq('status', 'PENDING');

      if (existingRequest.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your pregnancy request is already pending.'),
          ),
        );
        return;
      }

      final picker = ImagePicker();
      final XFile? pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
      );

      if (pickedFile == null) return;

      setState(() {
        isUploading = true;
      });

      final file = File(pickedFile.path);
      final fileName =
          '${DateTime.now().millisecondsSinceEpoch}_${pickedFile.name}';
      final storagePath = 'reports/$fileName';

      await Supabase.instance.client.storage
          .from('pregnancy-reports')
          .upload(storagePath, file);

      final publicUrl = Supabase.instance.client.storage
          .from('pregnancy-reports')
          .getPublicUrl(storagePath);

      await Supabase.instance.client.from('pregnancy_request').insert({
        'patient_id': widget.patientId,
        'report_image': publicUrl,
      });

      setState(() {
        isUploading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pregnancy request submitted successfully.'),
        ),
      );

      _fetchPregnancyHistory();
    } catch (e) {
      setState(() {
        isUploading = false;
      });

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
    }
  }

  @override
  Widget build(BuildContext context) {
    List<Map<String, dynamic>> filteredRecords = pregnancyRecords.where((
      record,
    ) {
      if (selectedFilter == 'All') return true;
      return record['pregnancy_no'].toString() == selectedFilter;
    }).toList();

    bool hasActivePregnancy = pregnancyRecords.any(
      (record) =>
          record['pregnancy_status']?.toString().toUpperCase() == 'ACTIVE',
    );

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(_t(context, 'pregnancy_history_title')),
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: isLoading || isUploading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: primaryColor),
                  if (isUploading) ...[
                    const SizedBox(height: 12),
                    const Text('Uploading report, please wait...'),
                  ],
                ],
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTopSection(context),
                  const SizedBox(height: 20),
                  _buildFilterSection(context),
                  const SizedBox(height: 20),
                  Expanded(
                    child: filteredRecords.isEmpty
                        ? Center(
                            child: Text(_t(context, 'no_pregnancy_records')),
                          )
                        : ListView.builder(
                            itemCount: filteredRecords.length,
                            itemBuilder: (context, index) {
                              return _buildPregnancyCard(
                                filteredRecords[index],
                              );
                            },
                          ),
                  ),
                  if (!hasActivePregnancy) ...[
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 2,
                        ),
                        onPressed: _uploadReportAndAddNewPregnancy,
                        icon: const Icon(Icons.add_circle_outline, size: 22),
                        label: const Text(
                          'Add New Pregnancy (Upload Report)',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildTopSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: primaryColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _t(context, 'patient_name_label'),
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.patientName,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                  softWrap: true,
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _t(context, 'total_pregnancies_label'),
                style: TextStyle(color: Colors.grey[600], fontSize: 12),
              ),
              const SizedBox(height: 4),
              Text(
                '${pregnancyRecords.length}',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterSection(BuildContext context) {
    List<String> options = ['All'];
    options.addAll(pregnancyRecords.map((e) => e['pregnancy_no'].toString()));

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          _t(context, 'select_pregnancy_label'),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey[300]!),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: selectedFilter,
              icon: const Icon(Icons.keyboard_arrow_down),
              items: options.toSet().map((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(
                    value == 'All'
                        ? _t(context, 'all_records_option')
                        : '${_t(context, 'pregnancy_no_prefix')} $value',
                  ),
                );
              }).toList(),
              onChanged: (newValue) {
                setState(() {
                  selectedFilter = newValue!;
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPregnancyCard(Map<String, dynamic> record) {
    String status = record['pregnancy_status'] ?? 'UNKNOWN';
    bool isActive = status.toUpperCase() == 'ACTIVE';
    Color statusColor = _getStatusColor(status);
    int pregnancyId = record['pregnancy_id'];

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // මෙතැනට Expanded දැමීමෙන් සිංහල අකුරු දිග වැඩි වූ විට සිදුවන Overflow ගැටළුව විසඳේ
                Expanded(
                  child: Text(
                    '${_t(context, 'pregnancy_no_prefix')} ${record['pregnancy_no']}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Chip(
                  label: Text(
                    status.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  backgroundColor: statusColor,
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildInfoColumn(
                    _t(context, 'registration_date_label'),
                    record['registration_date']?.toString(),
                  ),
                ),
                Expanded(
                  child: _buildInfoColumn(
                    _t(context, 'mother_register_no_label'),
                    record['pregnant_mother_register_number']?.toString(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // View Details Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isActive ? primaryColor : Colors.white,
                  foregroundColor: isActive ? Colors.white : primaryColor,
                  side: BorderSide(color: primaryColor),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () {
                  if (isActive) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            ObstetricHistoryPage(pregnancyId: pregnancyId),
                      ),
                    );
                  } else {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            PastPregnancyDetailsPage(pregnancyId: pregnancyId),
                      ),
                    );
                  }
                },
                child: Text(
                  isActive
                      ? _t(context, 'view_current_pregnancy')
                      : _t(context, 'view_details'),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 10),

            // Baby Details Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.child_friendly_rounded),
                label: Text(
                  _t(context, 'view_baby_details'),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFCE4EC),
                  foregroundColor: primaryColor,
                  side: BorderSide(color: primaryColor),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          BabyDetailsViewPage(pregnancyId: pregnancyId),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoColumn(String label, String? value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
        const SizedBox(height: 4),
        Text(
          (value == null || value.isEmpty || value == 'null') ? '-' : value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }
}
