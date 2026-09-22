// src/pages/doctor/DoctorPostnatalCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostnatalForm from '../../components/postnatal/PostnatalForm';
import { patientApi } from '../../api/patientApi';
import toast from 'react-hot-toast';
import { FaSearch } from 'react-icons/fa';

const DoctorPostnatalCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [pregnancyId, setPregnancyId] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Get patientId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (pid) {
      setPatientId(parseInt(pid));
      fetchPatient(parseInt(pid));
    } else {
      setLoading(false);
      setShowPatientSearch(true);
    }
  }, [location]);

  const fetchPatient = async (id) => {
    try {
      const response = await patientApi.getById(id);
      if (response.success) {
        setPatientName(`${response.data.first_name} ${response.data.last_name}`);
        // Get active pregnancy
        const fullData = await patientApi.getPatientWithAllData(id);
        if (fullData.success && fullData.data.currentPregnancy) {
          setPregnancyId(fullData.data.currentPregnancy.pregnancy_id);
        }
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
      setShowPatientSearch(false);
    }
  };

  const handleSearchPatient = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    try {
      setSearching(true);
      const response = await patientApi.getAll({
        search: searchTerm,
        status: 'approved',
        page: 1,
        limit: 10
      });
      if (response.success) {
        setSearchResults(response.data.patients);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search patients');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setPatientId(patient.patient_id);
    setPatientName(`${patient.first_name} ${patient.last_name}`);
    setShowPatientSearch(false);
    // Fetch pregnancy data
    fetchPatient(patient.patient_id);
  };

  const handleSuccess = () => {
    navigate('/doctor/postnatal');
  };

  const handleCancel = () => {
    navigate('/doctor/postnatal');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Patient Search if no patient selected
  if (showPatientSearch || !patientId) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Postnatal Record</h1>
          <p className="text-gray-600 mt-1">Select a patient first to create postnatal care record</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Select Patient</h3>
          
          {patientId && patientName && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800">
                ✅ Selected patient: <span className="font-bold">{patientName}</span>
              </p>
              <button
                onClick={() => setShowPatientSearch(true)}
                className="mt-2 text-sm text-primary-600 hover:underline"
              >
                Change Patient
              </button>
            </div>
          )}

          {!patientId && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Name, NIC, or Patient ID..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                />
                <button
                  onClick={handleSearchPatient}
                  disabled={searching}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <FaSearch /> {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Patient Name</th>
                        <th className="px-4 py-2 text-left">Patient ID</th>
                        <th className="px-4 py-2 text-left">NIC</th>
                        <th className="px-4 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((patient) => (
                        <tr key={patient.patient_id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2">{patient.first_name} {patient.last_name}</td>
                          <td className="px-4 py-2">#{patient.patient_id}</td>
                          <td className="px-4 py-2">{patient.nic || '-'}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => handleSelectPatient(patient)}
                              className="text-primary-600 hover:text-primary-800 font-medium"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {searchResults.length === 0 && searchTerm && !searching && (
                <p className="text-gray-500 text-center py-4">No patients found. Try a different search.</p>
              )}
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => navigate('/doctor/patients')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Or go to Search Patients page →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Postnatal Record</h1>
            <p className="text-gray-600 mt-1">
              Creating record for: <span className="font-medium">{patientName}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setPatientId(null);
              setPatientName('');
              setShowPatientSearch(true);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Change Patient
          </button>
        </div>
      </div>

      <PostnatalForm
        mode="create"
        patientId={patientId}
        pregnancyId={pregnancyId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default DoctorPostnatalCreate;