import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';
import { getLoggedUser } from '../utils/auth';

export default function SearchPatients() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const user = getLoggedUser();

  useEffect(() => {
    if (user?.user_id) {
      fetchApprovedPatients();
    }
  }, []);

  const fetchApprovedPatients = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/patients/search?q=&midwifeId=${user.user_id}`
      );
      setResults(res.data);
    } catch (err) {
      console.error("Error fetching approved patients:", err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/patients/search?q=${query.trim()}&midwifeId=${user.user_id}`
      );
      setResults(res.data);
    } catch (err) {
      console.error("Error searching patients:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Search My Approved Patients
      </h1>

      <div className="flex gap-2 mb-8 bg-white p-4 rounded-lg shadow-sm border">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, NIC, phone or email..."
          className="border border-gray-300 p-3 rounded-md flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center gap-2"
        >
          <Search size={20} />
          Search
        </button>

        {query && (
          <button
            onClick={() => {
              setQuery('');
              fetchApprovedPatients();
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {results.length === 0 ? (
          <div className="text-center p-8 text-gray-500 bg-white rounded-lg border">
            No approved patients assigned to you.
          </div>
        ) : (
          results.map((p) => (
            <div
              key={p.patient_id}
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:border-blue-400 hover:shadow-md transition gap-4"
              onClick={() => navigate(`/patient/${p.patient_id}`)}
            >
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {p.first_name} {p.last_name}
                  <span className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-normal">
                    APPROVED
                  </span>
                </p>

                <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-4">
                  <span>
                    <strong className="text-gray-500">NIC:</strong> {p.nic || 'N/A'}
                  </span>

                  <span>
                    <strong className="text-gray-500">Phone:</strong> {p.phone || 'N/A'}
                  </span>

                  <span>
                    <strong className="text-gray-500">Email:</strong> {p.email || 'N/A'}
                  </span>

                  <span>
                    <strong className="text-gray-500">Area:</strong> {p.area_name || 'Unassigned'}
                  </span>

                  <span>
                    <strong className="text-gray-500">Approved Date:</strong>{' '}
                    {p.pregnant_mother_approved_date || 'N/A'}
                  </span>
                </div>
              </div>

              <button
                className="text-blue-600 font-semibold hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/patient/${p.patient_id}`);
                }}
              >
                Open Record →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}