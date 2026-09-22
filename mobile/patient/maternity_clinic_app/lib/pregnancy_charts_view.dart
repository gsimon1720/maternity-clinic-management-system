import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ClinicCareRecord {
  final double poa;
  final double weight;
  final double fundalHeight;

  ClinicCareRecord({
    required this.poa,
    required this.weight,
    required this.fundalHeight,
  });

  factory ClinicCareRecord.fromJson(Map<String, dynamic> json) {
    String rawPoa = json['poa']?.toString() ?? '0';
    RegExp regExp = RegExp(r'^\d+(\.\d+)?');
    String parsedPoaStr = regExp.stringMatch(rawPoa) ?? '0';

    return ClinicCareRecord(
      poa: double.tryParse(parsedPoaStr) ?? 0.0,
      weight: double.tryParse(json['weight']?.toString() ?? '0') ?? 0.0,
      fundalHeight:
          double.tryParse(json['fundal_height']?.toString() ?? '0') ?? 0.0,
    );
  }
}

class StandardMaternityChartsPage extends StatefulWidget {
  const StandardMaternityChartsPage({super.key});

  @override
  State<StandardMaternityChartsPage> createState() =>
      _StandardMaternityChartsPageState();
}

class _StandardMaternityChartsPageState
    extends State<StandardMaternityChartsPage> {
  late Future<List<ClinicCareRecord>> _clinicDataFuture;

  // Pink Theme Colors (#F48FB1 based)
  final Color primaryPink = const Color(0xFFF48FB1);
  final Color darkPink = const Color(0xFFC2185B);
  final Color lightPink = const Color(0xFFFCE4EC);

  @override
  void initState() {
    super.initState();
    _clinicDataFuture = fetchClinicCareData();
  }

  Future<List<ClinicCareRecord>> fetchClinicCareData() async {
    final supabase = Supabase.instance.client;
    final currentUser = supabase.auth.currentUser;

    if (currentUser == null) throw Exception("User not logged in!");

    final userRecord = await supabase
        .from('users')
        .select('user_id')
        .eq('email', currentUser.email ?? '')
        .maybeSingle();

    final dynamic dbUserId = userRecord != null
        ? userRecord['user_id']
        : currentUser.id;

    final patientResponse = await supabase
        .from('patient')
        .select('patient_id')
        .eq('user_id', dbUserId)
        .maybeSingle();

    if (patientResponse == null) throw Exception("Patient record not found.");

    final pregnancyResponse = await supabase
        .from('pregnancy')
        .select('pregnancy_id')
        .eq('patient_id', patientResponse['patient_id'])
        .eq('pregnancy_status', 'ACTIVE')
        .order('created_at', ascending: false)
        .maybeSingle();

    if (pregnancyResponse == null)
      throw Exception("Active pregnancy not found.");

    // clinic_care එකෙන් data ලබාගැනීම
    final recordsResponse = await supabase
        .from('clinic_care')
        .select()
        .eq('pregnancy_id', pregnancyResponse['pregnancy_id']);

    final List<dynamic> dataList = recordsResponse as List<dynamic>;

    final List<ClinicCareRecord> records = dataList
        .map((item) => ClinicCareRecord.fromJson(item))
        .where((r) => r.poa > 0)
        .toList();

    records.sort((a, b) => a.poa.compareTo(b.poa));
    return records;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Maternal Weight Gain & SFH Chart"),
        backgroundColor: primaryPink,
        foregroundColor: Colors.white,
        elevation: 1,
      ),
      body: FutureBuilder<List<ClinicCareRecord>>(
        future: _clinicDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator(color: primaryPink));
          }
          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }

          final records = snapshot.data ?? [];
          final double initialWeight = records.isNotEmpty
              ? records.first.weight
              : 0.0;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              children: [
                // 1. Top Table Summary (Card එකේ උඩම තියෙන කොටස)
                _buildTopSummaryTable(records, initialWeight),
                const SizedBox(height: 20),

                // 2. Weight Gain Chart (A-F Standard Reference Lines එක්ක)
                _buildWeightGainChart(records, initialWeight),
                const SizedBox(height: 25),

                // 3. SFH Chart (Standard Upper/Lower Reference Lines එක්ක)
                _buildSFHChart(records),
              ],
            ),
          );
        },
      ),
    );
  }

  // Card එකේ උඩම තියෙන Data Table එක
  Widget _buildTopSummaryTable(
    List<ClinicCareRecord> records,
    double initialWeight,
  ) {
    return Container(
      decoration: BoxDecoration(border: Border.all(color: primaryPink)),
      child: Table(
        border: TableBorder.all(color: primaryPink, width: 1),
        children: [
          TableRow(
            decoration: BoxDecoration(color: lightPink),
            children: [
              Padding(
                padding: const EdgeInsets.all(4.0),
                child: Text(
                  "ගැබ් සති ගණන / POA",
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: darkPink,
                  ),
                ),
              ),
              ...records
                  .take(7)
                  .map(
                    (r) => Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Text(
                        "${r.poa.toInt()}",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: darkPink,
                        ),
                      ),
                    ),
                  ),
            ],
          ),
          TableRow(
            children: [
              const Padding(
                padding: EdgeInsets.all(4.0),
                child: Text(
                  "බර / Weight (kg)",
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              ...records
                  .take(7)
                  .map(
                    (r) => Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Text(
                        "${r.weight}",
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 10),
                      ),
                    ),
                  ),
            ],
          ),
          TableRow(
            children: [
              const Padding(
                padding: EdgeInsets.all(4.0),
                child: Text(
                  "බරෙහි වැඩිවීම / Gain",
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              ...records.take(7).map((r) {
                double gain = r.weight - initialWeight;
                return Padding(
                  padding: const EdgeInsets.all(4.0),
                  child: Text(
                    "${gain >= 0 ? '+' : ''}${gain.toStringAsFixed(1)}",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: gain >= 0 ? darkPink : Colors.red,
                    ),
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  // Weight Gain Chart Widget
  Widget _buildWeightGainChart(
    List<ClinicCareRecord> records,
    double initialWeight,
  ) {
    List<FlSpot> weightGainSpots = records
        .map((r) => FlSpot(r.poa, r.weight - initialWeight))
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "බර වැඩිවීම / Weight Gain Chart",
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
            color: darkPink,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: 300,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(border: Border.all(color: primaryPink)),
          child: LineChart(
            LineChartData(
              minX: 0,
              maxX: 42,
              minY: -2,
              maxY: 18,
              gridData: FlGridData(
                show: true,
                horizontalInterval: 2,
                verticalInterval: 2,
                getDrawingHorizontalLine: (value) =>
                    FlLine(color: primaryPink.withOpacity(0.2), strokeWidth: 1),
                getDrawingVerticalLine: (value) =>
                    FlLine(color: primaryPink.withOpacity(0.2), strokeWidth: 1),
              ),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    interval: 4,
                    getTitlesWidget: (v, m) => Text(
                      "${v.toInt()}",
                      style: TextStyle(fontSize: 9, color: darkPink),
                    ),
                  ),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    interval: 2,
                    getTitlesWidget: (v, m) => Text(
                      "${v.toInt()}",
                      style: TextStyle(fontSize: 9, color: darkPink),
                    ),
                  ),
                ),
              ),
              lineBarsData: [
                // Standard Reference Curve (Category A/B/C Guide Lines)
                LineChartBarData(
                  spots: const [
                    FlSpot(0, 0),
                    FlSpot(16, 1.5),
                    FlSpot(28, 9),
                    FlSpot(40, 15),
                  ],
                  isCurved: true,
                  color: primaryPink.withOpacity(0.5),
                  barWidth: 1.5,
                  dashArray: [4, 4],
                  dotData: const FlDotData(show: false),
                ),
                LineChartBarData(
                  spots: const [
                    FlSpot(0, 0),
                    FlSpot(16, 0.5),
                    FlSpot(28, 4),
                    FlSpot(40, 7),
                  ],
                  isCurved: true,
                  color: primaryPink.withOpacity(0.5),
                  barWidth: 1.5,
                  dashArray: [4, 4],
                  dotData: const FlDotData(show: false),
                ),
                // Patient's Actual Real Data Line (Dark Line)
                LineChartBarData(
                  spots: weightGainSpots,
                  isCurved: false,
                  color: darkPink,
                  barWidth: 3,
                  dotData: FlDotData(
                    show: true,
                    getDotPainter: (spot, percent, barData, index) =>
                        FlDotCirclePainter(
                          radius: 4,
                          color: darkPink,
                          strokeWidth: 1,
                          strokeColor: Colors.white,
                        ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // SFH Chart Widget
  Widget _buildSFHChart(List<ClinicCareRecord> records) {
    List<FlSpot> sfhSpots = records
        .where((r) => r.fundalHeight > 0)
        .map((r) => FlSpot(r.poa, r.fundalHeight))
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "ගර්භාෂයේ උස සටහන / SFH Chart",
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 14,
            color: darkPink,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: 320,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(border: Border.all(color: primaryPink)),
          child: LineChart(
            LineChartData(
              minX: 12,
              maxX: 40,
              minY: 10,
              maxY: 45,
              gridData: FlGridData(
                show: true,
                horizontalInterval: 5,
                verticalInterval: 4,
                getDrawingHorizontalLine: (value) =>
                    FlLine(color: primaryPink.withOpacity(0.2), strokeWidth: 1),
                getDrawingVerticalLine: (value) =>
                    FlLine(color: primaryPink.withOpacity(0.2), strokeWidth: 1),
              ),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    interval: 4,
                    getTitlesWidget: (v, m) => Text(
                      "${v.toInt()}",
                      style: TextStyle(fontSize: 9, color: darkPink),
                    ),
                  ),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    interval: 5,
                    getTitlesWidget: (v, m) => Text(
                      "${v.toInt()}",
                      style: TextStyle(fontSize: 9, color: darkPink),
                    ),
                  ),
                ),
              ),
              lineBarsData: [
                // Maternity Card Standard Upper Bound Line
                LineChartBarData(
                  spots: const [
                    FlSpot(12, 16),
                    FlSpot(24, 28),
                    FlSpot(36, 37),
                    FlSpot(40, 42),
                  ],
                  color: primaryPink,
                  barWidth: 1.5,
                  dashArray: [4, 4],
                  dotData: const FlDotData(show: false),
                ),
                // Maternity Card Standard Lower Bound Line
                LineChartBarData(
                  spots: const [
                    FlSpot(12, 12),
                    FlSpot(24, 22),
                    FlSpot(36, 32),
                    FlSpot(40, 37),
                  ],
                  color: primaryPink,
                  barWidth: 1.5,
                  dashArray: [4, 4],
                  dotData: const FlDotData(show: false),
                ),
                // Patient's Real SFH Data Line
                LineChartBarData(
                  spots: sfhSpots,
                  isCurved: false,
                  color: darkPink,
                  barWidth: 3,
                  dotData: FlDotData(
                    show: true,
                    getDotPainter: (spot, percent, barData, index) =>
                        FlDotCirclePainter(
                          radius: 4,
                          color: darkPink,
                          strokeWidth: 1,
                          strokeColor: Colors.white,
                        ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
