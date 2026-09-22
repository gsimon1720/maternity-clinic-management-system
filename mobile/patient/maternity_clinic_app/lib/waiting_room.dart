import 'package:flutter/material.dart';

class WaitingRoomScreen extends StatelessWidget {
  final String lang; // 'si' හෝ 'en' අනුව භාෂාව තෝරා ගැනීමට

  const WaitingRoomScreen({super.key, this.lang = 'si'});

  @override
  Widget build(BuildContext context) {
    bool isSinhala = lang == 'si';

    return Scaffold(
      backgroundColor: const Color(0xFFFFF1F3),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 🌸 ලස්සන රෝස පාට ඇනිමේෂන් අයිකන් එකක්
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF48FB1).withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.hourglass_empty_rounded,
                  size: 80,
                  color: Color(0xFFE91E63),
                ),
              ),
              const SizedBox(height: 30),

              // 📝 ප්‍රධාන මාතෘකාව
              Text(
                isSinhala
                    ? "ඔබේ ගිණුම තවමත් පරීක්ෂණ මට්ටමේ පවතී"
                    : "Account Under Review",
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF880E4F),
                ),
              ),
              const SizedBox(height: 15),

              // ℹ️ විස්තරය
              Text(
                isSinhala
                    ? "පවුලේ සෞඛ්‍ය සේවා නිලධාරිනිය (Midwife) විසින් ඔබේ තොරතුරු තහවුරු කර ගිණුම අනුමත (Approve) කළ පසු ඔබට මෙම ඇප් එක භාවිත කළ හැක. කරුණාකර පසුව නැවත උත්සාහ කරන්න."
                    : "Your account is waiting for approval from the Area Midwife. Once approved, you will get full access to your Maternal Health Dashboard.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade700,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 40),

              // 🔄 නැවත පරීක්ෂා කිරීමේ බොත්තම
              SizedBox(
                width: 200,
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFF48FB1),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  onPressed: () {
                    // කෙලින්ම නැවත ලොගින් පිටුවට රීලෝඩ් කිරීම
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  icon: const Icon(Icons.refresh_rounded),
                  label: Text(isSinhala ? "නැවත උත්සාහ කරන්න" : "Check Again"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
