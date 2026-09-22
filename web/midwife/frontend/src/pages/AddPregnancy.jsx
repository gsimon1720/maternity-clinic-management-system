import {useState,useEffect} from "react";
import {useParams,useNavigate,useSearchParams} from "react-router-dom";
import axios from "axios";


export default function AddPregnancy(){

const {id}=useParams();
const navigate=useNavigate();
const [searchParams]=useSearchParams();

const requestId=searchParams.get("requestId");


const [summary,setSummary]=useState({

pregnancy_no:"",
gravida:"",
parity:"",
living_children:"",
clinic_id:""

});


const [doctor,setDoctor]=useState(null);



const [form,setForm]=useState({

youngest_child_age:"",

lmp:"",

edd:"",

corrected_edd:"",

poa_at_registration:"",

poa_at_dating_scan:"",

quickening_date:"",

family_planning_before_pregnancy:"",

antenatal_risk_conditions:""

});



const [error,setError]=useState("");

const [loading,setLoading]=useState(true);




// ===============================
// LOAD SUMMARY + DOCTOR
// ===============================

useEffect(()=>{


const loadData=async()=>{


try{


const res=await axios.get(

`http://localhost:5000/api/pregnancy-summary/${id}`

);


setSummary(res.data);



// get doctor for clinic

if(res.data.clinic_id){


const doctorRes=await axios.get(

`http://localhost:5000/api/clinic/${res.data.clinic_id}/doctor`

);


setDoctor(
doctorRes.data
);


}



}catch(err){


console.error(
"LOAD DATA ERROR",
err
);


setError(
"Unable to load pregnancy information"
);


}
finally{

setLoading(false);

}


};



loadData();


},[id]);






// ===============================
// HANDLE INPUT CHANGE
// ===============================


const handleChange=(e)=>{


const {
name,
value
}=e.target;



// LMP calculation

if(name==="lmp" && value){


const lmpDate=new Date(value);



lmpDate.setDate(
lmpDate.getDate()+280
);



const calculatedEDD=

lmpDate
.toISOString()
.split("T")[0];




// calculate POA

const today=new Date();

const lmpOriginal=new Date(value);



const difference=Math.floor(

(today-lmpOriginal)

/

(1000*60*60*24)

);



const poaWeeks=Math.floor(

difference/7

);




setForm({

...form,

lmp:value,

edd:calculatedEDD,

corrected_edd:calculatedEDD,

poa_at_registration:poaWeeks

});



}

else{


setForm({

...form,

[name]:value

});


}


};






// ===============================
// SAVE PREGNANCY
// ===============================


const handleSubmit=async(e)=>{


e.preventDefault();

setError("");



try{


const response=await axios.post(

"http://localhost:5000/api/pregnancies",

{


patient_id:id,


pregnancy_no:
summary.pregnancy_no,


gravida:
summary.gravida,


parity:
summary.parity,


living_children:
summary.living_children,


youngest_child_age:
form.youngest_child_age,


lmp:
form.lmp,


edd:
form.edd,


antenatal_risk_conditions:
form.antenatal_risk_conditions,



// present obstetric history

corrected_edd:
form.corrected_edd,


poa_at_registration:
form.poa_at_registration,


poa_at_dating_scan:
form.poa_at_dating_scan,


quickening_date:
form.quickening_date,


family_planning_before_pregnancy:
form.family_planning_before_pregnancy,


doctor_signature:
doctor?.full_name || null


}

);





// complete request

if(requestId){


await axios.put(

`http://localhost:5000/api/midwife/pregnancy-request/${requestId}/complete`

);


}




navigate(

`/pregnancy/${response.data.pregnancy_id}`

);



}catch(err){


console.error(

"ADD PREGNANCY ERROR",

err.response?.data || err.message

);



setError(

err.response?.data?.message ||

"Failed to create pregnancy"

);


}


};





if(loading){

return(

<div className="text-pink-700 font-semibold">

Loading pregnancy information...

</div>

);

}




return(

<div>


<h2 className="text-3xl font-bold text-pink-900 mb-6">

Add New Pregnancy

</h2>




{
error &&

<div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4">

{error}

</div>

}




<form

onSubmit={handleSubmit}

className="space-y-5"

>



<div className="grid md:grid-cols-4 gap-4">


<div>

<label>
Pregnancy Number
</label>

<input

value={summary.pregnancy_no}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>

</div>



<div>

<label>
Gravida (G)
</label>

<input

value={summary.gravida}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>

</div>




<div>

<label>
Parity (P)
</label>

<input

value={summary.parity}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>

</div>




<div>

<label>
Living Children
</label>

<input

value={summary.living_children}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>

</div>


</div>






<input

name="youngest_child_age"

placeholder="Youngest Child Age"

value={form.youngest_child_age}

onChange={handleChange}

className="border p-3 rounded-xl w-full"

/>





<label>
Last Menstrual Period (LMP)
</label>


<input

type="date"

name="lmp"

value={form.lmp}

onChange={handleChange}

className="border p-3 rounded-xl w-full"

/>





<label>
Expected Delivery Date (EDD)
</label>


<input

type="date"

value={form.edd}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>





<label>
Corrected EDD
</label>


<input

type="date"

value={form.corrected_edd}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>

<p className="text-sm text-gray-500">

Initially same as EDD. Doctor can update after dating scan.

</p>





<label>
POA At Registration (Weeks)
</label>


<input

value={form.poa_at_registration}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>





<label>
POA At Dating Scan
</label>


<input

type="number"

name="poa_at_dating_scan"

value={form.poa_at_dating_scan}

onChange={handleChange}

className="border p-3 rounded-xl w-full"

/>





<label>
Quickening Date
</label>


<input

type="date"

name="quickening_date"

value={form.quickening_date}

onChange={handleChange}

className="border p-3 rounded-xl w-full"

/>





<label>
Family Planning Before Pregnancy
</label>


<textarea

name="family_planning_before_pregnancy"

value={form.family_planning_before_pregnancy}

onChange={handleChange}

className="border p-3 rounded-xl w-full"

/>






<label>
Consultant Obstetrician
</label>


<input

value={
doctor?.full_name || "Loading doctor..."
}

readOnly

className="border p-3 rounded-xl w-full bg-gray-100"

/>






<label>
Antenatal Risk Conditions
</label>


<select

name="antenatal_risk_conditions"

value={form.antenatal_risk_conditions}

onChange={handleChange}

className="border p-3 rounded-xl w-full"

>


<option value="">
Select Risk Condition
</option>


<option value="NONE">
No Risk
</option>


<option value="HIGH_BLOOD_PRESSURE">
High Blood Pressure
</option>


<option value="GESTATIONAL_DIABETES">
Gestational Diabetes
</option>


<option value="PREVIOUS_C_SECTION">
Previous C-Section
</option>


<option value="MULTIPLE_PREGNANCY">
Multiple Pregnancy
</option>


<option value="PREVIOUS_COMPLICATIONS">
Previous Pregnancy Complications
</option>


<option value="OTHER">
Other
</option>


</select>






<button

type="submit"

className="bg-pink-600 text-white px-6 py-3 rounded-xl"

>

Save Pregnancy

</button>




</form>


</div>

);

}