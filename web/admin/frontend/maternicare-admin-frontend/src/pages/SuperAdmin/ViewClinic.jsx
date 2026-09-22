import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Hash, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClinicById } from '../../services/clinicService';

const ViewClinic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinicById(id)
      .then(setClinic)
      .catch((error) => {
        toast.error(error.message || 'Failed to load clinic');
        navigate('/super-admin/clinics');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading clinic...</div>;
  }

  if (!clinic) {
    return null;
  }

  return (
    <div style={{ padding: '0px', minHeight: '100vh' }}>
      <button
        onClick={() => navigate('/super-admin/clinics')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#831843', fontWeight: '500', transition: 'color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#db2777'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#831843'}
      >
        <ArrowLeft size={18} /> Back to Clinics
      </button>

      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #fbcfe8', boxShadow: '0 20px 25px -5px rgba(131,24,67,0.05)' }}>
        <div style={{ background: 'linear-gradient(135deg, #db2777, #831843)', padding: '32px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
            <div>
              <Building2 size={36} style={{ marginBottom: '12px' }} />
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{clinic.clinic_name}</h1>
              <p style={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hash size={14} /> Code: {clinic.clinic_code}
              </p>
            </div>
            <button
              onClick={() => navigate(`/super-admin/clinics/edit/${clinic.clinic_id ?? clinic.id}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <Edit2 size={16} /> Edit
            </button>
          </div>
        </div>

        <div style={{ padding: '32px', display: 'grid', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: '#fdf2f8', padding: '16px', borderRadius: '16px', border: '1px solid #fbcfe8', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#db2777' }}>{clinic.total_doctors || 0}</div>
              <div style={{ color: '#9d174d', fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>Doctors</div>
            </div>
            <div style={{ background: '#faf5ff', padding: '16px', borderRadius: '16px', border: '1px solid #e9d5ff', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B5CF6' }}>{clinic.total_midwives || 0}</div>
              <div style={{ color: '#9d174d', fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>Midwives</div>
            </div>
            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '16px', border: '1px solid #bae6fd', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B82F6' }}>{clinic.total_nurses || 0}</div>
              <div style={{ color: '#9d174d', fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>Nurses</div>
            </div>
            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '16px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{clinic.total_patients || 0}</div>
              <div style={{ color: '#9d174d', fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>Patients</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '14px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#831843', fontSize: '14px' }}>
              <MapPin size={18} color="#db2777" /> 
              <span><strong>District:</strong> {clinic.district}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#831843', fontSize: '14px' }}>
              <MapPin size={18} color="#db2777" /> 
              <span><strong>Province:</strong> {clinic.province}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClinic;
