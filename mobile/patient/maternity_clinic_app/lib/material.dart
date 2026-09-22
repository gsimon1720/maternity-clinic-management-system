import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Patient Profile',
      theme: ThemeData(
        primaryColor: const Color(0xFFF48FB1),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFF48FB1)),
        useMaterial3: true,
      ),
      home: const PatientProfileForm(),
    );
  }
}

class PatientProfileForm extends StatefulWidget {
  const PatientProfileForm({super.key});

  @override
  State<PatientProfileForm> createState() => _PatientProfileFormState();
}

class _PatientProfileFormState extends State<PatientProfileForm> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Patient Profile Form',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFFF48FB1),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Center(
                child: Text(
                  'Antenatal & Maternal Health Record (MOH / PHM)',
                  style: TextStyle(
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                    color: Colors.grey,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              _buildSectionTitle(
                '1. Patient Personal Information (පුද්ගලික තොරතුරු)',
              ),

              _buildTextField('Name of the Patient', Icons.person),
              _buildTextField(
                'Patient\'s Age',
                Icons.calendar_today,
                keyboardType: TextInputType.number,
              ),
              _buildTextField('Blood Group', Icons.bloodtype),

              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      'Height (cm)',
                      Icons.height,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField(
                      'BMI',
                      Icons.monitor_weight,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),

              _buildTextField('Allergies', Icons.warning_amber),
              _buildTextField('Patient\'s Address', Icons.home, maxLines: 2),
              _buildTextField(
                'Patient\'s Telephone Number',
                Icons.phone,
                keyboardType: TextInputType.phone,
              ),

              const SizedBox(height: 30),

              // BUTTONS
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton(
                    onPressed: () {
                      _formKey.currentState!.reset();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey[300],
                    ),
                    child: const Text(
                      'Clear',
                      style: TextStyle(color: Colors.black),
                    ),
                  ),
                  const SizedBox(width: 15),

                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        showDialog(
                          context: context,
                          builder: (_) => AlertDialog(
                            title: const Text("Success"),
                            content: const Text(
                              "Patient profile saved successfully.",
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context),
                                child: const Text("OK"),
                              ),
                            ],
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF48FB1),
                    ),
                    child: const Text(
                      'Save Profile',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // SECTION TITLE
  Widget _buildSectionTitle(String title) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 25, bottom: 15),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFFCE4EC),
        borderRadius: BorderRadius.circular(5),
        border: const Border(
          left: BorderSide(color: Color(0xFFF48FB1), width: 5),
        ),
      ),
      child: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          color: Color(0xFFC2185B),
          fontSize: 15,
        ),
      ),
    );
  }

  // TEXT FIELD
  Widget _buildTextField(
    String label,
    IconData icon, {
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        keyboardType: keyboardType,
        maxLines: maxLines,
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return "$label is required";
          }
          return null;
        },
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: const Color(0xFFF48FB1)),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Color(0xFFF48FB1), width: 2),
          ),
        ),
      ),
    );
  }
}
