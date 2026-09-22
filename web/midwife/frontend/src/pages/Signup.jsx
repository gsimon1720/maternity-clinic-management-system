import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', age: '', nic: '', license_number: '', password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);
      alert('Registration successful! Please use your NIC Number as your Username to log in.');
      navigate('/'); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    }
  };

  const inputClass = "w-full border-2 border-pink-100 p-3 rounded-xl focus:border-pink-500 outline-none transition-all text-sm mb-4";

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-pink-100 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-pink-900 text-center mb-2">Midwife Registration</h2>
        <p className="text-center text-pink-600 mb-6">Create your staff account</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-bold text-pink-900 mb-1 uppercase">Full Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />

          <label className="block text-xs font-bold text-pink-900 mb-1 uppercase">Age</label>
          <input required type="number" name="age" value={formData.age} onChange={handleChange} className={inputClass} />

          <label className="block text-xs font-bold text-pink-900 mb-1 uppercase">
            NIC Number <span className="text-pink-500 font-normal lowercase">(This will be your username for logging in)</span>
          </label>
          <input required type="text" name="nic" value={formData.nic} onChange={handleChange} className={inputClass} placeholder="e.g. 199012345678" />

          <label className="block text-xs font-bold text-pink-900 mb-1 uppercase">Nursing/Midwife License No.</label>
          <input required type="text" name="license_number" value={formData.license_number} onChange={handleChange} className={inputClass} />

          <label className="block text-xs font-bold text-pink-900 mb-1 uppercase">Password</label>
          <input required type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} />

          <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all mt-2">
            Register Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered? <Link to="/" className="text-pink-600 font-bold hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}