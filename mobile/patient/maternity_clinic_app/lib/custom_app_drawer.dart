import 'package:flutter/material.dart';
import 'localization/app_localizations.dart';
import 'main.dart';
import 'patient_profile.dart';
import 'ClinicSchedulePage.dart';
import 'patient_history_form.dart'; // ඔයා save කරපු file නමට අදාළව මෙය වෙනස් කරන්න
import 'medical_history_view_page.dart';
import 'pregnancy_history_page.dart';
import 'next_clinic_date.dart';
// ඔබේ file එකේ නමට අනුව මෙය වෙනස් කරගන්න

class CustomAppDrawer extends StatelessWidget {
  final int patientId;
  final String patientName;

  const CustomAppDrawer({
    super.key,
    required this.patientId,
    required this.patientName,
  });

  @override
  Widget build(BuildContext context) {
    // 🎨 අපගේ මෘදු රෝස පැහැති වර්ණය
    const Color primaryPink = Color(0xFFF48FB1);

    return Drawer(
      child: Column(
        children: [
          // 🌸 Header Section (UserAccountsDrawerHeader එක වෙනුවට වඩාත් පාලනය කළ හැකි DrawerHeader එකක් දැම්මා)
          DrawerHeader(
            decoration: const BoxDecoration(color: primaryPink),
            margin: EdgeInsets.zero, // Drawer එකේ හිස්තැන් ඉවත් කිරීමට
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // 🤰 රවුම් හැඩැති මව් රූපයේ අයිකනය
                  const CircleAvatar(
                    backgroundColor: Colors.white,
                    radius: 30,
                    child: Icon(
                      Icons.pregnant_woman,
                      color: primaryPink,
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // 📝 ඇප් එකේ නම (දැන් 100% සිංහල / ඉංග්‍රීසි වෙනස් වෙනවා)
                  Text(
                    AppLocalizations.of(context)!.translate("app_name"),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),

                  // 📝 උපසිරැසිය (Maternity Care System / මව්කිරි සහ ප්‍රසූති සත්කාර පද්ධතිය)
                  Text(
                    AppLocalizations.of(context)!.translate("drawer_subtitle"),
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),

          // 📜 Scrollable Menu Items
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                // 🏠 DASHBOARD
                ListTile(
                  leading: const Icon(
                    Icons.dashboard_rounded,
                    color: Color(0xFFF48FB1),
                  ),
                  title: Text(
                    AppLocalizations.of(context)!.translate("dashboard"),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                  },
                ),

                // 👤 MY PROFILE
                ListTile(
                  leading: const Icon(
                    Icons.person_rounded,
                    color: Color(0xFFF48FB1),
                  ),
                  title: Text(
                    AppLocalizations.of(context)!.translate("profile"),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const PatientProfilePage(),
                      ),
                    );
                  },
                ),

                // 📅 CLINIC DATES
                ListTile(
                  leading: const Icon(
                    Icons.calendar_month_rounded,
                    color: Color(
                      0xFFF48FB1,
                    ), // මෙහිද එම රෝස පැහැයම භාවිතා කරන්න
                  ),
                  title: Text(
                    AppLocalizations.of(context)!.translate("clinic_dates"),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  onTap: () {
                    // පළමුව Drawer එක වසා දමන්න
                    Navigator.pop(context);

                    // පසුව ClinicSchedulePage වෙත පරිශීලකයා යොමු කරන්න
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ClinicSchedulePage(),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(
                    Icons.calendar_month_rounded,
                    color: Color(
                      0xFFF48FB1,
                    ), // මෙහිද එම රෝස පැහැයම භාවිතා කරන්න
                  ),
                  title: Text(
                    AppLocalizations.of(context)!.translate("clinic_dates"),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  onTap: () {
                    // පළමුව Drawer එක වසා දමන්න
                    Navigator.pop(context);

                    // පසුව ClinicSchedulePage වෙත පරිශීලකයා යොමු කරන්න
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const NextVisitDate  (),
                      ),
                    );
                  },
                ),
                // 📋 PATIENT HISTORY
                // 👨‍👩‍👧 FAMILY HISTORY
                ListTile(
                  leading: const Icon(
                    Icons.family_restroom,
                    color: Color(0xFFF48FB1),
                  ),

                  title: Text(
                    AppLocalizations.of(context)!.translate("Family History"),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),

                  onTap: () {
                    Navigator.pop(context);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            PatientHistoryForm(patientId: patientId),
                      ),
                    );
                  },
                ),

                // 🏥 MEDICAL HISTORY
                ListTile(
                  leading: const Icon(
                    Icons.medical_information_rounded,
                    color: Color(0xFFF48FB1),
                  ),

                  title: Text(
                    AppLocalizations.of(context)!.translate("Medical History"),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),

                  onTap: () {
                    Navigator.pop(context);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            MedicalHistoryViewPage(patientId: patientId),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(
                    Icons.pregnant_woman_rounded,
                    color: Color(0xFFF48FB1),
                  ),
                  title: Text(
                    AppLocalizations.of(
                      context,
                    )!.translate("Pregnancy History"),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  onTap: () {
                    Navigator.pop(context);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PregnancyHistoryPage(
                          patientId: patientId,
                          patientName: patientName,
                        ),
                      ),
                    );
                  },
                ),
                // 👶 BABY DETAILS

                // ⚙️ SETTINGS
              ],
            ),
          ),

          // 🔄 පහළ කොටස (Language Toggle සහ Logout බොත්තම්)
          const Divider(height: 1),

          // 🌍 LANGUAGE TOGGLE MENU ITEM
          ListTile(
            leading: const Icon(Icons.g_translate_rounded, color: primaryPink),
            title: Text(
              Localizations.localeOf(context).languageCode == 'en'
                  ? "සිංහල භාෂාවට මාරු වන්න"
                  : "Switch to English Language",
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
                color: Colors.black87,
              ),
            ),
            onTap: () {
              Locale currentLocale = Localizations.localeOf(context);
              if (currentLocale.languageCode == 'en') {
                MyApp.setLocale(context, const Locale('si'));
              } else {
                MyApp.setLocale(context, const Locale('en'));
              }
              Navigator.pop(context);
            },
          ),

          const Divider(height: 1),

          // 🚪 LOGOUT BUTTON
          ListTile(
            leading: const Icon(Icons.logout_rounded, color: Colors.redAccent),
            title: Text(
              AppLocalizations.of(context)!.translate("logout"),
              style: const TextStyle(
                color: Colors.redAccent,
                fontWeight: FontWeight.bold,
              ),
            ),
            onTap: () {
              Navigator.pop(context);
            },
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
