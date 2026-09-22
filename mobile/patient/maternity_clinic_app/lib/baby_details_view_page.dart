import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

class BabyDetailsViewPage extends StatefulWidget {
  final int pregnancyId; // Dashboard එකෙන් ලැබෙන pregnancy_id එක

  const BabyDetailsViewPage({super.key, required this.pregnancyId});

  @override
  State<BabyDetailsViewPage> createState() => _BabyDetailsViewPageState();
}

class _BabyDetailsViewPageState extends State<BabyDetailsViewPage> {
  final supabase = Supabase.instance.client;
  bool isLoading = true;
  List<Map<String, dynamic>> babiesList = [];
  int? pregnancyNo;
  String? pregnancyStatus;

  @override
  void initState() {
    super.initState();
    fetchBabyDataFromSupabase();
  }

  // Supabase එකෙන් ඩේටා ආරක්ෂිතව සහ සමාන්තරව (Parallel) ලබාගැනීම
  Future<void> fetchBabyDataFromSupabase() async {
    setState(() {
      isLoading = true;
      babiesList = [];
      pregnancyNo = null;
      pregnancyStatus = null;
    });

    try {
      final results = await Future.wait([
        supabase
            .from('pregnancy_babies')
            .select()
            .eq('pregnancy_id', widget.pregnancyId)
            .order('baby_number'),

        supabase
            .from('pregnancy')
            .select('pregnancy_no, pregnancy_status')
            .eq('pregnancy_id', widget.pregnancyId)
            .maybeSingle(),
      ]);

      final babyData = results[0] as List;
      final pregnancyData = results[1] as Map<String, dynamic>?;

      if (mounted) {
        setState(() {
          if (babyData.isNotEmpty) {
            babiesList = babyData
                .map((e) => Map<String, dynamic>.from(e))
                .toList();
          }
          if (pregnancyData != null) {
            pregnancyNo = pregnancyData['pregnancy_no'];
            pregnancyStatus = pregnancyData['pregnancy_status']?.toString();
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching baby data: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('දත්ත ලබාගැනීමේ දෝෂයක් සිදු විය.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  // Date format කිරීමේ function එක
  String formatDate(dynamic date) {
    if (date == null || date.toString().isEmpty) return '-';
    try {
      return DateFormat('dd MMM yyyy').format(DateTime.parse(date.toString()));
    } catch (e) {
      return date.toString();
    }
  }

  // Pregnancy Status එකට අදාළ Color එක ලබාදෙන function එක
  Color _getPregnancyStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return Colors.green;
      case 'COMPLETED':
        return Colors.blue;
      case 'CLOSED':
        return Colors.grey;
      default:
        return Colors.black87;
    }
  }

  // Baby Birth Status එකට අදාළ Color එක ලබාදෙන function එක
  Color _getBabyStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'ALIVE':
        return Colors.green;
      case 'STILLBIRTH':
        return Colors.red;
      case 'DECEASED':
        return Colors.grey;
      default:
        return Colors.black87;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Baby Details',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFFF48FB1), // Pink Theme
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFF48FB1)),
              ),
            )
          : RefreshIndicator(
              color: const Color(0xFFF48FB1),
              onRefresh: fetchBabyDataFromSupabase,
              child: babiesList.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(
                          height: MediaQuery.of(context).size.height * 0.7,
                          child: const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.child_friendly,
                                  size: 70,
                                  color: Colors.grey,
                                ),
                                SizedBox(height: 12),
                                Text(
                                  'No baby details available',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    )
                  : ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16.0),
                      children: [
                        // Summary Card
                        Card(
                          elevation: 2,
                          color: const Color(0xFFFFF0F5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: const BorderSide(
                              color: Color(0xFFF48FB1),
                              width: 0.5,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Pregnancy Summary',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFD81B60),
                                  ),
                                ),
                                const Divider(height: 16, thickness: 1),
                                _buildSummaryRow(
                                  'Pregnancy No',
                                  pregnancyNo?.toString() ?? '-',
                                ),
                                _buildSummaryRow(
                                  'Number of Babies',
                                  babiesList.length.toString(),
                                ),
                                _buildSummaryRow(
                                  'Delivery Date',
                                  formatDate(babiesList.first['birth_date']),
                                ),
                                if (pregnancyStatus != null &&
                                    pregnancyStatus!.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 2.0,
                                    ),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Expanded(
                                          flex: 2,
                                          child: Text(
                                            'Status',
                                            style: TextStyle(
                                              color: Colors.black54,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          flex: 3,
                                          child: Text(
                                            pregnancyStatus!,
                                            textAlign: TextAlign.end,
                                            style: TextStyle(
                                              color: _getPregnancyStatusColor(
                                                pregnancyStatus,
                                              ),
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Babies List Cards
                        ...babiesList.map((baby) {
                          final babyNumber =
                              baby['baby_number']?.toString() ?? '1';
                          final gender = baby['gender']?.toString() ?? '-';
                          final birthDate = formatDate(baby['birth_date']);
                          final birthTime =
                              baby['birth_time']?.toString() ?? '-';

                          final birthWeight =
                              baby['birth_weight']?.toString() ?? '-';
                          final formattedWeight = birthWeight == '-'
                              ? '-'
                              : '$birthWeight kg';

                          final birthLength =
                              baby['birth_length']?.toString() ?? '-';
                          final formattedLength = birthLength == '-'
                              ? '-'
                              : '$birthLength cm';

                          final birthStatus =
                              baby['birth_status']?.toString() ?? '-';

                          return Card(
                            elevation: 3,
                            margin: const EdgeInsets.only(bottom: 16.0),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Text(
                                        '👶',
                                        style: TextStyle(fontSize: 22),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Baby $babyNumber',
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFFD81B60),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 20, thickness: 1),

                                  _buildDetailRow('Gender', gender),
                                  _buildDetailRow('Birth Date', birthDate),
                                  _buildDetailRow('Birth Time', birthTime),
                                  _buildDetailRow(
                                    'Birth Weight',
                                    formattedWeight,
                                  ),
                                  _buildDetailRow(
                                    'Birth Length',
                                    formattedLength,
                                  ),

                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 4.0,
                                    ),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Expanded(
                                          flex: 2,
                                          child: Text(
                                            'Birth Status',
                                            style: TextStyle(
                                              color: Colors.grey,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          flex: 3,
                                          child: Text(
                                            birthStatus,
                                            textAlign: TextAlign.end,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: _getBabyStatusColor(
                                                birthStatus,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
            ),
    );
  }

  // Detail Row Helper method
  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.grey,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Summary Row Helper method
  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.black54,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(
                color: Colors.black87,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
