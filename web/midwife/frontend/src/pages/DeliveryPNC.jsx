import {useState,useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';

export default function DeliveryPNC(){
  const {pregnancyId}=useParams();
  const [history,setHistory]=useState([]);
  const [expandedIndex,setExpandedIndex]=useState(0);

  const fetchHistory=async()=>{
    try{
      const res=await axios.get(
        `http://localhost:5000/api/pnc-visits/${pregnancyId}`
      );
      setHistory(res.data||[]);
    }catch(err){
      console.error("Error fetching PNC history:",err);
    }
  };

  useEffect(()=>{
    fetchHistory();
  },[pregnancyId]);

  const toggleExpand=(index)=>{
    setExpandedIndex(expandedIndex===index?null:index);
  };

  const label="text-xs text-gray-500 font-semibold";
  const value="text-base font-bold text-gray-900";

  return(
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="border-b border-pink-200 pb-4">
        <h2 className="text-3xl font-extrabold text-pink-950">
          Postnatal Care History
        </h2>
        <p className="text-pink-700 mt-2">
          Click a visit to expand details
        </p>
      </div>

      <div className="space-y-4">
        {history.length===0?(
          <div className="text-center text-gray-400 py-10">
            No postnatal records found
          </div>
        ):(
          history.map((v,i)=>{
            const open=expandedIndex===i;

            return(
              <div key={v.pnc_id} className="border rounded-2xl shadow-sm overflow-hidden">
                <div
                  onClick={()=>toggleExpand(i)}
                  className="p-5 bg-white flex justify-between cursor-pointer hover:bg-pink-50"
                >
                  <div className="flex gap-10">
                    <div>
                      <div className={label}>Date</div>
                      <div className="font-bold">
                        {new Date(v.visit_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <div className={label}>Visit Type</div>
                      <div className="font-bold text-pink-800">
                        {v.visit_type||'-'}
                      </div>
                    </div>
                  </div>

                  <div className="text-pink-800 font-bold">
                    {open?"▲":"▼"}
                  </div>
                </div>

                {open&&(
                  <div className="p-5 bg-gray-50 grid md:grid-cols-3 gap-6">

                    <div className="bg-white p-4 rounded-xl border space-y-2">
                      <h3 className="font-bold text-pink-800">
                        Mother
                      </h3>
                      <div>
                        Temp:
                        <span className={value}>
                          {v.mother_temp||'-'}
                        </span>
                      </div>
                      <div>
                        Anemia:
                        <span className={value}>
                          {v.mother_anemia||'-'}
                        </span>
                      </div>
                      <div>
                        Breasts:
                        <span className={value}>
                          {v.mother_breasts||'-'}
                        </span>
                      </div>
                      <div>
                        Uterus:
                        <span className={value}>
                          {v.uterine_involution||'-'}
                        </span>
                      </div>
                      <div>
                        Lochia:
                        <span className={value}>
                          {v.lochia_type||'-'}
                        </span>
                      </div>
                      <div>
                        EPDS:
                        <span className={value}>
                          {v.epds_status||'-'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border space-y-2">
                      <h3 className="font-bold text-red-600">
                        Danger Signs
                      </h3>
                      <div>
                        Abdominal Pain: {v.upper_abdominal_pain||'-'}
                      </div>
                      <div>
                        Vomiting: {v.vomiting||'-'}
                      </div>
                      <div>
                        Breathing: {v.difficulty_breathing||'-'}
                      </div>
                      <div>
                        DVT Pain: {v.calf_pain_dvt||'-'}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border space-y-2">
                      <h3 className="font-bold text-blue-700">
                        Baby
                      </h3>
                      <div>
                        Distress: {v.child_distress_signs||'-'}
                      </div>
                      <div>
                        Fever: {v.child_fever||'-'}
                      </div>
                      <div>
                        Cord: {v.umbilical_cord_status||'-'}
                      </div>
                      <div>
                        Sucking: {v.child_sucking_ability||'-'}
                      </div>
                      <div>
                        BCG: {v.bcg_vaccination||'-'}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}