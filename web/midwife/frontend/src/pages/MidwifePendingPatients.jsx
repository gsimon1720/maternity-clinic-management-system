import {useEffect,useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {getLoggedUser} from "../utils/auth";

export default function MidwifePendingPatients(){
const user=getLoggedUser();
const [patients,setPatients]=useState([]);
const navigate=useNavigate();

useEffect(()=>{
fetchPatients();
},[]);

const fetchPatients=async()=>{
try{
if(!user){
console.error("No logged user found");
return;
}
const res=await axios.get(`http://localhost:5000/api/midwife/pending-patients/${user.user_id}`);
setPatients(res.data || []);
}catch(err){
console.error("FETCH PENDING PATIENT ERROR:",err);
}
};

return(
<div className="space-y-6">
<h1 className="text-3xl font-bold text-pink-900">
Pending Patients
</h1>
<p className="text-gray-600">
Patients assigned to your PHM area
</p>
<div className="bg-white rounded-3xl shadow border overflow-hidden">
<table className="w-full">
<thead className="bg-pink-100">
<tr>
<th className="p-4 text-left">Name</th>
<th className="p-4">NIC</th>
<th className="p-4">Area</th>
<th className="p-4">Road</th>
<th className="p-4">Action</th>
</tr>
</thead>
<tbody>
{patients.map((patient)=>(
<tr key={patient.patient_id} className="border-b">
<td className="p-4">
{patient.first_name} {patient.last_name}
</td>
<td className="p-4">
{patient.nic}
</td>
<td className="p-4">
{patient.area_name}
</td>
<td className="p-4">
{patient.zone_name}
</td>
<td className="p-4">
<button
onClick={()=>{
console.log("Navigating patient:",patient.patient_id);
navigate(`/midwife/register/${String(patient.patient_id)}`);
}}
className="bg-pink-600 text-white px-4 py-2 rounded-xl"
>
Register
</button>
</td>
</tr>
))}
</tbody>
</table>
{patients.length===0&&(
<div className="p-8 text-center text-gray-400">
No pending patients
</div>
)}
</div>
</div>
);
}