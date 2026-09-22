import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// 1. IMPORT YOUR FUNCTION HERE (Adjust the path as needed)
import { getLoggedUser } from '../utils/auth'; // Example path

// --- STANDARD REFERENCE CURVES ---
// Approximated from the provided image for curves A through F
const weightGainReference = [
  { poa: 0,  A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
  { poa: 12, A: 1.5, B: 1.2, C: 1.0, D: 0.8, E: 0.6, F: 0.4 },
  { poa: 16, A: 3.5, B: 2.5, C: 2.0, D: 1.5, E: 1.0, F: 0.5 },
  { poa: 20, A: 6.0, B: 4.5, C: 3.5, D: 2.5, E: 1.8, F: 1.0 },
  { poa: 24, A: 8.5, B: 6.5, C: 5.5, D: 4.0, E: 3.0, F: 2.0 },
  { poa: 28, A: 11.0, B: 8.5, C: 7.5, D: 5.5, E: 4.0, F: 3.0 },
  { poa: 32, A: 13.0, B: 10.5, C: 9.0, D: 7.0, E: 5.5, F: 4.0 },
  { poa: 36, A: 15.0, B: 12.5, C: 11.0, D: 9.0, E: 7.0, F: 5.0 },
  { poa: 40, A: 17.0, B: 14.5, C: 12.5, D: 11.0, E: 8.5, F: 6.5 },
  { poa: 42, A: 18.0, B: 15.5, C: 13.5, D: 12.0, E: 9.5, F: 7.5 },
];

// Approximated upper and lower normal limits for Fundal Height
const fundalHeightReference = [
  { poa: 14, upper: 18.5, lower: 13.5 },
  { poa: 16, upper: 20.5, lower: 15.5 },
  { poa: 20, upper: 24.5, lower: 19.5 },
  { poa: 24, upper: 28.5, lower: 23.5 },
  { poa: 28, upper: 32.5, lower: 27.5 },
  { poa: 32, upper: 36.5, lower: 31.5 },
  { poa: 36, upper: 39.5, lower: 34.5 },
  { poa: 40, upper: 42.5, lower: 37.5 },
  { poa: 42, upper: 44.5, lower: 39.5 },
];

export default function ClinicCareView() {
  const { pregnancyId } = useParams();

  // 2. USE YOUR FUNCTION TO GET THE USER
  const storedUser = getLoggedUser() || {};
  const currentFullName = storedUser.full_name || "";
  const currentRole = storedUser.role || "";

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const [formData, setFormData] = useState({
    visit_date: "",
    poa: "",
    weight: "",
    bp_systolic: "",
    bp_diastolic: "",
    urine_sugar: "",
    urine_albumin: "",
    pallor: "",
    oedema_ankle: "",
    oedema_facial: "",
    fundal_height: "",
    foetal_lie: "",
    presentation: "",
    engagement: "",
    fm: "",
    fhs: "",
    iron: "",
    folate: "",
    calcium: "",
    vitamin_c: "",
    food_supplementation: "",
    officer_signature: currentFullName, 
    designation: currentRole
  });

  const fetchVisits = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/clinic-care/${pregnancyId}`
      );

      const dataArray = Array.isArray(res.data)
        ? res.data
        : (res.data ? [res.data] : []);

      setVisits(dataArray.slice(0, 10));
    } catch (err) {
      console.error("Error retrieving clinic visits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [pregnancyId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/clinic-care",
        {
          pregnancy_id: pregnancyId,
          ...formData
        }
      );

      alert("Clinic visit saved successfully");

      setFormData({
        visit_date: "",
        poa: "",
        weight: "",
        bp_systolic: "",
        bp_diastolic: "",
        urine_sugar: "",
        urine_albumin: "",
        pallor: "",
        oedema_ankle: "",
        oedema_facial: "",
        fundal_height: "",
        foetal_lie: "",
        presentation: "",
        engagement: "",
        fm: "",
        fhs: "",
        iron: "",
        folate: "",
        calcium: "",
        vitamin_c: "",
        food_supplementation: "",
        officer_signature: currentFullName, 
        designation: currentRole
      });

      fetchVisits();
    } catch (err) {
      console.error("Error saving clinic visit:", err);
      alert("Failed to save clinic visit");
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(
      expandedIndex === index ? null : index
    );
  };

  // PREPARE DATA FOR CHARTS
  const chartData = useMemo(() => {
    const sortedVisits = [...visits]
      .filter(v => v.poa) 
      .sort((a, b) => Number(a.poa) - Number(b.poa));

    // Get the initial weight to calculate weight gain (like in the physical chart)
    const firstWeight = sortedVisits.find(v => v.weight)?.weight;

    return sortedVisits.map(v => {
      const w = Number(v.weight);
      return {
        poa: Number(v.poa),
        weightGain: (w && firstWeight) ? Number((w - firstWeight).toFixed(2)) : null,
        fundalHeight: Number(v.fundal_height) || null
      };
    });
  }, [visits]);

  if (loading) {
    return (
      <div className="p-8 text-center text-pink-600 font-bold text-lg">
        Loading Antenatal Records...
      </div>
    );
  }

  const inputClass =
    "border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-pink-300 bg-white";
  
  const readOnlyClass = 
    "border border-gray-300 rounded-lg px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed";

  const labelClass =
    "text-sm font-semibold text-gray-600";

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="border-b border-pink-200 pb-4">
        <h2 className="text-3xl font-extrabold text-pink-950">
          Antenatal Care
        </h2>
        <p className="text-pink-700 mt-2">
          Add new clinic visit details and view previous records.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow border p-6 space-y-6"
      >
        <h3 className="text-xl font-bold text-pink-900">
          Add New Clinic Visit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Visit Date</label>
            <input
              type="date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>POA (Weeks)</label>
            <input
              name="poa"
              type="number"
              placeholder="Example: 24"
              value={formData.poa}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input
              name="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>BP Systolic</label>
            <input
              name="bp_systolic"
              type="number"
              placeholder="Example: 120"
              value={formData.bp_systolic}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>BP Diastolic</label>
            <input
              name="bp_diastolic"
              type="number"
              placeholder="Example: 80"
              value={formData.bp_diastolic}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Urine Sugar</label>
            <select
              name="urine_sugar"
              value={formData.urine_sugar}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Negative">Negative</option>
              <option value="Trace">Trace</option>
              <option value="+">+</option>
              <option value="++">++</option>
              <option value="+++">+++</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Urine Albumin</label>
            <select
              name="urine_albumin"
              value={formData.urine_albumin}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Negative">Negative</option>
              <option value="Trace">Trace</option>
              <option value="+">+</option>
              <option value="++">++</option>
              <option value="+++">+++</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Pallor</label>
            <select
              name="pallor"
              value={formData.pallor}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Absent">Absent</option>
              <option value="Present">Present</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Ankle Oedema</label>
            <select
              name="oedema_ankle"
              value={formData.oedema_ankle}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Absent">Absent</option>
              <option value="Present">Present</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Facial Oedema</label>
            <select
              name="oedema_facial"
              value={formData.oedema_facial}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Absent">Absent</option>
              <option value="Present">Present</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Fundal Height (cm)</label>
            <input
              name="fundal_height"
              type="number"
              step="0.1"
              value={formData.fundal_height}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Foetal Lie</label>
            <select
              name="foetal_lie"
              value={formData.foetal_lie}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Longitudinal">Longitudinal</option>
              <option value="Transverse">Transverse</option>
              <option value="Oblique">Oblique</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Presentation</label>
            <select
              name="presentation"
              value={formData.presentation}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Cephalic">Cephalic</option>
              <option value="Breech">Breech</option>
              <option value="Shoulder">Shoulder</option>
              <option value="Face/Brow">Face/Brow</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Engagement</label>
            <select
              name="engagement"
              value={formData.engagement}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Not Engaged">Not Engaged</option>
              <option value="Engaged">Engaged</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Fetal Movement (FM)</label>
            <select
              name="fm"
              value={formData.fm}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Reduced">Reduced</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>FHS (bpm)</label>
            <input
              name="fhs"
              type="number"
              value={formData.fhs}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Iron Supplement</label>
            <select
              name="iron"
              value={formData.iron}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Issued">Issued</option>
              <option value="Not Issued">Not Issued</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Folate Supplement</label>
            <select
              name="folate"
              value={formData.folate}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Issued">Issued</option>
              <option value="Not Issued">Not Issued</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Calcium Supplement</label>
            <select
              name="calcium"
              value={formData.calcium}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Issued">Issued</option>
              <option value="Not Issued">Not Issued</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Vitamin C</label>
            <select
              name="vitamin_c"
              value={formData.vitamin_c}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Issued">Issued</option>
              <option value="Not Issued">Not Issued</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Food Supplementation</label>
            <select
              name="food_supplementation"
              value={formData.food_supplementation}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Officer Signature</label>
            <input
              name="officer_signature"
              value={formData.officer_signature}
              readOnly
              className={readOnlyClass}
            />
          </div>

          <div>
            <label className={labelClass}>Designation</label>
            <input
              name="designation"
              value={formData.designation}
              readOnly
              className={readOnlyClass}
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700"
        >
          Save Clinic Visit
        </button>
      </form>

      {/* --- CHARTS SECTION --- */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-2xl shadow border p-6">
          
          {/* Chart 1: Weight Gain Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pink-900 text-center">Weight Gain Progression</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="poa" 
                    type="number" 
                    domain={[0, 42]} 
                    ticks={[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 42]} 
                    label={{ value: 'POA (Weeks)', position: 'insideBottomRight', offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: 'Weight Gain (kg)', angle: -90, position: 'insideLeft' }} 
                    domain={[0, 18]}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36}/>
                  
                  {/* Reference Curves (A through F) */}
                  <Line data={weightGainReference} dataKey="A" stroke="#9ca3af" strokeWidth={1} dot={false} activeDot={false} legendType="none" name="Curve A" />
                  <Line data={weightGainReference} dataKey="B" stroke="#9ca3af" strokeWidth={1} dot={false} activeDot={false} legendType="none" name="Curve B" />
                  <Line data={weightGainReference} dataKey="C" stroke="#9ca3af" strokeWidth={1} dot={false} activeDot={false} legendType="none" name="Curve C" />
                  <Line data={weightGainReference} dataKey="D" stroke="#9ca3af" strokeWidth={1} dot={false} activeDot={false} legendType="none" name="Curve D" />
                  <Line data={weightGainReference} dataKey="E" stroke="#9ca3af" strokeWidth={1} dot={false} activeDot={false} legendType="none" name="Curve E" />
                  <Line data={weightGainReference} dataKey="F" stroke="#9ca3af" strokeWidth={1} dot={false} activeDot={false} legendType="none" name="Curve F" />

                  {/* Patient Data */}
                  <Line 
                    data={chartData} 
                    type="monotone" 
                    dataKey="weightGain" 
                    stroke="#db2777" 
                    strokeWidth={3} 
                    name="Patient Weight Gain (kg)"
                    connectNulls 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center">Calculated from first recorded weight</p>
          </div>

          {/* Chart 2: Fundal Height Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pink-900 text-center">Fundal Height</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="poa" 
                    type="number" 
                    domain={[0, 42]} 
                    ticks={[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 42]} 
                    label={{ value: 'POA (Weeks)', position: 'insideBottomRight', offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: 'Fundal Height (cm)', angle: -90, position: 'insideLeft' }} 
                    domain={[0, 45]}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36}/>

                  {/* Reference Curves */}
                  <Line data={fundalHeightReference} dataKey="upper" stroke="#9ca3af" strokeWidth={1.5} dot={false} activeDot={false} name="Upper Limit" />
                  <Line data={fundalHeightReference} dataKey="lower" stroke="#9ca3af" strokeWidth={1.5} dot={false} activeDot={false} name="Lower Limit" />

                  {/* Patient Data */}
                  <Line 
                    data={chartData}
                    type="monotone" 
                    dataKey="fundalHeight" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    name="Fundal Height (cm)"
                    connectNulls 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-pink-200 pb-3">
        <h3 className="text-2xl font-extrabold text-pink-950">
          Antenatal Care History
        </h3>
        <p className="text-pink-700 mt-2">
          Previous clinic visits
        </p>
      </div>

      <div className="space-y-5">
        {visits.length > 0 ? (
          visits.map((v, index) => {
            const isOpen = expandedIndex === index;
            return (
              <div
                key={v.clinic_care_id || index}
                className={`border rounded-2xl bg-white shadow-sm overflow-hidden ${
                  isOpen ? "border-pink-300 ring-2 ring-pink-100" : "border-gray-200"
                }`}
              >
                <div
                  onClick={() => toggleExpand(index)}
                  className={`p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer ${
                    isOpen ? "bg-pink-50" : "bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-8">
                    <div>
                      <span className="text-sm text-gray-500 font-semibold">Date</span>
                      <div className="text-lg font-extrabold">
                        {v.visit_date ? new Date(v.visit_date).toLocaleDateString() : "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 font-semibold">POA</span>
                      <div>
                        <span className="bg-pink-200 text-pink-950 px-3 py-1 rounded-md font-bold">
                          {v.poa || "-"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 font-semibold">Weight</span>
                      <div className="text-lg font-bold">
                        {v.weight ? v.weight + " kg" : "-"}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 font-semibold">Blood Pressure</span>
                      <div className="text-lg font-bold">
                        {v.bp_systolic && v.bp_diastolic
                          ? `${v.bp_systolic}/${v.bp_diastolic} mmHg`
                          : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="text-pink-800 font-bold text-xl">
                    {isOpen ? "▲" : "▼"}
                  </div>
                </div>

                {isOpen && (
                  <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl border p-5 space-y-4">
                      <h4 className="font-extrabold text-pink-900 border-b pb-2">
                        🔬 Lab & Clinical Exams
                      </h4>
                      <p>Urine Sugar: <b className="ml-2">{v.urine_sugar || "-"}</b></p>
                      <p>Urine Albumin: <b className="ml-2">{v.urine_albumin || "-"}</b></p>
                      <p>Pallor: <b className="ml-2">{v.pallor || "-"}</b></p>
                      <p>Ankle Oedema: <b className="ml-2">{v.oedema_ankle || "-"}</b></p>
                      <p>Facial Oedema: <b className="ml-2">{v.oedema_facial || "-"}</b></p>
                    </div>

                    <div className="bg-white rounded-xl border p-5 space-y-4">
                      <h4 className="font-extrabold text-pink-900 border-b pb-2">
                        👶 Fetal Assessment
                      </h4>
                      <p>Fundal Height: <b className="ml-2">{v.fundal_height ? v.fundal_height + " cm" : "-"}</b></p>
                      <p>Foetal Lie: <b className="ml-2">{v.foetal_lie || "-"}</b></p>
                      <p>Presentation: <b className="ml-2">{v.presentation || "-"}</b></p>
                      <p>Engagement: <b className="ml-2">{v.engagement || "-"}</b></p>
                      <p>Fetal Movement: <b className="ml-2">{v.fm || "-"}</b></p>
                      <p>FHS: <b className="ml-2">{v.fhs ? v.fhs + " bpm" : "-"}</b></p>
                    </div>

                    <div className="bg-white rounded-xl border p-5 space-y-4">
                      <h4 className="font-extrabold text-pink-900 border-b pb-2">
                        💊 Care Plan
                      </h4>
                      <p>Iron: <b className="ml-2">{v.iron || "-"}</b></p>
                      <p>Folate: <b className="ml-2">{v.folate || "-"}</b></p>
                      <p>Calcium: <b className="ml-2">{v.calcium || "-"}</b></p>
                      <p>Vitamin C: <b className="ml-2">{v.vitamin_c || "-"}</b></p>
                      <p>Food Supplementation: <b className="ml-2">{v.food_supplementation || "-"}</b></p>
                      <p>Officer: <b className="ml-2">{v.officer_signature || "-"}</b></p>
                      <p>Designation: <b className="ml-2">{v.designation || "-"}</b></p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white border-2 border-dashed border-pink-200 text-center py-16 rounded-2xl text-gray-500 font-medium text-lg">
            No antenatal records found for this pregnancy.
          </div>
        )}
      </div>
    </div>
  );
}