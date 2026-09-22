class Validators {
  static String? name(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "Name required";
    }
    if (value.trim().length < 3) return "Too short";
    return null;
  }

  static String? nic(String? value) {
    if (value == null || value.trim().isEmpty) return "NIC required";

    final oldNic = RegExp(r'^\d{9}[vVxX]$');
    final newNic = RegExp(r'^\d{12}$');

    if (!oldNic.hasMatch(value) && !newNic.hasMatch(value)) {
      return "Invalid NIC";
    }
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) return "Phone required";
    if (!RegExp(r'^07[0-9]{8}$').hasMatch(value)) {
      return "Invalid phone";
    }
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return "Email required";
    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
      return "Invalid email";
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return "Password required";
    if (value.length < 6) return "Min 6 chars";
    return null;
  }

  static String? confirmPassword(String pass, String? confirm) {
    if (confirm == null || confirm.isEmpty) return "Required";
    if (pass != confirm) return "Not match";
    return null;
  }
}
