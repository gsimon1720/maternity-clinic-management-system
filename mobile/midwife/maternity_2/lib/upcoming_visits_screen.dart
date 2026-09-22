import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class UpcomingVisitsScreen extends StatefulWidget {
  final int midwifeId;

  const UpcomingVisitsScreen({super.key, required this.midwifeId});

  @override
  State<UpcomingVisitsScreen> createState() => _UpcomingVisitsScreenState();
}

class _UpcomingVisitsScreenState extends State<UpcomingVisitsScreen> {
  final _supabase = Supabase.instance.client;

  final Color primaryPink = const Color(0xfff48fb1);
  final Color bgSoftPink = const Color(0xFFF9F0F4);
  final Color textDark = const Color(0xff2D3142);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgSoftPink,
      appBar: AppBar(
        title: const Text(
          "Next Visit Reminders",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: textDark,
        elevation: 0,
        centerTitle: true,
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        // 🚀 Joins patient -> pregnancy -> pnc_visits
        future: _supabase
            .from('patient')
            .select('''
              patient_id,
              first_name,
              last_name,
              pregnancy (
                pregnancy_id,
                pregnancy_no,
                pnc_visits (
                  pnc_id,
                  next_clinic_date,
                  visit_date,
                  created_at
                )
              )
            ''')
            .eq('assigned_midwife_id', widget.midwifeId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator(color: primaryPink));
          }

          if (snapshot.hasError) {
            return Center(child: Text("Error fetching visits: ${snapshot.error}"));
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Text(
                "No assigned patients found.",
                style: TextStyle(color: textDark.withOpacity(0.7), fontSize: 16),
              ),
            );
          }

          final patientsData = snapshot.data!;
          final List<Map<String, dynamic>> scheduledVisitsList = [];

          // Extract each patient's latest PNC next_clinic_date
          for (final patient in patientsData) {
            final firstName = patient['first_name']?.toString() ?? '';
            final lastName = patient['last_name']?.toString() ?? '';
            final fullName = '$firstName $lastName'.trim();
            final displayName = fullName.isNotEmpty ? fullName : 'Unknown Patient';

            final pregnancies = patient['pregnancy'] as List<dynamic>? ?? [];

            for (final preg in pregnancies) {
              final pregNo = preg['pregnancy_no']?.toString() ?? 'N/A';
              final pncVisits = preg['pnc_visits'] as List<dynamic>? ?? [];

              // Filter for visits with a next_clinic_date filled
              final validVisits = pncVisits.where((v) =>
                v['next_clinic_date'] != null &&
                v['next_clinic_date'].toString().trim().isNotEmpty
              ).toList();

              if (validVisits.isNotEmpty) {
                // Sort by created_at descending to get the most recent PNC form entry
                validVisits.sort((a, b) {
                  final aCreated = DateTime.tryParse(a['created_at']?.toString() ?? '') ?? DateTime(1970);
                  final bCreated = DateTime.tryParse(b['created_at']?.toString() ?? '') ?? DateTime(1970);
                  return bCreated.compareTo(aCreated);
                });

                final latestPnc = validVisits.first;

                scheduledVisitsList.add({
                  'patientName': displayName,
                  'patientId': patient['patient_id'],
                  'pregnancyNo': pregNo,
                  'nextClinicDate': latestPnc['next_clinic_date'],
                  'lastVisitDate': latestPnc['visit_date'],
                });
              }
            }
          }

          if (scheduledVisitsList.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_note_rounded, size: 64, color: primaryPink.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  Text(
                    "No next clinic dates recorded yet.",
                    style: TextStyle(fontSize: 16, color: textDark.withOpacity(0.7)),
                  ),
                ],
              ),
            );
          }

          // Sort scheduled visits chronologically (earliest upcoming date first)
          scheduledVisitsList.sort((a, b) {
            final dateA = DateTime.tryParse(a['nextClinicDate'] ?? '') ?? DateTime(2099);
            final dateB = DateTime.tryParse(b['nextClinicDate'] ?? '') ?? DateTime(2099);
            return dateA.compareTo(dateB);
          });

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: scheduledVisitsList.length,
            itemBuilder: (context, index) {
              final item = scheduledVisitsList[index];

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: primaryPink.withOpacity(0.08),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: primaryPink.withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.calendar_month_rounded, color: primaryPink, size: 28),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['patientName'],
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: textDark,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "Preg No: ${item['pregnancyNo']} | Patient ID: ${item['patientId']}",
                              style: TextStyle(
                                fontSize: 13,
                                color: textDark.withOpacity(0.6),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Icon(Icons.event_available_rounded, size: 16, color: primaryPink),
                                const SizedBox(width: 4),
                                Text(
                                  "Next Clinic Date: ${item['nextClinicDate']}",
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: primaryPink,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}