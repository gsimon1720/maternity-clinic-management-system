import {useState,useEffect} from "react";
import {Link} from "react-router-dom";
import axios from "axios";

export default function Dashboard(){

const [data,setData]=useState({
totalPatients:0,
activePregnancies:0,
pregnancyRequests:[],
pendingRegistrations:[]
});

const [loading,setLoading]=useState(true);

useEffect(()=>{

const fetchDashboardData=async()=>{

try{

const user=JSON.parse(localStorage.getItem("user"));

const res=await axios.get(
`http://localhost:5000/api/dashboard/${user.user_id}`
);

setData({
totalPatients:res.data.totalPatients||0,
activePregnancies:res.data.activePregnancies||0,
pregnancyRequests:res.data.pregnancyRequests||[],
pendingRegistrations:res.data.pendingRegistrations||[]
});

}catch(err){

console.error("Dashboard Error:",err);

}finally{

setLoading(false);

}

};

fetchDashboardData();

},[]);



const getOrdinal=(num)=>{

const n=Number(num);

if(n%100>=11&&n%100<=13){
return `${n}th`;
}

if(n%10===1)return `${n}st`;
if(n%10===2)return `${n}nd`;
if(n%10===3)return `${n}rd`;

return `${n}th`;

};



if(loading){

return(
<div className="text-pink-600 font-bold text-center mt-10 text-xl">
Loading dashboard...
</div>
);

}



return(

<div className="max-w-7xl mx-auto space-y-8 px-3">


{/* HEADER */}

<div className="bg-gradient-to-r from-pink-50 to-rose-100 rounded-3xl p-8 border border-pink-100 shadow-sm flex justify-between items-center">

<div>

<h1 className="text-3xl font-extrabold text-slate-800">
Midwife Dashboard
</h1>

<p className="text-slate-600 mt-2">
Manage maternal registrations and pregnancy care activities
</p>

</div>


<Link
to="/midwife/pending"
className="bg-pink-600 text-white px-6 py-3 rounded-2xl font-semibold shadow hover:bg-pink-700 hover:-translate-y-1 transition duration-300"
>
+ Register Patient
</Link>


</div>



{/* STATISTICS */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">


<div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">

<div className="flex justify-between items-center">

<p className="text-sm font-bold text-slate-500 uppercase">
Registered Patients
</p>


<div className="bg-pink-100 text-pink-600 rounded-full p-3">
👩‍🍼
</div>

</div>


<h2 className="text-5xl font-extrabold text-slate-800 mt-5">
{data.totalPatients}
</h2>


<p className="text-slate-500 mt-2">
Approved mothers
</p>


</div>





<div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">


<div className="flex justify-between items-center">

<p className="text-sm font-bold text-slate-500 uppercase">
Active Pregnancies
</p>


<div className="bg-rose-100 text-rose-600 rounded-full p-3">
🤰
</div>


</div>


<h2 className="text-5xl font-extrabold text-slate-800 mt-5">
{data.activePregnancies}
</h2>


<p className="text-slate-500 mt-2">
Currently monitoring
</p>


</div>





<div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">


<div className="flex justify-between items-center">

<p className="text-sm font-bold text-slate-500 uppercase">
Pending Actions
</p>


<div className="bg-amber-100 text-amber-600 rounded-full p-3">
🔔
</div>


</div>


<h2 className="text-5xl font-extrabold text-slate-800 mt-5">
{data.pendingRegistrations.length+data.pregnancyRequests.length}
</h2>


<p className="text-slate-500 mt-2">
Need your attention
</p>


</div>


</div>





{/* PENDING REGISTRATIONS */}


<div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">


<div className="flex justify-between items-center mb-6">


<h2 className="text-2xl font-bold text-slate-800">
Pending Registrations
</h2>


<span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-bold">
{data.pendingRegistrations.length}
</span>


</div>




{
data.pendingRegistrations.length===0?


<div className="text-center py-10 text-slate-400">
No pending registrations
</div>


:


<div className="space-y-4">


{
data.pendingRegistrations.map(patient=>(


<div
key={patient.patient_id}
className="flex justify-between items-center bg-pink-50 rounded-2xl p-5 border border-transparent hover:border-pink-200 hover:bg-rose-50 hover:shadow-md transition duration-300"
>


<div>


<h3 className="text-lg font-bold text-slate-800">
{patient.first_name} {patient.last_name}
</h3>


<p className="text-slate-600">
NIC: {patient.nic}
</p>


<div className="flex gap-2 mt-3">


<span className="bg-white text-pink-700 px-3 py-1 rounded-full text-sm shadow-sm">
{patient.area_name}
</span>


<span className="bg-white text-pink-700 px-3 py-1 rounded-full text-sm shadow-sm">
{patient.zone_name}
</span>


</div>


</div>



<Link
to={`/midwife/register/${patient.patient_id}`}
className="bg-pink-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-pink-700 hover:scale-105 transition duration-300"
>
Register
</Link>



</div>


))

}


</div>


}


</div>







{/* PREGNANCY REQUESTS */}



<div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">


<div className="flex justify-between items-center mb-6">


<h2 className="text-2xl font-bold text-slate-800">
New Pregnancy Requests
</h2>


<span className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full font-bold">
{data.pregnancyRequests.length}
</span>


</div>




{
data.pregnancyRequests.length===0?


<div className="text-center py-10 text-slate-400">
No pregnancy requests
</div>


:


<div className="space-y-4">


{
data.pregnancyRequests.map(request=>(


<div
key={request.request_id}
className="flex justify-between items-center bg-rose-50 rounded-2xl p-5 border border-transparent hover:border-rose-200 hover:bg-pink-50 hover:shadow-md transition duration-300"
>


<div>


<h3 className="text-lg font-bold text-slate-800">
{request.first_name} {request.last_name}
</h3>


<p className="text-slate-600">
NIC: {request.nic}
</p>


<span className="inline-block mt-3 bg-white text-rose-700 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
{getOrdinal(Number(request.pregnancy_count)+1)} Pregnancy Request
</span>


</div>



<Link
to={`/midwife/pregnancy-request/${request.request_id}`}
className="bg-rose-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-rose-600 hover:scale-105 transition duration-300"
>
Review
</Link>



</div>


))

}


</div>


}


</div>


</div>

);

}