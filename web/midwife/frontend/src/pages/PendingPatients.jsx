import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// If you want to use your custom Button component, you can import it here, 
// but I've used standard Tailwind classes below for simplicity.

export default function PendingPatients() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate(); // This replaces the direct API call

  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/patients/pending');
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching pending patients:", err);
    }
  };

  useEffect(() => { 
    fetchPending(); 
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Pending Mobile Registrations</h1>
      
      <div className="grid gap-4">
        {patients.map(p => (
          <div key={p.patient_id} className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-amber-500 hover:shadow-md transition">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{p.first_name} {p.last_name}</h3>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">NIC:</span> {p.nic || 'Not provided'} | <span className="font-medium">Contact:</span> {p.contact_number}
              </p>
            </div>
            
            {/* INSTEAD of confirming immediately, this sends them to the Admission Form! */}
            <button 
              onClick={() => navigate(`/admit/${p.patient_id}`)} 
              className="px-6 py-2.5 bg-pink-600 text-white font-bold rounded hover:bg-pink-700 transition"
            >
              Verify & Assign Zone
            </button>
          </div>
        ))}
        
        {patients.length === 0 && (
          <div className="text-center p-8 text-gray-500 italic bg-gray-50 rounded-lg border">
            No pending patients from the mobile app right now.
          </div>
        )}
      </div>
    </div>
  );
}