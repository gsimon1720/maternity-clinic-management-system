import { useState,useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";

export default function PregnancyList(){

    const { id } = useParams();
    const navigate = useNavigate();

    const [pregnancies,setPregnancies] = useState([]);


    useEffect(()=>{

        const fetchPregnancies = async()=>{

            try{

                const res = await axios.get(
                    `http://localhost:5000/api/pregnancies/${id}`
                );

                setPregnancies(res.data);

            }catch(error){

                console.error(
                    "FETCH PREGNANCIES ERROR:",
                    error
                );

            }

        };


        fetchPregnancies();


    },[id]);



    return (

        <div>

            <h2 className="text-3xl font-bold text-pink-900 mb-6">
                Pregnancy History
            </h2>


            {
                pregnancies.length === 0 ? (

                    <div>

                        <button
                        onClick={()=>navigate(`/patient/${id}/add-pregnancy`)}
                        className="mb-6 bg-pink-600 text-white px-6 
                        py-3 rounded-xl hover:bg-pink-700"
                        >
                            + Add First Pregnancy
                        </button>


                        <div className="border rounded-3xl p-8 shadow text-center">

                            <p className="text-gray-600 mb-5">
                                No pregnancy records found for this patient.
                            </p>


                            <p className="text-gray-500">
                                Add the first pregnancy record to start entering
                                clinic care, labs, birth plan and delivery details.
                            </p>


                        </div>

                    </div>


                ) : (

                    <div>


                        <button
                        onClick={()=>navigate(`/midwife/pregnancy-requests`)}
                        className="mb-6 bg-pink-600 text-white px-6 
                        py-3 rounded-xl hover:bg-pink-700"
                        >
                            View Pregnancy Requests
                        </button>



                        <div className="grid md:grid-cols-2 gap-6">


                            {
                                pregnancies.map((pregnancy)=>(

                                    <div
                                    key={pregnancy.pregnancy_id}
                                    className="border rounded-3xl p-6 shadow"
                                    >


                                        <h3 className="text-xl font-bold text-pink-700">
                                            Pregnancy #{pregnancy.pregnancy_no}
                                        </h3>


                                        <p>
                                            Status:
                                            <b className="ml-2">
                                                {pregnancy.pregnancy_status}
                                            </b>
                                        </p>


                                        <p>
                                            EDD:
                                            {pregnancy.edd || "Not added"}
                                        </p>


                                        <p>
                                            LMP:
                                            {pregnancy.lmp || "Not added"}
                                        </p>


                                        <p>
                                            Gravida:
                                            {pregnancy.gravida || "Not added"}
                                        </p>


                                        <p>
                                            Parity:
                                            {pregnancy.parity || "Not added"}
                                        </p>



                                        <button
                                        onClick={()=>
                                            navigate(
                                                `/pregnancy/${pregnancy.pregnancy_id}`
                                            )
                                        }
                                        className="mt-4 bg-pink-600 text-white 
                                        px-5 py-2 rounded-xl hover:bg-pink-700"
                                        >
                                            View Pregnancy
                                        </button>


                                    </div>

                                ))
                            }


                        </div>


                    </div>

                )
            }


        </div>

    );

}