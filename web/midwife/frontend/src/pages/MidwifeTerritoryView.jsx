import {useState,useEffect} from "react";
import axios from "axios";

export default function MidwifeTerritoryView(){
const [territory,setTerritory]=useState({});
const [loading,setLoading]=useState(true);

useEffect(()=>{
const fetchTerritory=async()=>{
try{
const res=await axios.get("http://localhost:5000/api/midwife/1/territory");
setTerritory(res.data);
}catch(err){
console.error("Error fetching territory:",err);
}finally{
setLoading(false);
}
};
fetchTerritory();
},[]);

if(loading){
return(
<div className="min-h-screen flex items-center justify-center text-pink-600 font-semibold">
Loading Midwife Territory...
</div>
);
}

const totalPatients=Object.values(territory).reduce((total,zone)=>total+zone.length,0);

return(
<div className="max-w-7xl mx-auto p-6 space-y-6">
<div className="bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-3xl p-8 shadow">
<h1 className="text-3xl font-bold">
My Patient Territory
</h1>
<p className="mt-2 opacity-90">
Manage patients assigned to your PHM zones
</p>
<div className="mt-5 bg-white/20 rounded-xl p-4 w-fit">
<p className="text-sm">
Total Assigned Patients
</p>
<p className="text-3xl font-bold">
{totalPatients}
</p>
</div>
</div>
<div className="grid md:grid-cols-3 gap-6">
{Object.keys(territory).map(zone=>(
<div key={zone} className="bg-white rounded-3xl shadow-lg border overflow-hidden">
<div className="bg-pink-100 p-5">
<h2 className="text-xl font-bold text-pink-900">
{zone}
</h2>
<p className="text-sm text-gray-600 mt-1">
Patients in this zone
</p>
</div>
<div className="p-5">
{territory[zone].length===0?(
<div className="text-center py-8 text-gray-400">
<p className="text-3xl">
👩‍⚕️
</p>
<p className="mt-2">
No patients assigned yet
</p>
</div>
):(
<div className="space-y-4">
{territory[zone].map(patient=>(
<div key={patient.patient_id} className="bg-gray-50 rounded-2xl p-5 border hover:shadow-md transition">
<h3 className="text-lg font-bold text-gray-900">
{patient.first_name} {patient.last_name}
</h3>
<div className="mt-4 space-y-2 text-sm">
<h4 className="font-semibold text-pink-800">
Personal Information
</h4>
<div>
<span className="font-semibold text-gray-700">
NIC:
</span>
<span className="ml-2">
{patient.nic||"Not available"}
</span>
</div>
<div>
<span className="font-semibold text-gray-700">
Phone:
</span>
<span className="ml-2">
{patient.phone||"Not available"}
</span>
</div>
<div>
<span className="font-semibold text-gray-700">
Address:
</span>
<span className="ml-2">
{patient.address||"Not available"}
</span>
</div>
</div>
<div className="mt-4 pt-4 border-t">
<h4 className="font-semibold text-pink-800">
Visit Information
</h4>
{patient.assigned_visit_day?(
<span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
Scheduled: {patient.assigned_visit_day}
</span>
):(
<p className="text-sm text-gray-500 mt-2">
No visit scheduled
</p>
)}
</div>
</div>
))}
</div>
)}
</div>
</div>
))}
</div>
</div>
);
}