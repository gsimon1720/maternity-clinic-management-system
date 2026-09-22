import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';

export default function PatientProfile() {
  const { id } = useParams();
  const [visits, setVisits] = useState([]);
  const [formData, setFormData] = useState({ visit_number: '', weeks_into_pregnancy: '', anemia: '', swelling: '', fundal_height: '', fetal_heart_rate: '' });

  const fetchVisits = async () => {
    const res = await axios.get(`http://localhost:5000/api/visits/${id}`);
    setVisits(res.data);
  };

  useEffect(() => { fetchVisits(); }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/visits', { patient_id: id, ...formData });
      fetchVisits();
      setFormData({ visit_number: '', weeks_into_pregnancy: '', anemia: '', swelling: '', fundal_height: '', fetal_heart_rate: '' });
    } catch (err) {
      alert('Error adding visit. Check if visit number already exists.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Prenatal Field Notes (Visits 1-10)</h1>
      <div className="bg-white rounded shadow mb-8 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Visit #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Weeks</th>
              <th className="p-3">Anemia</th>
              <th className="p-3">Swelling</th>
              <th className="p-3">Fundal Height</th>
              <th className="p-3">Fetal HR</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(v => (
              <tr key={v.note_id} className="border-b">
                <td className="p-3 font-bold">{v.visit_number}</td>
                <td className="p-3">{new Date(v.visit_date).toLocaleDateString()}</td>
                <td className="p-3">{v.weeks_into_pregnancy}</td>
                <td className="p-3">{v.anemia}</td>
                <td className="p-3">{v.swelling}</td>
                <td className="p-3">{v.fundal_height}</td>
                <td className="p-3">{v.fetal_heart_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Log New Visit Data</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <input required type="number" min="1" max="10" placeholder="Visit Number (1-10)" className="border p-2 rounded" value={formData.visit_number} onChange={e => setFormData({...formData, visit_number: e.target.value})} />
          <input placeholder="Weeks Pregnant" type="number" className="border p-2 rounded" value={formData.weeks_into_pregnancy} onChange={e => setFormData({...formData, weeks_into_pregnancy: e.target.value})} />
          <input placeholder="Anemia Status" className="border p-2 rounded" value={formData.anemia} onChange={e => setFormData({...formData, anemia: e.target.value})} />
          <input placeholder="Swelling" className="border p-2 rounded" value={formData.swelling} onChange={e => setFormData({...formData, swelling: e.target.value})} />
          <input placeholder="Fundal Height" className="border p-2 rounded" value={formData.fundal_height} onChange={e => setFormData({...formData, fundal_height: e.target.value})} />
          <input placeholder="Fetal Heart Rate" className="border p-2 rounded" value={formData.fetal_heart_rate} onChange={e => setFormData({...formData, fetal_heart_rate: e.target.value})} />
          <button type="submit">Save Visit Record</button>
        </form>
      </div>
    </div>
  );
}