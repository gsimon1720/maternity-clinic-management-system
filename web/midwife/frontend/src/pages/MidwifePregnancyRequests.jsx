import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {getLoggedUser} from "../utils/auth";

export default function MidwifePregnancyRequests(){
const user=getLoggedUser();
const navigate=useNavigate();
const [requests,setRequests]=useState([]);

useEffect(()=>{
fetchRequests();
},[]);

const fetchRequests=async()=>{
try{
const res=await axios.get(
`http://localhost:5000/api/midwife/pregnancy-requests/${user.user_id}`
);
setRequests(res.data);
}catch(err){
console.error(err);
}
};

return(
<div>
<h2 className="text-3xl font-bold text-pink-900 mb-6">
Pregnancy Requests
</h2>
{requests.length===0?
<p>No pending pregnancy requests</p>
:
<div className="grid md:grid-cols-2 gap-6">
{requests.map(r=>(

<div
key={r.request_id}
className="border rounded-3xl p-6 shadow bg-white"
>

<h3 className="text-xl font-bold text-pink-700">
{r.first_name} {r.last_name}
</h3>

<p>
NIC:
<b className="ml-2">
{r.nic}
</b>
</p>

<p>
Previous Pregnancies:
<b className="ml-2">
{r.pregnancy_count}
</b>
</p>

<p>
Request Date:
{new Date(r.request_date).toLocaleDateString()}
</p>


<div className="mt-4">

<img
src={r.report_image}
alt="Pregnancy Report"
className="w-40 h-40 object-cover rounded-xl border"
/>

</div>


<button
onClick={()=>navigate(
`/midwife/pregnancy-request/${r.request_id}`
)}
className="mt-5 bg-pink-600 text-white px-5 py-3 rounded-xl"
>

Review Report

</button>


</div>

))}
</div>
}
</div>
);
}