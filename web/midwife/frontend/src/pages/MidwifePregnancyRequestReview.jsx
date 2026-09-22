import {useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import axios from "axios";

export default function MidwifePregnancyRequestReview(){

const {id}=useParams();
const navigate=useNavigate();
const [request,setRequest]=useState(null);

useEffect(()=>{
load();
},[]);

const load=async()=>{
const res=await axios.get(
`http://localhost:5000/api/midwife/pregnancy-request/${id}`
);
setRequest(res.data);
};

const approve=async()=>{

try{

await axios.put(
`http://localhost:5000/api/midwife/pregnancy-request/${id}/approve`
);


navigate(
`/patient/${request.patient_id}/add-pregnancy?requestId=${id}`
);


}catch(err){

console.error(
"APPROVE ERROR",
err
);

}

};

const reject=async()=>{
await axios.put(
`http://localhost:5000/api/midwife/pregnancy-request/${id}/reject`
);
navigate("/midwife/pregnancy-requests");
};

if(!request)return <p>Loading...</p>;

return(
<div>
<h2 className="text-3xl font-bold text-pink-900">
Pregnancy Report Review
</h2>

<div className="mt-5">
<h3>
{request.first_name} {request.last_name}
</h3>
<p>
NIC: {request.nic}
</p>

<img
src={request.report_image}
alt="Pregnancy Report"
className="mt-5 w-96 rounded-xl border"
/>

<div className="mt-6 flex gap-4">

<button
onClick={approve}
className="bg-green-600 text-white px-6 py-3 rounded-xl"
>
Approve Pregnancy
</button>

<button
onClick={reject}
className="bg-red-600 text-white px-6 py-3 rounded-xl"
>
Reject
</button>

</div>
</div>
</div>
);
}