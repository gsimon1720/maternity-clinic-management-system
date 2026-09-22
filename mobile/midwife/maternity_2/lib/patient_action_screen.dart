import 'package:flutter/material.dart';
import 'pre_conception_form.dart';
import 'pnc_visit_form.dart';

class PatientActionScreen extends StatelessWidget {
  final Map<String, dynamic> patientData;

  const PatientActionScreen({super.key, required this.patientData});

  @override
  Widget build(BuildContext context) {
    final patientName = '${patientData['first_name']} ${patientData['last_name'] ?? ''}';
    final patientId = patientData['patient_id'];

    return Scaffold(
      appBar: AppBar(title: Text(patientName)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Select an action for $patientName',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              
              // BUTTON 1: Post Pregnancy -> pre_conception_assessment
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue.shade300),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PreConceptionForm(patientId: patientId),
                      ),
                    );
                  },
                  child: const Text('PRENATAL', style: TextStyle(color: Colors.white, fontSize: 18)),
                ),
              ),
              
              const SizedBox(height: 20),
              
              // BUTTON 2: Pre Birth -> pnc_visits
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.pink.shade300),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PncVisitForm(patientId: patientId),
                      ),
                    );
                  },
                  child: const Text('POSTNATAL', style: TextStyle(color: Colors.white, fontSize: 18)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}