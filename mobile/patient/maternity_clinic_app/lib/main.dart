import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'login_screen.dart'; // මුලින්ම ලොගින් පිටුව පෙන්වීමට
import 'package:flutter_localizations/flutter_localizations.dart';
import 'localization/app_localizations.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 🔴 Supabase Initialization (ඔයාගේ URL සහ Key එකමයි තියෙන්නේ)
  await Supabase.initialize(
    url: 'https://swfgrhrupcpggtwycalm.supabase.co',
    anonKey: 'sb_publishable_aHvkPlB4NzsYs5mgLgw09Q_x_yXgO8N',
  );

  runApp(const MyApp());
}

// 1. MyApp එක StatefulWidget එකක් බවට පත් කරා
class MyApp extends StatefulWidget {
  const MyApp({super.key});

  // 🔴 LoginScreen එකේ ඉඳන් MyApp.setLocale(context, ...) කියලා call කරද්දී
  // error එකක් එන්නේ නැත්තේ මෙන්න මේ static method එක නිසා තමයි.
  static void setLocale(BuildContext context, Locale newLocale) {
    _MyAppState? state = context.findAncestorStateOfType<_MyAppState>();
    state?.changeLanguage(newLocale);
  }

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  // 🌍 Default භාෂාව මුලින්ම 'en' (English) විදිහට සෙට් කරා.
  // ඒ නිසා ඇප් එක open වෙද්දීම English වලින් open වෙන්නේ.
  Locale _locale = const Locale('en');

  // ලොගින් screen එකේ බටන් එක එබුවම මේක run වෙලා මුළු ඇප් එකම සිංහල/ඉංග්‍රීසි වලට මාරු කරනවා
  void changeLanguage(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Blossom Clinic',

      // 🌍 Dynamic Locale එක (මෙතනට තමයි වෙනස් වෙන භාෂාව සෙට් වෙන්නේ)
      locale: _locale,

      // 🌍 Supported Locales
      supportedLocales: const [
        Locale('en'), // English
        Locale('si'), // Sinhala
        Locale('ta'), // Tamil
      ],

      // 🌍 Localization delegates
      localizationsDelegates: const [
        AppLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],

      // 🎨 App Theme
      theme: ThemeData(
        primaryColor: const Color(0xFFF48FB1),
        scaffoldBackgroundColor: const Color(0xFFFFF1F3),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFFE91E63),
          secondary: Color(0xFFF48FB1),
        ),
      ),

      // ඇප් එක පටන් ගද්දීම කෙලින්ම ලොගින් පිටුවට යයි
      home: const LoginScreen(),
    );
  }
}
