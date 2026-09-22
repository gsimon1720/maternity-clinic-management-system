import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PregnancyVisitsListPage extends StatefulWidget {
  final int patientId;

  const PregnancyVisitsListPage({super.key, required this.patientId});

  @override
  State<PregnancyVisitsListPage> createState() =>
      _PregnancyVisitsListPageState();
}

class _PregnancyVisitsListPageState extends State<PregnancyVisitsListPage> {
  final Color primaryPink = const Color(0xFFF48FB1);
  bool isLoading = true;
  List<Map<String, dynamic>> visitList = [];
  int? deliveredPregnancyId;

  @override
  void initState() {
    super.initState();
    _fetchAllVisitsByPregnancyId();
  }

  /// Patient ID එක මඟින් අදාළ DELIVERED pregnancy එක සොයාගෙන, PNC Visits Fetch කරයි
  Future<void> _fetchAllVisitsByPregnancyId() async {
    try {
      setState(() {
        isLoading = true;
      });

      // Find delivered pregnancy of patient
      final pregnancyResponse = await Supabase.instance.client
          .from('pregnancy')
          .select('pregnancy_id')
          .eq('patient_id', widget.patientId)
          .eq('pregnancy_status', 'DELIVERED')
          .order('delivery_date', ascending: false)
          .limit(1)
          .maybeSingle();

      if (pregnancyResponse == null) {
        if (mounted) {
          setState(() {
            visitList = [];
            isLoading = false;
          });
        }
        return;
      }

      deliveredPregnancyId = pregnancyResponse['pregnancy_id'];

      // Fetch PNC visits using delivered pregnancy id
      final response = await Supabase.instance.client
          .from('pnc_visits')
          .select()
          .eq('pregnancy_id', deliveredPregnancyId!)
          .order('visit_date', ascending: false);

      if (mounted) {
        setState(() {
          visitList = List<Map<String, dynamic>>.from(response);
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: Text(
          deliveredPregnancyId != null
              ? "PNC Visits (Pregnancy #$deliveredPregnancyId)"
              : "PNC Visits",
        ),
        backgroundColor: primaryPink,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : visitList.isEmpty
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  "මෙම Patient ID එක සඳහා Delivery වාර්තා වී නැත නැතහොත් PNC Visits කිසිවක් හමු නොවීය.",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
              ),
            )
          : RefreshIndicator(
              onRefresh: _fetchAllVisitsByPregnancyId,
              child: ListView.builder(
                padding: const EdgeInsets.all(16.0),
                itemCount: visitList.length,
                itemBuilder: (context, index) {
                  final visit = visitList[index];
                  return _buildVisitCard(visit);
                },
              ),
            ),
    );
  }

  /// එක Visit එකක් වෙනුවෙන් නිර්මාණය වන Card එක
  Widget _buildVisitCard(Map<String, dynamic> visit) {
    final String visitDate =
        visit['visit_date']?.toString().split('T')[0] ?? 'N/A';
    final String visitType = visit['visit_type']?.toString() ?? 'General Visit';
    final String temp = visit['mother_temp']?.toString() ?? 'N/A';
    final String childFever = visit['child_fever']?.toString() ?? 'NO';

    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => PNCVisitDetailPage(visitData: visit),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      visitType,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: primaryPink,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: primaryPink.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      visitDate,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: primaryPink,
                      ),
                    ),
                  ),
                ],
              ),
              const Divider(height: 20),
              Row(
                children: [
                  Expanded(
                    child: _buildQuickInfo(
                      Icons.thermostat,
                      "Mother Temp",
                      temp,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: _buildQuickInfo(
                      Icons.child_care,
                      "Child Fever",
                      childFever,
                      isWarning: childFever.toUpperCase() == 'YES',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    "View Full Details",
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickInfo(
    IconData icon,
    String label,
    String value, {
    bool isWarning = false,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 18,
          color: isWarning ? Colors.red : Colors.grey.shade600,
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: Colors.grey),
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isWarning ? Colors.red : Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Single Visit Detail Page (View-Only)
// ---------------------------------------------------------------------------
class PNCVisitDetailPage extends StatelessWidget {
  final Map<String, dynamic> visitData;

  PNCVisitDetailPage({super.key, required this.visitData});

  final Color primaryPink = const Color(0xFFF48FB1);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("PNC Details"),
        backgroundColor: primaryPink,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildReadOnlyField(
              "Visit Type",
              visitData['visit_type']?.toString() ?? 'N/A',
            ),
            _buildReadOnlyField(
              "Visit Date",
              visitData['visit_date']?.toString().split('T')[0] ?? 'N/A',
            ),
            const Divider(height: 24),
            _buildReadOnlyField(
              "Mother Temperature",
              visitData['mother_temp']?.toString() ?? 'N/A',
            ),
            _buildReadOnlyField(
              "Mother Anemia Status",
              visitData['mother_anemia']?.toString() ?? 'N/A',
            ),
            _buildReadOnlyField(
              "Child Fever Status",
              visitData['child_fever']?.toString() ?? 'N/A',
            ),
            _buildReadOnlyField(
              "Infant Care Education",
              visitData['infant_care_edu']?.toString() ?? 'N/A',
              maxLines: 2,
            ),
            _buildReadOnlyField(
              "Other Remarks",
              visitData['other_remarks']?.toString() ?? 'N/A',
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReadOnlyField(String label, String value, {int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        initialValue: value,
        enabled: false,
        maxLines: maxLines,
        style: const TextStyle(color: Colors.black87),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.black54),
          filled: true,
          fillColor: Colors.grey.shade200,
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
        ),
      ),
    );
  }
}
