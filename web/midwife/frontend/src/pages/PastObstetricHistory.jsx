import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';

export default function PastObstetricHistory() {

  const { pregnancyId } = useParams();

  const [history, setHistory] = useState([]);


  const initialForm = {

    pregnancy_number: '',
    year_of_delivery: '',
    outcome: 'Live Birth',
    sex: 'Male',
    birth_weight_kg: '',
    mode_of_delivery: 'Normal',
    antenatal_complications: ''

  };


  const [formData, setFormData] = useState(initialForm);



  // GET HISTORY

  const fetchHistory = async () => {

    try {

      const res = await axios.get(
        `http://localhost:5000/api/past-obstetric-history/${pregnancyId}`
      );

      setHistory(res.data);


    } catch(err){

      console.error(
        "Error fetching past obstetric history:",
        err
      );

    }

  };



  useEffect(()=>{

    fetchHistory();

  },[pregnancyId]);




  const handleChange = (e)=>{

    setFormData({

      ...formData,
      [e.target.name]: e.target.value

    });

  };





  const handleSubmit = async(e)=>{

    e.preventDefault();


    try{


      await axios.post(

        'http://localhost:5000/api/past-obstetric-history',

        {

          pregnancy_id: pregnancyId,

          ...formData

        }

      );


      alert("Record saved successfully");


      setFormData(initialForm);


      fetchHistory();



    }catch(err){


      console.error(err);


      alert(
        "Error saving record: "
        +
        (err.response?.data?.error || err.message)
      );


    }


  };




  const inputClass =
  "w-full border border-pink-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-pink-500";



  const labelClass =
  "block text-xs font-bold text-pink-900 mb-1 uppercase";




return (

<div className="max-w-5xl space-y-8">



{/* FORM */}

<form
onSubmit={handleSubmit}
className="bg-pink-50 p-6 rounded-3xl border border-pink-100 shadow"
>


<h2 className="text-2xl font-bold text-pink-900 mb-6">
Past Obstetric History
</h2>



<div className="grid md:grid-cols-4 gap-5 bg-white p-5 rounded-2xl">


<div>

<label className={labelClass}>
Pregnancy Number
</label>

<input

required

type="number"

name="pregnancy_number"

value={formData.pregnancy_number}

onChange={handleChange}

className={inputClass}

/>

</div>




<div>

<label className={labelClass}>
Year of Delivery
</label>

<input

required

type="number"

name="year_of_delivery"

value={formData.year_of_delivery}

onChange={handleChange}

className={inputClass}

/>

</div>





<div>

<label className={labelClass}>
Outcome
</label>


<select

name="outcome"

value={formData.outcome}

onChange={handleChange}

className={inputClass}

>


<option>Live Birth</option>

<option>Stillbirth</option>

<option>Miscarriage</option>

<option>Abortion</option>


</select>


</div>






<div>

<label className={labelClass}>
Child Sex
</label>


<select

name="sex"

value={formData.sex}

onChange={handleChange}

className={inputClass}

>


<option>Male</option>

<option>Female</option>

<option>Unknown</option>


</select>


</div>


</div>







<div className="grid md:grid-cols-3 gap-5 bg-white p-5 rounded-2xl mt-5">



<div>

<label className={labelClass}>
Birth Weight (kg)
</label>


<input

type="number"

step="0.1"

name="birth_weight_kg"

value={formData.birth_weight_kg}

onChange={handleChange}

className={inputClass}

/>


</div>





<div>

<label className={labelClass}>
Delivery Mode
</label>


<select

name="mode_of_delivery"

value={formData.mode_of_delivery}

onChange={handleChange}

className={inputClass}

>


<option>Normal</option>

<option>C-Section</option>

<option>Vacuum</option>

<option>Forceps</option>


</select>


</div>






<div>

<label className={labelClass}>
Complications
</label>


<input

type="text"

name="antenatal_complications"

value={formData.antenatal_complications}

onChange={handleChange}

placeholder="None"

className={inputClass}

/>


</div>


</div>




<Button
type="submit"
className="w-full mt-5"
>

Save Record

</Button>



</form>







{/* TABLE */}


<div className="bg-white rounded-3xl border shadow overflow-hidden">


<div className="bg-pink-100 p-4 font-bold text-pink-900">

Previous Pregnancies

</div>




<table className="w-full text-sm">


<thead>

<tr className="bg-pink-50 text-left">


<th className="p-3">
No
</th>


<th className="p-3">
Year
</th>


<th className="p-3">
Outcome
</th>


<th className="p-3">
Sex
</th>


<th className="p-3">
Weight
</th>


<th className="p-3">
Delivery
</th>


<th className="p-3">
Complications
</th>


</tr>

</thead>





<tbody>


{
history.length===0 ?


<tr>

<td
colSpan="7"
className="text-center p-8 text-gray-400"
>

No records found

</td>

</tr>



:


history.map((h)=>(
<tr
key={h.history_id}
className="border-t"
>


<td className="p-3 font-bold">
G{h.pregnancy_number}
</td>



<td className="p-3">
{h.year_of_delivery}
</td>



<td className="p-3">
{h.outcome}
</td>



<td className="p-3">
{h.sex}
</td>



<td className="p-3">
{
h.birth_weight_kg
?
`${h.birth_weight_kg} kg`
:
'-'
}
</td>




<td className="p-3">
{h.mode_of_delivery}
</td>




<td className="p-3">
{
h.antenatal_complications
||
"None"
}
</td>



</tr>

))

}


</tbody>



</table>


</div>




</div>


);


}