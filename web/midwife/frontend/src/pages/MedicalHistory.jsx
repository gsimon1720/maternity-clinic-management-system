import {useState,useEffect} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";

export default function MedicalHistory(){

const {id}=useParams();

const initialForm={
diabetes:false,
hypertension:false,
cardiac_disease:false,
renal_disease:false,
hepatic_disease:false,
thyroid_disease:false,
bronchial_asthma:false,
epilepsy:false,
psychiatric_illness:false,
tuberculosis:false,
malignancy:false,
previous_dvt:false,
previous_surgeries:"",
blood_transfusion_history:false,
drug_allergies:"",
other_conditions:""
};

const [formData,setFormData]=useState(initialForm);
const [loading,setLoading]=useState(true);
const [saved,setSaved]=useState(false);

useEffect(()=>{

const fetchHistory=async()=>{

try{

const res=await axios.get(
`http://localhost:5000/api/medical-history/${id}`
);

if(res.data){
setFormData(res.data);
}

}catch(err){

console.error("Error loading medical history:",err);

}finally{

setLoading(false);

}

};

fetchHistory();

},[id]);


const handleChange=(e)=>{

const {name,type,checked,value}=e.target;

setFormData({
...formData,
[name]:type==="checkbox"?checked:value
});

};


const handleSubmit=async(e)=>{

e.preventDefault();

try{

await axios.post(
"http://localhost:5000/api/medical-history",
{
patient_id:id,
...formData
}
);

setSaved(true);

}catch(err){

console.error("Save error:",err);

}

};


const diseases=[
["diabetes","Diabetes"],
["hypertension","Hypertension"],
["cardiac_disease","Cardiac Disease"],
["renal_disease","Renal Disease"],
["hepatic_disease","Hepatic Disease"],
["thyroid_disease","Thyroid Disease"],
["bronchial_asthma","Bronchial Asthma"],
["epilepsy","Epilepsy"],
["psychiatric_illness","Psychiatric Illness"],
["tuberculosis","Tuberculosis"],
["malignancy","Malignancy"],
["previous_dvt","Previous DVT"],
["blood_transfusion_history","Blood Transfusion History"]
];


if(loading)
return <div className="p-8 text-center text-pink-700 font-bold">Loading Medical History...</div>;


return(

<div className="max-w-5xl space-y-6">

<div>
<h2 className="text-3xl font-bold text-pink-900">
Medical & Surgical History
</h2>

<p className="text-gray-500">
This information is recorded once per patient
</p>

</div>


<form
onSubmit={handleSubmit}
className="bg-pink-50 p-6 rounded-3xl border border-pink-100 space-y-6"
>


<div className="grid md:grid-cols-3 gap-4">

{
diseases.map(([key,label])=>(

<label
key={key}
className="bg-white p-4 rounded-xl border flex gap-3 items-center"
>

<input
type="checkbox"
name={key}
checked={formData[key]||false}
onChange={handleChange}
/>

<span className="font-medium">
{label}
</span>

</label>

))
}

</div>


<div>

<label className="font-bold">
Previous Surgeries
</label>

<textarea
name="previous_surgeries"
value={formData.previous_surgeries||""}
onChange={handleChange}
className="w-full border rounded-xl p-3 mt-2"
/>

</div>


<div>

<label className="font-bold">
Drug Allergies
</label>

<textarea
name="drug_allergies"
value={formData.drug_allergies||""}
onChange={handleChange}
className="w-full border rounded-xl p-3 mt-2"
/>

</div>


<div>

<label className="font-bold">
Other Conditions
</label>

<textarea
name="other_conditions"
value={formData.other_conditions||""}
onChange={handleChange}
className="w-full border rounded-xl p-3 mt-2"
/>

</div>


<Button type="submit">
Save Medical History
</Button>


{
saved &&
<p className="text-green-600 font-bold">
Medical history saved successfully
</p>
}


</form>

</div>

);

}