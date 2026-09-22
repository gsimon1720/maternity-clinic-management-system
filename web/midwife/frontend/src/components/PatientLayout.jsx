import { Outlet, NavLink, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PatientLayout() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        console.log("Fetching patient:", id);

        const res = await axios.get(
          `http://localhost:5000/api/patients/${id}`
        );

        console.log("Patient received:", res.data);

        setPatient(res.data);

      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();

  }, [id]);


  const sections = [
    {
      name: "Pregnancy History",
      path: `/patient/${id}/pregnancies`
    },
    {
      name: "Medical History",
      path: `/patient/${id}/medical-history`
    },
    {
      name: "Family History",
      path: `/patient/${id}/family-history`
    }
  ];


  return (
    <div className="flex flex-col min-h-full gap-6 pb-10">

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">

        <h1 className="text-3xl font-bold text-pink-900">
          {
            loading
              ? "Loading..."
              : `${patient.first_name} ${patient.last_name}`
          }
        </h1>

        <p className="text-gray-500 font-medium">
          Patient ID: #{id}
        </p>

      </div>


      <div className="flex gap-8 items-start">

        <aside className="w-64 shrink-0 bg-pink-100 rounded-3xl p-4 sticky top-0">

          <nav className="flex flex-col gap-2">

            {sections.map((section) => (

              <NavLink
                key={section.name}
                to={section.path}
                className={({ isActive }) =>
                  `p-4 rounded-2xl font-medium transition-all ${
                    isActive
                    ? "bg-white text-pink-700 shadow-sm"
                    : "text-pink-900 hover:bg-pink-200"
                  }`
                }
              >
                {section.name}
              </NavLink>

            ))}

          </nav>

        </aside>


        <main className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-pink-100">

          <Outlet />

        </main>


      </div>

    </div>
  );
}