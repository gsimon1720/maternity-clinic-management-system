import { Outlet, NavLink, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function PregnancyLayout(){

    const { pregnancyId } = useParams();

    const [pregnancy,setPregnancy] = useState(null);
    const [patient,setPatient] = useState(null);

    useEffect(()=>{

        const fetchData = async()=>{

            try{

                const pregnancyRes = await axios.get(
                    `http://localhost:5000/api/pregnancy/${pregnancyId}`
                );

                const pregnancyData = pregnancyRes.data;

                setPregnancy(pregnancyData);


                const patientRes = await axios.get(
                    `http://localhost:5000/api/patients/${pregnancyData.patient_id}`
                );

                setPatient(patientRes.data);


            }catch(err){

                console.error("Error loading pregnancy details:",err);

            }

        };


        fetchData();

    },[pregnancyId]);


    const sections = [

        {
            name:'Past Obstetric History',
            path:`/pregnancy/${pregnancyId}/past-obstetric-history`
        },
        {
            name:'Clinic Care',
            path:`/pregnancy/${pregnancyId}/clinic-care`
        },
        {
            name:'Lab Tests',
            path:`/pregnancy/${pregnancyId}/labs`
        },
        {
            name:'Birth Plan',
            path:`/pregnancy/${pregnancyId}/birth-plan`
        },
        {
            name:'Delivery & Postnatal Care',
            path:`/pregnancy/${pregnancyId}/delivery-pnc`
        },
        {
        name:'Delivery Details',
        path:`/pregnancy/${pregnancyId}/delivery-details`
        }

    ];


    return (

        <div className="flex flex-col min-h-full gap-6 pb-10">


            {/* PATIENT HEADER */}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">

                <h1 className="text-3xl font-bold text-pink-900">

                    {
                        patient
                        ? `${patient.first_name} ${patient.last_name}`
                        : "Loading..."
                    }

                </h1>


                <p className="text-gray-500 font-medium">
                    Patient ID: #{patient?.patient_id}
                </p>


                <p className="text-pink-700 font-semibold mt-2">
                    Pregnancy No: {pregnancy?.pregnancy_no || pregnancyId}
                </p>

            </div>



            <div className="flex gap-8 items-start">


                {/* PREGNANCY NAVBAR */}

                <aside className="w-64 bg-pink-100 rounded-3xl p-4 shrink-0">


                    {
                        sections.map(section=>(

                            <NavLink

                                key={section.name}

                                to={section.path}

                                className={({isActive})=>
                                    `block p-3 mb-2 rounded-xl font-medium transition ${
                                        isActive
                                        ?"bg-white text-pink-700 shadow-sm"
                                        :"text-pink-900 hover:bg-pink-200"
                                    }`
                                }

                            >

                                {section.name}

                            </NavLink>

                        ))
                    }


                </aside>



                {/* PAGE CONTENT */}

                <main className="flex-1 bg-white rounded-3xl p-8 shadow-sm border border-pink-100">


                    <h1 className="text-2xl font-bold text-pink-900 mb-5">

                        Pregnancy #{pregnancy?.pregnancy_no || pregnancyId}

                    </h1>


                    <Outlet/>


                </main>


            </div>


        </div>

    );

}