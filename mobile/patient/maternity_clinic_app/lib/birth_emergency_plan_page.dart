import 'package:flutter/material.dart';
import 'localization/app_localizations.dart'; // ඔබගේ ලොකේෂන් ෆයිල් එක ඉම්පෝට් කර ඇත

// 1. Birth Plan Model Class
class BirthPlanModel {
  final int birthPlanId;
  final int pregnancyId;
  final String planDate;
  final String intendedDeliveryFacility;
  final String emergencyTransportMode;
  final String birthCompanionName;
  final String supportPhone;
  final String bloodDonorName;
  final String bloodDonorPhone;
  final String emergencyFundsArranged;

  BirthPlanModel({
    required this.birthPlanId,
    required this.pregnancyId,
    required this.planDate,
    required this.intendedDeliveryFacility,
    required this.emergencyTransportMode,
    required this.birthCompanionName,
    required this.supportPhone,
    required this.bloodDonorName,
    required this.bloodDonorPhone,
    required this.emergencyFundsArranged,
  });

  factory BirthPlanModel.fromJson(Map<String, dynamic> json) {
    return BirthPlanModel(
      birthPlanId: json['birth_plan_id'] ?? 0,
      pregnancyId: json['pregnancy_id'] ?? 0,
      planDate: json['plan_date'] ?? '',
      intendedDeliveryFacility: json['intended_delivery_facility'] ?? '',
      emergencyTransportMode: json['emergency_transport_mode'] ?? '',
      birthCompanionName: json['birth_companion_name'] ?? '',
      supportPhone: json['support_phone'] ?? '',
      bloodDonorName: json['blood_donor_name'] ?? '',
      bloodDonorPhone: json['blood_donor_phone'] ?? '',
      emergencyFundsArranged: json['emergency_funds_arranged'] ?? '',
    );
  }
}

// 2. Page Widget
class BirthEmergencyPlanPage extends StatelessWidget {
  final BirthPlanModel? birthPlan;

  const BirthEmergencyPlanPage({super.key, this.birthPlan});

  // පරිවර්තන ලබා ගැනීමට පහසු ක්‍රමයක් (Helper method)
  String getLocalizedText(BuildContext context, String key) {
    return AppLocalizations.of(context)?.translate(key) ?? key;
  }

  Widget buildPlanCard(
    BuildContext context,
    String title,
    String deliveryInfo,
    String emergencyInfo,
    IconData icon,
    Color color,
  ) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: BorderSide(color: Colors.grey.shade200, width: 1.5),
      ),
      margin: const EdgeInsets.only(bottom: 15),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: color,
                  ),
                ),
              ],
            ),
            const Divider(height: 20),
            IntrinsicHeight(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          getLocalizedText(context, 'planned_details'),
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          deliveryInfo.isEmpty
                              ? getLocalizedText(context, 'not_specified')
                              : deliveryInfo,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                  VerticalDivider(
                    width: 1,
                    color: Colors.grey.shade200,
                    thickness: 1,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          getLocalizedText(context, 'emergency_support'),
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.redAccent,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          emergencyInfo.isEmpty
                              ? getLocalizedText(context, 'not_specified')
                              : emergencyInfo,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // ඩේටා නැති නම් පෙන්වීමට ඩිෆල්ට් අගයන්
    final plan =
        birthPlan ??
        BirthPlanModel(
          birthPlanId: 0,
          pregnancyId: 0,
          planDate: '',
          intendedDeliveryFacility: 'Castle Street Hospital',
          emergencyTransportMode: '1990 Suwa Seriya',
          birthCompanionName: 'Husband',
          supportPhone: '0712345678',
          bloodDonorName: 'John Doe',
          bloodDonorPhone: '0771234567',
          emergencyFundsArranged: 'LKR 15,000',
        );

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(
          getLocalizedText(context, 'app_title'),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 🏥 රෝහල
            buildPlanCard(
              context,
              getLocalizedText(context, 'hospital_title'),
              plan.intendedDeliveryFacility,
              "General Hospital Colombo (Backup)",
              Icons.local_hospital_rounded,
              const Color(0xFFC2185B),
            ),

            // 🚗 වාහනය
            buildPlanCard(
              context,
              getLocalizedText(context, 'transport_title'),
              plan.emergencyTransportMode,
              "Private Car / Family",
              Icons.directions_car_rounded,
              Colors.blue.shade700,
            ),

            // 👥 සහායකයා සහ දුරකථනය
            buildPlanCard(
              context,
              getLocalizedText(context, 'companion_title'),
              "${plan.birthCompanionName}\n(${plan.supportPhone})",
              getLocalizedText(context, 'companion_emergency'),
              Icons.people_rounded,
              Colors.purple.shade700,
            ),

            // 🩸 රුධිර දායකයා
            buildPlanCard(
              context,
              getLocalizedText(context, 'blood_donor_title'),
              "${plan.bloodDonorName}\n(${plan.bloodDonorPhone})",
              getLocalizedText(context, 'blood_donor_emergency'),
              Icons.bloodtype_rounded,
              Colors.red.shade700,
            ),

            // 💰 හදිසි අරමුදල්
            buildPlanCard(
              context,
              getLocalizedText(context, 'funds_title'),
              plan.emergencyFundsArranged,
              getLocalizedText(context, 'funds_delivery'),
              Icons.monetization_on_rounded,
              Colors.green.shade700,
            ),

            const SizedBox(height: 10),

            // 💡 උපදෙස් කාඩ්පත
            Card(
              color: Colors.pink.shade50.withOpacity(0.5),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.pink.shade100),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.lightbulb_rounded,
                      color: Colors.amber,
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        getLocalizedText(context, 'advice_text'),
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF880E4F),
                          height: 1.4,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
