import {useState,useEffect} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";

export default function FamilyHistory(){
const {id}=useParams();
const initialForm={
diabetes:false,
hypertension:false,
twin_pregnancies:false,
congenital_disorders:false,
thalassemia:false,
sickle_cell_disease:false,
genetic_disorders:false,
psychiatric_illness:false,
other_conditions:""
};
const [formData,setFormData]=useState(initialForm);
const [loading,setLoading]=useState(true);
const [saved,setSaved]=useState(false);

useEffect(()=>{
const fetchHistory=async()=>{
try{
const res=await axios.get(`http://localhost:5000/api/family-history/${id}`);
if(res.data){
setFormData(res.data);
}
}catch(err){
console.error("Error loading family history:",err);
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
await axios.post("http://localhost:5000/api/family-history",{
patient_id:id,
...formData
});
setSaved(true);
}catch(err){
console.error("Save family history error:",err);
}
};

const conditions=[
["diabetes","Diabetes"],
["hypertension","Hypertension"],
["twin_pregnancies","Twin Pregnancies"],
["congenital_disorders","Congenital Disorders"],
["thalassemia","Thalassemia"],
["sickle_cell_disease","Sickle Cell Disease"],
["genetic_disorders","Genetic Disorders"],
["psychiatric_illness","Psychiatric Illness"]
];

if(loading){
return <div className="p-8 text-center text-pink-700 font-bold">Loading Family History...</div>;
}

return(
<div className="max-w-5xl space-y-6">
<div>
<h2 className="text-3xl font-bold text-pink-900">Family History</h2>
<p className="text-gray-500">This information is recorded once per patient</p>
</div>
<form onSubmit={handleSubmit} className="bg-pink-50 p-6 rounded-3xl border border-pink-100 space-y-6">
<div className="grid md:grid-cols-3 gap-4">
{conditions.map(([key,label])=>(
<label key={key} className="bg-white p-4 rounded-xl border flex items-center gap-3">
<input type="checkbox" name={key} checked={formData[key]||false} onChange={handleChange}/>
<span className="font-medium">{label}</span>
</label>
))}
</div>
<div>
<label className="font-bold">Other Conditions</label>
<textarea name="other_conditions" value={formData.other_conditions||""} onChange={handleChange} className="w-full border rounded-xl p-3 mt-2" placeholder="Enter other family conditions"/>
</div>
<Button type="submit">Save Family History</Button>
{saved&&<p className="text-green-600 font-bold">Family history saved successfully</p>}
</form>
</div>
);
}