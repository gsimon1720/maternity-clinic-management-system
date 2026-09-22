import {useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import axios from "axios";
import {getLoggedUser} from "../utils/auth";

export default function MidwifePatientReview(){

const {patientId}=useParams();
const navigate=useNavigate();
const user=getLoggedUser();

const [patient,setPatient]=useState(null);
const [clinic,setClinic]=useState(null);

const [form,setForm]=useState({
clinic_id:"",
area_id:"",
zone_id:"",
hospital_clinic_name:"",
consultant_obstetrician:"",
pregnant_mother_approved_date:"",
phm_area:"",
moh_area:"",
antenatal_risk_conditions:"",
height_cm:"",
weight_kg:""
});


useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    const [patientRes, clinicRes, doctorRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/midwife/patient-review/${patientId}`),
      axios.get(`http://localhost:5000/api/clinic/${user.clinic_id}`),
      axios.get(`http://localhost:5000/api/clinic/${user.clinic_id}/doctor`)
    ]);

    setPatient(patientRes.data);
    setClinic(clinicRes.data);

    setForm({
      clinic_id: user.clinic_id || "",
      area_id: patientRes.data.area_id || user.area_id || "",
      zone_id: patientRes.data.zone_id || "",
      hospital_clinic_name: patientRes.data.hospital_clinic_name || "",
      consultant_obstetrician:
        patientRes.data.consultant_obstetrician ||
        doctorRes.data.full_name ||
        "",
      pregnant_mother_approved_date:
        patientRes.data.pregnant_mother_approved_date || "",
      phm_area: patientRes.data.phm_area || "",
      moh_area: patientRes.data.moh_area || "",
      antenatal_risk_conditions:
        patientRes.data.antenatal_risk_conditions || "",
      height_cm: patientRes.data.height_cm || "",
      weight_kg: patientRes.data.weight_kg || ""
    });

  } catch (err) {
    console.error("LOAD DATA ERROR:", err);
  }
};



const fetchClinic=async()=>{
try{

const res=await axios.get(
`http://localhost:5000/api/clinic/${user.clinic_id}`
);

setClinic(res.data);

}catch(err){
console.error("FETCH CLINIC ERROR:",err);
}

};



const fetchConsultantDoctor=async()=>{
try{

const res=await axios.get(
`http://localhost:5000/api/clinic/${user.clinic_id}/doctor`
);


setForm(prev=>({
...prev,
consultant_obstetrician:res.data.full_name
}));

}catch(err){
console.error("FETCH DOCTOR ERROR:",err);
}

};



const handleChange=(e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};



const calculateBMI=()=>{
if(form.height_cm && form.weight_kg){

return(
form.weight_kg/
Math.pow(form.height_cm/100,2)
).toFixed(2);

}

return "";
};



const submit=async(e)=>{
e.preventDefault();

try{

await axios.put(
`http://localhost:5000/api/midwife/register-patient/${patientId}`,
{
...form,
clinic_id:user.clinic_id,
assigned_midwife_id:user.user_id,
bmi:calculateBMI()
}
);


alert("Patient registration approved");

navigate("/midwife/pending");


}catch(err){

console.error("REGISTER ERROR:",err);

alert("Registration failed");

}

};



if(!patient){

return(
<div className="p-8 text-center text-gray-500">
Loading patient information...
</div>
);

}



return(

<div className="max-w-6xl mx-auto p-4 space-y-6">


<h1 className="text-3xl font-bold text-pink-900">
Patient Registration Review
</h1>


<div className="bg-white rounded-3xl shadow-lg p-6">


<h2 className="text-xl font-bold text-pink-700 mb-5">
Mother Entered Information
</h2>


<div className="grid md:grid-cols-2 gap-5">


{[
["First Name","first_name"],
["Last Name","last_name"],
["NIC","nic"],
["Phone","phone"],
["Email","email"],
["Address","address"],
["Blood Group","blood_group"],
["Allergies","allergies"]
].map(([label,key])=>(

<div key={key}>

<label className="font-semibold">
{label}
</label>

<input
value={patient[key] || ""}
readOnly
className="border p-3 rounded-xl w-full bg-gray-100"
/>

</div>

))}


</div>

<div className="mt-6">
  <label className="font-semibold block mb-2">
    Uploaded Pregnancy Report
  </label>

  {patient.pregnancy_report_url ? (
    <div className="space-y-3">
      <img
        src={patient.pregnancy_report_url}
        alt="Pregnancy Report"
        className="w-full max-w-lg rounded-xl border shadow"
      />

      <a
        href={patient.pregnancy_report_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Open Full Report
      </a>
    </div>
  ) : (
    <div className="text-gray-500 italic">
      No pregnancy report uploaded.
    </div>
  )}
</div>

</div>




<form
onSubmit={submit}
className="bg-white rounded-3xl shadow-lg p-6 space-y-5"
>


<h2 className="text-xl font-bold text-pink-700">
Midwife Registration Details
</h2>



<div className="grid md:grid-cols-2 gap-5">



<div>
<label className="font-semibold">
Assigned Clinic
</label>

<input
value={clinic?.clinic_name || "Loading clinic..."}
readOnly
className="border p-3 rounded-xl w-full bg-gray-100"
/>

</div>




<div>
<label className="font-semibold">
Hospital Clinic Name
</label>

<input
name="hospital_clinic_name"
value={form.hospital_clinic_name}
onChange={handleChange}
placeholder="Hospital Clinic Name"
className="border p-3 rounded-xl w-full"
/>

</div>




<div>
<label className="font-semibold">
Consultant Obstetrician
</label>

<input
name="consultant_obstetrician"
value={form.consultant_obstetrician}
readOnly
className="border p-3 rounded-xl w-full bg-gray-100"
/>

</div>




<div>
<label className="font-semibold">
Registration Date
</label>

<input
name="pregnant_mother_approved_date"
type="date"
value={form.pregnant_mother_approved_date}
onChange={handleChange}
className="border p-3 rounded-xl w-full"
/>

</div>



<div>
<label className="font-semibold">
PHM Area
</label>

<input
name="phm_area"
value={form.phm_area}
onChange={handleChange}
placeholder="PHM Area"
className="border p-3 rounded-xl w-full"
/>

</div>



<div>
<label className="font-semibold">
MOH Area
</label>

<input
name="moh_area"
value={form.moh_area}
onChange={handleChange}
placeholder="MOH Area"
className="border p-3 rounded-xl w-full"
/>

</div>




<div>
<label className="font-semibold">
Height (cm)
</label>

<input
name="height_cm"
type="number"
value={form.height_cm}
onChange={handleChange}
placeholder="Height in cm"
className="border p-3 rounded-xl w-full"
/>

</div>




<div>
<label className="font-semibold">
Weight (kg)
</label>

<input
name="weight_kg"
type="number"
value={form.weight_kg}
onChange={handleChange}
placeholder="Weight in kg"
className="border p-3 rounded-xl w-full"
/>

</div>




<div>
<label className="font-semibold">
BMI
</label>

<input
value={calculateBMI()}
readOnly
className="border p-3 rounded-xl w-full bg-green-50"
/>

</div>



</div>




<div>

<label className="font-semibold">
Antenatal Risk Conditions
</label>

<textarea
name="antenatal_risk_conditions"
value={form.antenatal_risk_conditions}
onChange={handleChange}
placeholder="Enter antenatal risk conditions"
className="border p-3 rounded-xl w-full h-32"
/>


</div>




<button
className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-bold"
>
Approve Patient Registration
</button>



</form>


</div>

);

}