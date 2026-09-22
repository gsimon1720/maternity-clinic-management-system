import { useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";

export default function DeliveryDetails(){

const {pregnancyId}=useParams();
const navigate=useNavigate();

const [outcome,setOutcome]=useState("DELIVERY");

const [numberOfBabies,setNumberOfBabies]=useState(1);


const [delivery,setDelivery]=useState({
delivery_date:"",
delivery_method:"",
mother_condition:""
});


const [babies,setBabies]=useState([
{
baby_number:1,
gender:"",
birth_date:"",
birth_time:"",
birth_weight:"",
birth_length:"",
birth_status:"ALIVE"
}
]);



const handleDeliveryChange=(e)=>{

setDelivery({
...delivery,
[e.target.name]:e.target.value
});

};



const handleOutcomeChange=(e)=>{

setOutcome(e.target.value);

};



const handleBabyCount=(e)=>{

const count=Number(e.target.value);

setNumberOfBabies(count);


const newBabies=[];


for(let i=1;i<=count;i++){

newBabies.push({

baby_number:i,
gender:"",
birth_date:"",
birth_time:"",
birth_weight:"",
birth_length:"",
birth_status:"ALIVE"

});

}


setBabies(newBabies);

};




const handleBabyChange=(index,e)=>{

const updated=[...babies];

updated[index][e.target.name]=e.target.value;

setBabies(updated);

};




const saveDelivery=async(e)=>{

e.preventDefault();


try{


await axios.post(
`http://localhost:5000/api/pregnancy/${pregnancyId}/babies`,
{
outcome,
delivery,
babies
}
);



alert("Pregnancy outcome saved");


navigate(
`/pregnancy/${pregnancyId}`
);


}catch(err){

console.error(
"SAVE OUTCOME ERROR",
err.response?.data || err.message
);

alert("Failed to save outcome");

}


};



return(

<div>

<h2 className="text-3xl font-bold text-pink-900 mb-6">
Pregnancy Outcome
</h2>


<form
onSubmit={saveDelivery}
className="space-y-6"
>



<div>

<label>
Outcome
</label>


<select
value={outcome}
onChange={handleOutcomeChange}
className="border p-3 rounded-xl w-full"
>


<option value="DELIVERY">
Delivery
</option>


<option value="MISCARRIAGE">
Miscarriage
</option>


<option value="TERMINATED">
Terminated
</option>


<option value="REFERRED">
Referred
</option>


</select>


</div>



{
outcome==="DELIVERY" &&

<>

<div>

<label>
Delivery Date
</label>


<input
type="date"
name="delivery_date"
value={delivery.delivery_date}
onChange={handleDeliveryChange}
className="border p-3 rounded-xl w-full"
/>


</div>




<div>

<label>
Delivery Method
</label>


<select
name="delivery_method"
value={delivery.delivery_method}
onChange={handleDeliveryChange}
className="border p-3 rounded-xl w-full"
>


<option value="">
Select Method
</option>


<option value="NORMAL">
Normal Delivery
</option>


<option value="C_SECTION">
C Section
</option>


<option value="ASSISTED">
Assisted Delivery
</option>


</select>


</div>




<div>

<label>
Mother Condition
</label>


<select
name="mother_condition"
value={delivery.mother_condition}
onChange={handleDeliveryChange}
className="border p-3 rounded-xl w-full"
>


<option value="">
Select Condition
</option>


<option value="GOOD">
Good
</option>


<option value="COMPLICATIONS">
Complications
</option>


</select>


</div>





<div>

<label>
Number of Babies
</label>


<select
value={numberOfBabies}
onChange={handleBabyCount}
className="border p-3 rounded-xl w-full"
>


<option value="1">
1 Baby
</option>


<option value="2">
Twins
</option>


<option value="3">
Triplets
</option>


</select>


</div>




{
babies.map((baby,index)=>(

<div
key={index}
className="border rounded-3xl p-5 bg-pink-50"
>


<h3 className="text-xl font-bold text-pink-700">
Baby {baby.baby_number}
</h3>



<select
name="gender"
value={baby.gender}
onChange={(e)=>handleBabyChange(index,e)}
className="border p-3 rounded-xl w-full mb-3"
>


<option value="">
Gender
</option>


<option value="MALE">
Male
</option>


<option value="FEMALE">
Female
</option>


</select>




<input
name="birth_weight"
placeholder="Birth Weight (kg)"
value={baby.birth_weight}
onChange={(e)=>handleBabyChange(index,e)}
className="border p-3 rounded-xl w-full mb-3"
/>




<input
name="birth_length"
placeholder="Birth Length (cm)"
value={baby.birth_length}
onChange={(e)=>handleBabyChange(index,e)}
className="border p-3 rounded-xl w-full mb-3"
/>




<select
name="birth_status"
value={baby.birth_status}
onChange={(e)=>handleBabyChange(index,e)}
className="border p-3 rounded-xl w-full"
>


<option value="ALIVE">
Alive
</option>


<option value="STILL_BIRTH">
Still Birth
</option>


</select>



</div>

))
}

</>

}



<button
type="submit"
className="bg-pink-600 text-white px-6 py-3 rounded-xl"
>

Save Outcome

</button>


</form>


</div>

);


}