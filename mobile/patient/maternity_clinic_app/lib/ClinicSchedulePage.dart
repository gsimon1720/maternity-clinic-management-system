import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'localization/app_localizations.dart';

class ClinicSchedulePage extends StatefulWidget {
  const ClinicSchedulePage({super.key});

  @override
  State<ClinicSchedulePage> createState() => _ClinicSchedulePageState();
}

class _ClinicSchedulePageState extends State<ClinicSchedulePage> {
  DateTime? lmpDate;

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  // මාතෘ හා ළමා සෞඛ්‍ය මාර්ගෝපදේශයට (Guideline) අනුව නිවැරදි සති පරාසයන්
  final List<Map<String, dynamic>> schedule = [
    {"visit": "Clinic Visit 1", "weeks": 6, "weekRange": "සති 6 - 8"},
    {"visit": "Clinic Visit 2", "weeks": 12, "weekRange": "සති 12 - 14"},
    {"visit": "Clinic Visit 3", "weeks": 18, "weekRange": "සති 18 - 20"},
    {"visit": "Clinic Visit 4", "weeks": 22, "weekRange": "සති 22 - 24"},
    {"visit": "Clinic Visit 5", "weeks": 26, "weekRange": "සති 26 - 28"},
    {"visit": "Clinic Visit 6", "weeks": 32, "weekRange": "සති 32 - 34"},
    {"visit": "Clinic Visit 7", "weeks": 36, "weekRange": "සති 36"},
    {"visit": "Clinic Visit 8", "weeks": 38, "weekRange": "සති 38"},
    {"visit": "Clinic Visit 9", "weeks": 40, "weekRange": "සති 40"},
  ];

  @override
  void initState() {
    super.initState();
    _initNotificationsAndLoadData();
  }

  // 1. Initialize Notifications, Permission Request & Load Saved LMP
  Future<void> _initNotificationsAndLoadData() async {
    tz.initializeTimeZones();

    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings initializationSettingsDarwin =
        DarwinInitializationSettings(
          requestSoundPermission: true,
          requestBadgePermission: true,
          requestAlertPermission: true,
        );

    const InitializationSettings initializationSettings =
        InitializationSettings(
          android: initializationSettingsAndroid,
          iOS: initializationSettingsDarwin,
        );

    await _notificationsPlugin.initialize(initializationSettings);

    // Android 13+ Notification Permission Request
    await _notificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.requestNotificationsPermission();

    // App එක open කළ සැණින් save කරපු LMP එක load කර Reminders re-schedule කිරීම
    await _loadSavedLmpDate();
  }

  // Local Memory එකෙන් LMP Load කර Reminders Re-schedule කිරීම
  Future<void> _loadSavedLmpDate() async {
    final prefs = await SharedPreferences.getInstance();
    final String? savedDateString = prefs.getString('saved_lmp_date');

    if (savedDateString != null) {
      final savedDate = DateTime.parse(savedDateString);

      setState(() {
        lmpDate = savedDate;
      });

      // Saved LMP එකෙන් Reminders නැවත Schedule කිරීම
      await _scheduleAllClinicReminders(savedDate);
    }
  }

  // LMP එක Local Memory එකේ Save කිරීම
  Future<void> _saveLmpDate(DateTime date) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('saved_lmp_date', date.toIso8601String());
  }

  // 2. Reminders Schedule කරන Function එක
  Future<void> _scheduleAllClinicReminders(DateTime selectedLmp) async {
    await _notificationsPlugin.cancelAll();

    for (int i = 0; i < schedule.length; i++) {
      final visit = schedule[i];
      final DateTime visitDate = selectedLmp.add(
        Duration(days: visit['weeks'] * 7),
      );

      // Reminder එක අදාළ දිනයේ උදෑසන 8:00 ට set කිරීම
      final DateTime reminderDateTime = DateTime(
        visitDate.year,
        visitDate.month,
        visitDate.day,
        8,
        0,
      );
      if (reminderDateTime.isAfter(DateTime.now())) {
        await _notificationsPlugin.zonedSchedule(
          i,
          "Clinic Visit Reminder",
          "Your ${visit['visit']} (${visit['weekRange']}) is scheduled today. Please attend your clinic.",
          tz.TZDateTime.from(reminderDateTime, tz.local),
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'clinic_reminders_channel',
              'Clinic Reminders',
              channelDescription: 'Notifications for upcoming clinic visits',
              importance: Importance.max,
              priority: Priority.high,
            ),
            iOS: DarwinNotificationDetails(),
          ),
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        );
        ;
      }
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: lmpDate ?? DateTime.now(),
      firstDate: DateTime(2023),
      lastDate: DateTime.now(),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: Color(0xFFF48FB1)),
        ),
        child: child!,
      ),
    );

    if (picked != null) {
      setState(() => lmpDate = picked);
      // LMP එක Save කර Notifications Schedule කිරීම
      await _saveLmpDate(picked);
      await _scheduleAllClinicReminders(picked);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("LMP saved & Clinic reminders scheduled!"),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 1. පසුබිම් රූපය
          Positioned.fill(
            child: Image.asset('assets/date.jpg', fit: BoxFit.cover),
          ),

          // 2. Blur ආචරණය
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
              child: Container(color: Colors.black.withOpacity(0.4)),
            ),
          ),

          // 3. අන්තර්ගතය
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Text(
                    AppLocalizations.of(context)!.translate("clinic_schedule"),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      shadows: [Shadow(color: Colors.black45, blurRadius: 10)],
                    ),
                  ),
                ),

                // LMP බොත්තම
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    decoration: const BoxDecoration(
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 10,
                          offset: Offset(0, 5),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.95),
                        minimumSize: const Size(double.infinity, 55),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      onPressed: () => _selectDate(context),
                      icon: const Icon(
                        Icons.calendar_month,
                        color: Color(0xFFF48FB1),
                      ),
                      label: Text(
                        lmpDate == null
                            ? AppLocalizations.of(
                                context,
                              )!.translate("select_lmp_date")
                            : "LMP: ${DateFormat('yyyy-MM-dd').format(lmpDate!)}",
                        style: const TextStyle(
                          color: Color(0xFFF48FB1),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // ලැයිස්තුව
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: schedule.length,
                    itemBuilder: (context, index) {
                      if (lmpDate == null) return const SizedBox.shrink();
                      DateTime visitDate = lmpDate!.add(
                        Duration(days: schedule[index]['weeks'] * 7),
                      );

                      return Container(
                        margin: const EdgeInsets.only(bottom: 15),
                        decoration: const BoxDecoration(
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 8,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Card(
                          color: Colors.white.withOpacity(0.9),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: const Color(
                                0xFFF48FB1,
                              ).withOpacity(0.2),
                              child: Text(
                                "${index + 1}",
                                style: const TextStyle(
                                  color: Color(0xFFF48FB1),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              schedule[index]['visit'],
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            // මෙහි සති පරාසය (Week Range) සහ අදාළ දිනය පෙන්වයි
                            subtitle: Text(
                              "(${schedule[index]['weekRange']})\n${AppLocalizations.of(context)!.translate("due_date")}: ${DateFormat('yyyy-MM-dd').format(visitDate)}",
                            ),
                            isThreeLine: true,
                            trailing: const Icon(
                              Icons.notifications_active_outlined,
                              color: Color(0xFFF48FB1),
                              size: 20,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
