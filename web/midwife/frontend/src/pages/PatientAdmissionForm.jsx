import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PatientAdmissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    first_name: '',//
    nic: '',//
    email: '',//
    contact_number: '',//
    address: '',//

    blood_group: '',//
    bmi: '',
    height_cm: '',
    allergies: '',//
    antenatal_risk_conditions: '',

    emergency_contact_name: '',//
    emergency_contact_phone: '',//
    emergency_contact_address: '',//

    spouse_name: '',//
    spouse_age: '',//

    pregnant_mother_register_date: '',
    grama_niladhari_division: '',//
    phm_area: '',
    moh_area: '',// hamotama boralla
    phm_phone: '',
    moh_phone: '',
    visit_zone: ''
  });

  // FETCH PATIENT
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patients/${id}`);
        setFormData(prev => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/patients/${id}`,
        formData
      );

      alert('Patient successfully activated!');
      navigate('/pending');

    } catch (err) {
      console.error(err);
      alert('Failed to update patient');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading patient data...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Patient Admission Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ================= PERSONAL DETAILS ================= */}
        <section>
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Personal Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              name="first_name"
              placeholder="Full Name"
              value={formData.first_name}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              name="nic"
              placeholder="NIC Number"
              value={formData.nic}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="contact_number"
              placeholder="Phone Number"
              value={formData.contact_number}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="border p-2 rounded md:col-span-2"
            />
          </div>
        </section>

        {/* ================= MEDICAL INFO ================= */}
        <section>
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Medical Information
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <select
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">Blood Group</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>

            <input
              name="height_cm"
              placeholder="Height (cm)"
              value={formData.height_cm}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="bmi"
              placeholder="BMI"
              value={formData.bmi}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="allergies"
              placeholder="Allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="border p-2 rounded md:col-span-3"
            />

            <input
              name="antenatal_risk_conditions"
              placeholder="Risk Conditions"
              value={formData.antenatal_risk_conditions}
              onChange={handleChange}
              className="border p-2 rounded md:col-span-3"
            />
          </div>
        </section>

        {/* ================= EMERGENCY ================= */}
        <section>
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Emergency & Family
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <input
              name="spouse_name"
              placeholder="Spouse Name"
              value={formData.spouse_name}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="spouse_age"
              placeholder="Spouse Age"
              value={formData.spouse_age}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="emergency_contact_name"
              placeholder="Emergency Contact Name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="emergency_contact_phone"
              placeholder="Emergency Phone"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="emergency_contact_address"
              placeholder="Emergency Address"
              value={formData.emergency_contact_address}
              onChange={handleChange}
              className="border p-2 rounded md:col-span-2"
            />
          </div>
        </section>

        {/* ================= GEOGRAPHY ================= */}
        <section>
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            Administrative & Zone Info
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              type="date"
              name="pregnant_mother_register_date"
              value={formData.pregnant_mother_register_date}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="grama_niladhari_division"
              placeholder="GN Division"
              value={formData.grama_niladhari_division}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <select
  name="visit_zone"
  value={formData.visit_zone}
  onChange={handleChange}
  className="border p-2 rounded"
>
  <option value="">Select Zone</option>

  {/* A ZONES */}
  <option value="A1">A1 - Borella Junction / Cotta Road</option>
  <option value="A2">A2 - Castle Street / Narahenpita Border</option>
  <option value="A3">A3 - Campbell Park Area</option>

  {/* B ZONES */}
  <option value="B1">B1 - Dematagoda Junction</option>
  <option value="B2">B2 - Armour Street Area</option>
  <option value="B3">B3 - Gunasinghapura</option>

  {/* C ZONES */}
  <option value="C1">C1 - Maradana Station</option>
  <option value="C2">C2 - Panchikawatta</option>
  <option value="C3">C3 - Wolfendhal Street</option>

  {/* D ZONES */}
  <option value="D1">D1 - Narahenpita Junction</option>
  <option value="D2">D2 - Asiri Hospital Area</option>
  <option value="D3">D3 - Elvitigala Mawatha</option>

  {/* E ZONES */}
  <option value="E1">E1 - Obeysekarapura</option>
  <option value="E2">E2 - Welikada</option>
  <option value="E3">E3 - Nawala Border</option>

  {/* F ZONES */}
  <option value="F1">F1 - Cotta Road Upper</option>
  <option value="F2">F2 - Kynsey Road</option>
  <option value="F3">F3 - Bullers Road</option>

  {/* G ZONES */}
  <option value="G1">G1 - Cemetery Road</option>
  <option value="G2">G2 - Thimbirigasyaya Border</option>
  <option value="G3">G3 - Jawatta Road</option>
</select>

            <input
              name="phm_area"
              placeholder="PHM Area"
              value={formData.phm_area}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="moh_area"
              placeholder="MOH Area"
              value={formData.moh_area}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="phm_phone"
              placeholder="PHM Phone"
              value={formData.phm_phone}
              onChange={handleChange}
              className="border p-2 rounded"
            />

            <input
              name="moh_phone"
              placeholder="MOH Phone"
              value={formData.moh_phone}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
        </section>

        {/* ================= SUBMIT ================= */}
        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-3 rounded font-bold hover:bg-pink-700"
        >
          Activate Patient
        </button>

      </form>
    </div>
  );
}