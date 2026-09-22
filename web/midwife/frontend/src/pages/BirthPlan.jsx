import {useState,useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';

export default function BirthPlan(){
  const {pregnancyId}=useParams();
  const [plan,setPlan]=useState(null);
  const [editing,setEditing]=useState(false);

  const initialForm={
    plan_date:new Date().toISOString().split('T')[0],
    intended_delivery_facility:'',
    emergency_transport_mode:'',
    birth_companion_name:'',
    support_phone:'',
    blood_donor_name:'',
    blood_donor_phone:'',
    emergency_funds_arranged:'Yes'
  };

  const [formData,setFormData]=useState(initialForm);

  useEffect(()=>{
    fetchPlan();
  },[pregnancyId]);

  const fetchPlan=async()=>{
    try{
      const res=await axios.get(`http://localhost:5000/api/birth-plan/${pregnancyId}`);
      if(res.data.length>0){
        setPlan(res.data[0]);
        setFormData({
          ...res.data[0],
          plan_date:res.data[0].plan_date
          ? new Date(res.data[0].plan_date).toISOString().split('T')[0]
          : ''
        });
      }
    }catch(err){
      console.error("Error loading birth plan:",err);
    }
  };

  const handleChange=(e)=>{
    setFormData({
      ...formData,
      [e.target.name]:e.target.value
    });
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();

    try{
      if(plan && editing){
        await axios.put(
          `http://localhost:5000/api/birth-plan/${plan.birth_plan_id}`,
          formData
        );
      }else if(!plan){
        await axios.post(
          "http://localhost:5000/api/birth-plan",
          {
            pregnancy_id:pregnancyId,
            ...formData
          }
        );
      }

      setEditing(false);
      fetchPlan();

    }catch(err){
      console.error("Save birth plan error:",err);
      alert("Error saving birth plan");
    }
  };

  const inputClass="w-full border border-pink-200 p-3 rounded-xl text-sm outline-none focus:border-pink-500";

  return(
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSubmit} className="bg-pink-50 p-6 rounded-3xl border border-pink-100 space-y-5">
        <h2 className="text-2xl font-bold text-pink-900">
          Birth Preparedness & Delivery Plan
        </h2>
        <div>
          <label className="block text-sm font-semibold mb-1">Plan Date</label>
          <input type="date" name="plan_date" value={formData.plan_date} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Intended Delivery Facility</label>
          <input name="intended_delivery_facility" value={formData.intended_delivery_facility} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Emergency Transport Mode</label>
          <input name="emergency_transport_mode" value={formData.emergency_transport_mode} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Birth Companion Name</label>
          <input name="birth_companion_name" value={formData.birth_companion_name} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Support Phone</label>
          <input name="support_phone" value={formData.support_phone} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Blood Donor Name</label>
          <input name="blood_donor_name" value={formData.blood_donor_name} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Blood Donor Phone</label>
          <input name="blood_donor_phone" value={formData.blood_donor_phone} onChange={handleChange} className={inputClass}/>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Emergency Funds Arranged</label>
          <select name="emergency_funds_arranged" value={formData.emergency_funds_arranged} onChange={handleChange} className={inputClass}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <Button type="submit">
          {plan ? "Update Birth Plan" : "Save Birth Plan"}
        </Button>
        {plan && !editing && (
          <button type="button" onClick={()=>setEditing(true)} className="ml-3 px-5 py-2 bg-yellow-500 text-white rounded-xl">
            Edit
          </button>
        )}
      </form>
      {plan && (
        <div className="bg-white p-6 rounded-3xl border border-pink-100">
          <h3 className="text-xl font-bold text-pink-900 mb-4">Current Birth Plan</h3>
          <p><b>Facility:</b> {plan.intended_delivery_facility || '-'}</p>
          <p><b>Transport:</b> {plan.emergency_transport_mode || '-'}</p>
          <p><b>Companion:</b> {plan.birth_companion_name || '-'}</p>
          <p><b>Blood Donor:</b> {plan.blood_donor_name || '-'}</p>
          <p><b>Funds:</b> {plan.emergency_funds_arranged || '-'}</p>
        </div>
      )}
    </div>
  );
}