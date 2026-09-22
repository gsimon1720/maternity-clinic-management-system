import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Trash2, ChevronLeft, ChevronRight, Baby, UserCheck, MapPin, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMidwives, updateClinicUser, deleteClinicUser } from '../../../services/userService';
import toast from 'react-hot-toast';

const COLORS = {
  bgPink50: '#fdf2f8',
  bgPink100: '#fce7f3',
  bgPink200: '#fbcfe8',
  textPink600: '#db2777',
  textPink800: '#9d174d',
  textPink900: '#831843',
  purple600: '#7c3aed',
};

const formatTimestamp = (ts) => {
  if (!ts) return 'Never';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return ts;
  }
};

const MidwifeManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [midwives, setMidwives] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const loadMidwives = async () => {
    try {
      setLoading(true);
      const response = await getMidwives();
      setMidwives(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load midwives');
      setMidwives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMidwives();
  }, []);

  const handleToggleStatus = async (midwife) => {
    const newStatus = midwife.status === 'active' ? 'inactive' : 'active';
    setTogglingId(midwife.user_id);
    try {
      await updateClinicUser(midwife.user_id, { status: newStatus });
      setMidwives((prev) =>
        prev.map((m) => (m.user_id === midwife.user_id ? { ...m, status: newStatus } : m))
      );
      toast.success(`Status for ${midwife.full_name} changed to ${newStatus.toUpperCase()}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update midwife status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action is permanent.`)) {
      deleteClinicUser(id)
        .then(() => {
          setMidwives((prev) => prev.filter((m) => m.user_id !== id));
          toast.success(`Midwife ${name} deleted successfully`);
        })
        .catch((error) => {
          toast.error(error.message || 'Unable to delete midwife');
        });
    }
  };

  const filtered = midwives.filter((m) =>
    (m.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.nic || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMidwives = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const totalMidwives = midwives.length;
  const activeMidwives = midwives.filter((m) => (m.status || 'active') === 'active').length;
  const assignedMidwives = midwives.filter((m) => m.area_id).length;

  return (
    <div style={{
      padding: '24px',
      background: `linear-gradient(135deg, ${COLORS.bgPink50} 0%, ${COLORS.bgPink100} 100%)`,
      minHeight: '100vh',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.textPink900, marginBottom: '8px' }}>
          Midwife Management
        </h1>
        <p style={{ color: COLORS.textPink800, fontSize: '14px' }}>
          Register and supervise midwives across all clinics
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Midwives', value: totalMidwives, icon: Baby, color: COLORS.purple600 },
          { label: 'Active', value: activeMidwives, icon: UserCheck, color: '#10b981' },
          { label: 'Area Assigned', value: assignedMidwives, icon: MapPin, color: COLORS.textPink600 },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', border: `1px solid ${COLORS.bgPink200}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
                <div style={{ fontSize: '12px', color: COLORS.textPink800 }}>{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Add Button Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: COLORS.bgPink200 }} />
          <input
            type="text"
            placeholder="Search by name, email, NIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 40px', border: `1px solid ${COLORS.bgPink200}`, borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white' }}
          />
        </div>

        <button
          onClick={() => navigate('/sphm/midwives/add')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            background: `linear-gradient(135deg, ${COLORS.textPink600}, ${COLORS.textPink800})`,
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(219,39,119,0.25)',
          }}
        >
          <Plus size={18} /> Add Midwife
        </button>
      </div>

      {/* Midwives Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto', border: `1px solid ${COLORS.bgPink200}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
          <thead>
            <tr style={{ background: COLORS.bgPink50, borderBottom: `1px solid ${COLORS.bgPink200}` }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>MIDWIFE</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>EMAIL</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>AREA</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>ZONES</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>CLINIC</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>STATUS</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>REGISTERED</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: COLORS.textPink800 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: COLORS.textPink800 }}>Loading midwives...</td></tr>
            ) : currentMidwives.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: COLORS.textPink800 }}>No midwives found.</td></tr>
            ) : (
              currentMidwives.map((m) => (
                <tr key={m.user_id} style={{ borderBottom: `1px solid ${COLORS.bgPink100}` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = COLORS.bgPink50}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: `linear-gradient(135deg, ${COLORS.purple600}, ${COLORS.purple600}cc)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
                        {(m.full_name || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: '600', color: COLORS.textPink900, fontSize: '14px' }}>{m.full_name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: COLORS.textPink800 }}>{m.email}</td>
                  <td style={{ padding: '16px', fontSize: '13px' }}>
                    {m.area ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: COLORS.purple600, fontWeight: '600' }}>
                        <MapPin size={13} /> {m.area.area_name}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '12px', color: COLORS.textPink800 }}>
                    {m.area?.zones?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {m.area.zones.map((z) => (
                          <span key={z.zone_id} style={{ background: COLORS.bgPink100, padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                            <Map size={10} style={{ display: 'inline', marginRight: '3px' }} />{z.zone_name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: COLORS.textPink800 }}>{m.clinic?.clinic_name || '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m)}
                      disabled={togglingId === m.user_id}
                      title={`Click to switch status to ${m.status === 'active' ? 'Inactive' : 'Active'}`}
                      style={{
                        position: 'relative', width: '46px', height: '24px', borderRadius: '12px',
                        background: m.status === 'active' ? '#10B981' : '#9CA3AF', border: 'none',
                        cursor: togglingId === m.user_id ? 'wait' : 'pointer', padding: '2px', display: 'flex', alignItems: 'center',
                      }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', transform: m.status === 'active' ? 'translateX(22px)' : 'translateX(0px)', transition: 'transform 0.3s' }} />
                    </button>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: COLORS.textPink800 }}>{formatTimestamp(m.created_at)}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button
                        onClick={() => navigate(`/sphm/midwives/view/${m.user_id}`)}
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', borderRadius: '6px' }}
                        title="View Midwife Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.user_id, m.full_name)}
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', borderRadius: '6px' }}
                        title="Delete Midwife"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${COLORS.bgPink200}`, flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: COLORS.textPink800 }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} entries
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
                style={{ padding: '6px 12px', border: `1px solid ${COLORS.bgPink200}`, background: 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: COLORS.textPink800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ChevronLeft size={16} /> Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  style={{ padding: '6px 12px', border: currentPage === i + 1 ? 'none' : `1px solid ${COLORS.bgPink200}`, background: currentPage === i + 1 ? COLORS.textPink600 : 'white', color: currentPage === i + 1 ? 'white' : COLORS.textPink800, borderRadius: '6px', cursor: 'pointer', fontWeight: currentPage === i + 1 ? '600' : '400' }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                style={{ padding: '6px 12px', border: `1px solid ${COLORS.bgPink200}`, background: 'white', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: COLORS.textPink800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MidwifeManagement;
