console.log("✅ Backend started");
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const multer=require("multer");
const path=require("path");
require('dotenv').config();

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());


app.use(
"/reports",
express.static(path.join(__dirname,"reports"))
);

app.use(
"/uploads",
express.static(path.join(__dirname,"uploads"))
);

const storage=multer.diskStorage({
destination:(req,file,cb)=>{
cb(null,"uploads/");
},
filename:(req,file,cb)=>{
cb(null,Date.now()+path.extname(file.originalname));
}
});
const upload=multer({storage});

// ==========================================
// HELPER: AUTO-GENERATE REGISTRATION NUMBER
// ==========================================
const generateRegistrationNumber = async () => {
  const currentYear = new Date().getFullYear();
  const result = await pool.query(
    "SELECT COUNT(*) FROM patient WHERE registration_number LIKE $1",
    [`ANC-${currentYear}-%`]
  );
  const currentCount = parseInt(result.rows[0].count, 10);
  const nextSequence = String(currentCount + 1).padStart(4, '0');
  return `ANC-${currentYear}-${nextSequence}`;
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================



// 2. MIDWIFE LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const userQuery = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const user = userQuery.rows[0];

    // Only MIDWIFE role can login
    if (user.role !== 'MIDWIFE') {
      return res.status(403).json({
        error: "Only midwives can login."
      });
    }

    // Only ACTIVE midwives can login
    if (user.status !== 'active') {
      return res.status(403).json({
        error: "Your account is inactive. Please contact the administrator."
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Update last login
    await pool.query(
      `
      UPDATE users
      SET last_login = NOW()
      WHERE user_id = $1
      `,
      [user.user_id]
    );

    // Login successful
    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        clinic_id: user.clinic_id,
        area_id: user.area_id
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// ==========================================
// MIDWIFE DASHBOARD DATA
// ==========================================

app.get('/api/dashboard/:midwife_id', async(req,res)=>{

  try{

    const { midwife_id } = req.params;


    // ==========================================
    // TOTAL REGISTERED PATIENTS
    // ==========================================

    const totalPatientsResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM patient
      WHERE assigned_midwife_id=$1
      AND status='approved'
      `,
      [midwife_id]
    );


    const totalPatients = parseInt(
      totalPatientsResult.rows[0].count,
      10
    );



    // ==========================================
    // ACTIVE PREGNANCIES
    // ==========================================

    const activePregnanciesResult = await pool.query(
      `
      SELECT COUNT(*)
      FROM pregnancy p

      JOIN patient pt
      ON p.patient_id = pt.patient_id

      WHERE pt.assigned_midwife_id=$1
      AND p.pregnancy_status='ACTIVE'
      `,
      [midwife_id]
    );


    const activePregnancies = parseInt(
      activePregnanciesResult.rows[0].count,
      10
    );



    // ==========================================
    // NEW PREGNANCY REQUESTS (2nd,3rd,4th...)
    // ==========================================

    const pregnancyRequestsResult = await pool.query(
      `
      SELECT

      pr.request_id,
      pr.report_image,
      pr.request_date,
      pr.status,

      p.patient_id,
      p.first_name,
      p.last_name,
      p.nic,

      COUNT(pg.pregnancy_id) AS pregnancy_count


      FROM pregnancy_request pr


      JOIN patient p
      ON pr.patient_id=p.patient_id


      LEFT JOIN pregnancy pg
      ON p.patient_id=pg.patient_id


      WHERE pr.status='PENDING'
      AND p.assigned_midwife_id=$1


      GROUP BY
      pr.request_id,
      p.patient_id,
      p.first_name,
      p.last_name,
      p.nic,
      pr.report_image,
      pr.request_date,
      pr.status


      ORDER BY pr.request_date DESC

      LIMIT 5

      `,
      [midwife_id]
    );




    // ==========================================
    // PENDING PATIENT REGISTRATIONS
    // ==========================================

    const pendingRegistrationsResult = await pool.query(
      `
      SELECT
    p.patient_id,
    p.first_name,
    p.last_name,
    p.nic,
    p.phone,
    p.email,
    p.address,
    p.status,
    p.created_at,
    p.area_id,
    p.zone_id,
    a.area_name,
    z.zone_name

FROM users u

JOIN patient p
    ON p.area_id = u.area_id

LEFT JOIN areas a
    ON p.area_id = a.area_id

LEFT JOIN zones z
    ON p.zone_id = z.zone_id

WHERE
    u.user_id = $1
    AND u.role = 'MIDWIFE'
    AND p.status = 'pending'

ORDER BY p.created_at DESC

LIMIT 5

      `,
      [midwife_id]
    );



    res.json({

      totalPatients,

      activePregnancies,

      pregnancyRequests:
      pregnancyRequestsResult.rows,


      pendingRegistrations:
      pendingRegistrationsResult.rows

    });



  }catch(err){


    console.error(
      "DASHBOARD ERROR:",
      err.message
    );


    res.status(500).json({
      error:err.message
    });


  }

});

/* ==============================
   ZONES
================================= */

// Get all zones
app.get('/api/zones',async(req,res)=>{
    try{
        const result=await pool.query(
            `
            SELECT
                z.zone_id,
                z.zone_name,
                z.area_id,
                a.area_name
            FROM zones z
            JOIN areas a
            ON z.area_id=a.area_id
            ORDER BY a.area_name,z.zone_name
            `
        );
        res.json(result.rows);
    }catch(err){
        console.error("ZONE ERROR:",err);
        res.status(500).json({error:err.message});
    }
});


app.get('/api/clinic/:clinicId',async(req,res)=>{
try{
const result=await pool.query(
`
SELECT clinic_id,clinic_name
FROM clinics
WHERE clinic_id=$1
`,
[req.params.clinicId]
);
if(result.rows.length===0){
return res.status(404).json({error:"Clinic not found"});
}
res.json(result.rows[0]);
}catch(err){
console.error("FETCH CLINIC ERROR:",err);
res.status(500).json({error:err.message});
}
});


// Get consultant obstetrician by clinic
app.get('/api/clinic/:clinicId/doctor',async(req,res)=>{
try{

const {clinicId}=req.params;

const result=await pool.query(
`
SELECT
user_id,
full_name
FROM users
WHERE clinic_id=$1
AND role='DOCTOR'
AND status='active'
LIMIT 1
`,
[clinicId]
);


if(result.rows.length===0){
return res.status(404).json({
error:"Doctor not found for this clinic"
});
}

res.json(result.rows[0]);


}catch(err){

console.error("FETCH CLINIC DOCTOR ERROR:",err);

res.status(500).json({
error:err.message
});

}
});

app.get('/api/pregnancy/:pregnancyId',async(req,res)=>{
  try{
    const result=await pool.query(
      `
      SELECT *
      FROM pregnancy
      WHERE pregnancy_id=$1
      `,
      [req.params.pregnancyId]
    );

    if(result.rows.length===0){
      return res.status(404).json({
        error:"Pregnancy not found"
      });
    }

    res.json(result.rows[0]);

  }catch(err){
    console.error(err);
    res.status(500).json({
      error:err.message
    });
  }
});

/* ==============================
   PATIENT MANAGEMENT
================================= */



app.get('/api/pregnancies/:patientId', async(req,res)=>{

    try{

        const result = await pool.query(
        `
        SELECT *
        FROM pregnancy
        WHERE patient_id=$1
        ORDER BY pregnancy_no ASC
        `,
        [
            req.params.patientId
        ]);


        res.json(result.rows);


    }catch(error){

        console.error(error);

        res.status(500).json({
            error:error.message
        });

    }

});

// Pending patients
// GET pending patients for logged-in midwife
app.get('/api/midwife/pending-patients/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
`
SELECT
p.patient_id,
p.first_name,
p.last_name,
p.nic,
p.phone,
p.email,
p.address,
p.status,
p.area_id,
p.zone_id,
a.area_name,
z.zone_name
FROM users u
JOIN patient p
ON p.area_id = u.area_id
LEFT JOIN areas a
ON p.area_id = a.area_id
LEFT JOIN zones z
ON p.zone_id = z.zone_id
WHERE 
u.user_id = $1
AND u.role = 'MIDWIFE'
AND p.status = 'pending'
ORDER BY p.created_at DESC
`,
[userId]
    );

    res.json(result.rows);

  } catch(err) {
    console.error("MIDWIFE PENDING PATIENT ERROR:",err);
    res.status(500).json({
      error:err.message
    });
  }
});

app.get('/api/midwife/patient/:id',async(req,res)=>{
    try{
        const result=await pool.query(
            `
            SELECT
                p.*,
                a.area_name,
                z.zone_name
            FROM patient p
            LEFT JOIN areas a
            ON p.area_id=a.area_id
            LEFT JOIN zones z
            ON p.zone_id=z.zone_id
            WHERE p.patient_id=$1
            `,
            [
                req.params.id
            ]
        );
        if(result.rows.length===0){
            return res.status(404).json({error:"Patient not found"});
        }
        res.json(result.rows[0]);
    }catch(err){
        console.error("MIDWIFE PATIENT FETCH ERROR:",err);
        res.status(500).json({error:err.message});
    }
});


// GET pending patients assigned to logged-in midwife
app.get('/api/midwife/pending-patients/:userId',async(req,res)=>{
try{

const {userId}=req.params;

const result=await pool.query(
`
SELECT
p.patient_id,
p.first_name,
p.last_name,
p.nic,
p.email,
p.phone,
p.address,
p.status,
a.area_name,
z.zone_name

FROM patient p

LEFT JOIN areas a
ON p.area_id=a.area_id

LEFT JOIN zones z
ON p.zone_id=z.zone_id

WHERE
p.assigned_midwife_id=$1
AND
p.status='pending'

ORDER BY p.patient_id DESC
`,
[userId]
);

res.json(result.rows);

}catch(err){

console.error("PENDING PATIENT ERROR:",err);

res.status(500).json({
error:err.message
});

}

});


// GET patient details for midwife registration review
app.get('/api/midwife/patient-review/:patientId',async(req,res)=>{
try{
const {patientId}=req.params;

const result=await pool.query(
`
SELECT
p.*,
a.area_name,
z.zone_name
FROM patient p
LEFT JOIN areas a
ON p.area_id=a.area_id
LEFT JOIN zones z
ON p.zone_id=z.zone_id
WHERE p.patient_id=$1
`,
[patientId]
);

if(result.rows.length===0){
return res.status(404).json({
error:"Patient not found"
});
}

res.json(result.rows[0]);

}catch(err){
console.error("PATIENT REVIEW ERROR:",err);
res.status(500).json({
error:err.message
});
}
});

app.put('/api/midwife/register-patient/:patientId',async(req,res)=>{
try{
const {patientId}=req.params;
const {
assigned_midwife_id,
clinic_id,
area_id,
zone_id,
hospital_clinic_name,
consultant_obstetrician,
pregnant_mother_approved_date,
phm_area,
moh_area,
antenatal_risk_conditions,
height_cm,
weight_kg
}=req.body;

const bmi=weight_kg && height_cm
?(weight_kg/((height_cm/100)*(height_cm/100))).toFixed(2)
:null;

const result=await pool.query(
`
UPDATE patient
SET
assigned_midwife_id=$1,
clinic_id=$2,
area_id=$3,
zone_id=$4,
hospital_clinic_name=$5,
consultant_obstetrician=$6,
pregnant_mother_approved_date=$7,
phm_area=$8,
moh_area=$9,
antenatal_risk_conditions=$10,
height_cm=$11,
weight_kg=$12,
bmi=$13,
status='approved'
WHERE patient_id=$14
RETURNING *
`,
[
assigned_midwife_id,
clinic_id,
area_id,
zone_id,
hospital_clinic_name,
consultant_obstetrician,
pregnant_mother_approved_date,
phm_area,
moh_area,
antenatal_risk_conditions,
height_cm,
weight_kg,
bmi,
patientId
]
);

res.json(result.rows[0]);

}catch(err){
console.error("MIDWIFE REGISTER UPDATE ERROR:",err);
res.status(500).json({
error:err.message
});
}
});



app.get('/api/patients/search', async (req, res) => {
  const q = req.query.q || '';
  const midwifeId = req.query.midwifeId;

  try {
    const patients = await pool.query(
      `
      SELECT
        p.patient_id,
        p.first_name,
        p.last_name,
        p.nic,
        p.phone,
        p.email,
        p.pregnant_mother_approved_date,
        p.status,
        p.area_id,
        p.zone_id,
        a.area_name
      FROM patient p
      LEFT JOIN areas a
      ON p.area_id = a.area_id
      WHERE
        LOWER(p.status)='approved'
        AND p.assigned_midwife_id=$2
        AND (
          p.first_name ILIKE $1
          OR p.last_name ILIKE $1
          OR p.nic ILIKE $1
          OR p.phone ILIKE $1
          OR p.email ILIKE $1
        )
      ORDER BY p.first_name ASC
      `,
      [`%${q.trim()}%`, midwifeId]
    );

    res.json(patients.rows);
  } catch(err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET approved patient details
app.get('/api/patients/:id', async(req,res)=>{
  try{

    const {id}=req.params;

    const result=await pool.query(
      `
      SELECT
        p.*,
        a.area_name,
        z.zone_name
      FROM patient p
      LEFT JOIN areas a
      ON p.area_id=a.area_id
      LEFT JOIN zones z
      ON p.zone_id=z.zone_id
      WHERE p.patient_id=$1
      `,
      [id]
    );


    if(result.rows.length===0){
      return res.status(404).json({
        error:"Patient not found"
      });
    }


    res.json(result.rows[0]);


  }catch(err){

    console.error("GET PATIENT ERROR:",err);

    res.status(500).json({
      error:err.message
    });

  }
});


// ==========================================
// Get pending pregnancy requests for logged-in midwife
// ==========================================


app.get("/api/midwife/pregnancy-requests/:midwifeId",async(req,res)=>{

const {midwifeId}=req.params;

try{

const result=await pool.query(
`
SELECT
pr.request_id,
pr.report_image,
pr.request_date,
pr.status,
p.patient_id,
p.first_name,
p.last_name,
p.nic,
COUNT(pg.pregnancy_id) AS pregnancy_count

FROM pregnancy_request pr

JOIN patient p
ON pr.patient_id=p.patient_id

LEFT JOIN pregnancy pg
ON p.patient_id=pg.patient_id

WHERE pr.status='PENDING'
AND p.assigned_midwife_id=$1

GROUP BY
pr.request_id,
p.patient_id

ORDER BY pr.request_date DESC

`,
[midwifeId]
);

res.json(result.rows);

}catch(err){

console.error(
"FETCH PREGNANCY REQUESTS ERROR",
err
);

res.status(500).json({
message:"Server error"
});

}

});


//  View one pregnancy request

// View one pregnancy request

app.get("/api/midwife/pregnancy-request/:id", async(req,res)=>{

const {id}=req.params;

try{

const result = await pool.query(
`
SELECT
pr.request_id,
pr.patient_id,
pr.report_image,
pr.status,
pr.request_date,
pr.reviewed_date,
pr.remarks,

p.first_name,
p.last_name,
p.nic,
p.phone

FROM pregnancy_request pr

JOIN patient p
ON pr.patient_id = p.patient_id

WHERE pr.request_id=$1
`,
[id]
);


if(result.rows.length===0){

return res.status(404).json({
message:"Pregnancy request not found"
});

}


res.json(result.rows[0]);


}catch(err){

console.error(
"VIEW PREGNANCY REQUEST ERROR:",
err
);


res.status(500).json({
message:"Server error"
});

}

});

//Approve pregnancy request

app.put("/api/midwife/pregnancy-request/:id/approve",async(req,res)=>{
const {id}=req.params;
try{
const result=await pool.query(`
UPDATE pregnancy_request
SET
status='APPROVED',
reviewed_date=CURRENT_TIMESTAMP
WHERE request_id=$1
RETURNING *
`,[id]);
if(result.rows.length===0){
return res.status(404).json({message:"Request not found"});
}
res.json({
message:"Pregnancy request approved",
request:result.rows[0]
});
}catch(err){
console.error("APPROVE ERROR",err);
res.status(500).json({message:"Server error"});
}
});

//Reject request

app.put("/api/midwife/pregnancy-request/:id/reject",async(req,res)=>{
const {id}=req.params;
try{
await pool.query(`
UPDATE pregnancy_request
SET status='REJECTED',
reviewed_date=CURRENT_TIMESTAMP
WHERE request_id=$1
`,[id]);
res.json({message:"Rejected"});
}catch(err){
console.error(err);
res.status(500).json({message:"Server error"});
}
});

app.put('/api/midwife/pregnancy-request/:id/complete',async(req,res)=>{
try{
const {id}=req.params;
const result=await pool.query(
`
UPDATE pregnancy_request
SET status='APPROVED',
reviewed_date=CURRENT_TIMESTAMP
WHERE request_id=$1
RETURNING *
`,
[id]
);
res.json(result.rows[0]);
}catch(err){
console.error(err);
res.status(500).json({
message:"Server error"
});
}
});

// ==========================================
// ADD NEW PREGNANCY FOR PATIENT
// ==========================================

// ==========================================
// ADD NEW PREGNANCY FOR PATIENT
// ==========================================

app.post('/api/pregnancies', async(req,res)=>{

const client=await pool.connect();

try{

await client.query("BEGIN");


const {
patient_id,
gravida,
parity,
living_children,
youngest_child_age,
lmp,
edd,
antenatal_risk_conditions,

// present obstetric history fields
corrected_edd,
poa_at_registration,
poa_at_dating_scan,
quickening_date,
family_planning_before_pregnancy,
doctor_signature

}=req.body;



// Generate pregnancy number

const countResult=await client.query(
`
SELECT COUNT(*)
FROM pregnancy
WHERE patient_id=$1
`,
[
patient_id
]
);


const pregnancy_no =
Number(countResult.rows[0].count)+1;



// ==============================
// CREATE PREGNANCY
// ==============================

const result=await client.query(
`
INSERT INTO pregnancy
(
patient_id,
pregnancy_no,
gravida,
parity,
living_children,
youngest_child_age,
lmp,
edd,
antenatal_risk_conditions,
pregnancy_status,
pregnancy_outcome,
created_at
)

VALUES
(
$1,$2,$3,$4,$5,$6,$7,$8,$9,
'ACTIVE',
NULL,
NOW()
)

RETURNING *
`,
[
patient_id,
pregnancy_no,
gravida || null,
parity || null,
living_children || null,
youngest_child_age || null,
lmp || null,
edd || null,
antenatal_risk_conditions || "NONE"
]

);


const newPregnancy=result.rows[0];



// =================================================
// CREATE PRESENT OBSTETRIC HISTORY
// =================================================


await client.query(
`
INSERT INTO present_obstetric_history
(
pregnancy_id,
gravida,
parity,
living_children,
youngest_child_age,
lmp,
edd,
corrected_edd,
completion_40_weeks,
poa_at_registration,
poa_at_dating_scan,
quickening_date,
family_planning_before_pregnancy,
doctor_signature
)

VALUES
(
$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
)

`,
[

newPregnancy.pregnancy_id,

gravida || null,

parity || null,

living_children || null,

youngest_child_age || null,

lmp || null,

edd || null,

// corrected EDD initially same as EDD
corrected_edd || edd || null,

null,

poa_at_registration || null,

poa_at_dating_scan || null,

quickening_date || null,

family_planning_before_pregnancy || null,

doctor_signature || null

]

);




// =================================================
// COPY PREVIOUS DELIVERY INTO PAST OBSTETRIC HISTORY
// =================================================


if(pregnancy_no > 1){


const previous=await client.query(
`
SELECT

p.pregnancy_no,
p.delivery_date,
p.delivery_method,
p.pregnancy_outcome,

pb.gender,
pb.birth_weight,
pb.birth_status


FROM pregnancy p


LEFT JOIN pregnancy_babies pb

ON p.pregnancy_id = pb.pregnancy_id


WHERE p.patient_id=$1

AND p.pregnancy_status='DELIVERED'


ORDER BY p.pregnancy_no ASC

`,
[
patient_id
]
);



for(const old of previous.rows){


await client.query(
`
INSERT INTO past_obstetric_history
(
pregnancy_id,
pregnancy_number,
year_of_delivery,
outcome,
sex,
birth_weight_kg,
mode_of_delivery,
child_status,
antenatal_complications
)

VALUES
(
$1,$2,$3,$4,$5,$6,$7,$8,$9
)
`,
[
newPregnancy.pregnancy_id,

old.pregnancy_no,

old.delivery_date
?
new Date(old.delivery_date).getFullYear()
:
null,

old.pregnancy_outcome || "DELIVERY",

old.gender || null,

old.birth_weight || null,

old.delivery_method || null,

old.birth_status || null,

"None"

]

);

}

}



await client.query("COMMIT");



res.status(201).json(
newPregnancy
);



}catch(err){


await client.query("ROLLBACK");


console.error(
"ADD PREGNANCY ERROR:",
err
);


res.status(500).json({
error:err.message
});


}finally{

client.release();

}

});

app.put('/api/pregnancies/:id/outcome', async(req,res)=>{

  try{

    const {
      pregnancy_status,
      pregnancy_outcome
    } = req.body;


    const result = await pool.query(
      `
      UPDATE pregnancy
      SET
      pregnancy_status=$1,
      pregnancy_outcome=$2
      WHERE pregnancy_id=$3
      RETURNING *
      `,
      [
        pregnancy_status,
        pregnancy_outcome,
        req.params.id
      ]
    );


    res.json(result.rows[0]);


  }catch(err){

    console.error(err);

    res.status(500).json({
      error:err.message
    });

  }

});



// ==========================================
// MULTIPLE VISIT TABLES (Prenatal Field Note)
// ==========================================

// Get visits for a specific patient
app.get('/api/visits/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const visits = await pool.query("SELECT * FROM prenatal_field_note WHERE patient_id = $1 ORDER BY visit_number ASC", [patientId]);
    res.json(visits.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new visit record
app.post('/api/visits', async (req, res) => {
  const { patient_id, visit_number, weeks_into_pregnancy, anemia, swelling, fundal_height, fetal_heart_rate } = req.body;
  try {
    const newVisit = await pool.query(
      `INSERT INTO prenatal_field_note
      (patient_id, visit_number, weeks_into_pregnancy, anemia, swelling, fundal_height, fetal_heart_rate)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [patient_id, visit_number, weeks_into_pregnancy, anemia, swelling, fundal_height, fetal_heart_rate]
    );
    res.json(newVisit.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==============================
// BABY DETAILS 
// ==============================

app.post('/api/pregnancy/:pregnancyId/babies',async(req,res)=>{

const client=await pool.connect();

try{

const {pregnancyId}=req.params;

const {
outcome,
delivery,
babies
}=req.body;


await client.query("BEGIN");



const pregnancyResult=await client.query(
`
SELECT *
FROM pregnancy
WHERE pregnancy_id=$1
`,
[pregnancyId]
);



if(pregnancyResult.rows.length===0){

await client.query("ROLLBACK");

return res.status(404).json({
message:"Pregnancy not found"
});

}


const pregnancy=pregnancyResult.rows[0];




// ==============================
// DELIVERY
// ==============================

if(outcome==="DELIVERY"){



await client.query(
`
UPDATE pregnancy
SET
delivery_date=$1,
delivery_method=$2,
mother_condition=$3,
pregnancy_status='DELIVERED',
pregnancy_outcome='DELIVERY'
WHERE pregnancy_id=$4
`,
[
delivery.delivery_date,
delivery.delivery_method,
delivery.mother_condition,
pregnancyId
]
);





for(const baby of babies){


await client.query(
`
INSERT INTO pregnancy_babies
(
pregnancy_id,
baby_number,
gender,
birth_date,
birth_time,
birth_weight,
birth_length,
birth_status
)

VALUES
($1,$2,$3,$4,$5,$6,$7,$8)
`,
[
pregnancyId,
baby.baby_number,
baby.gender,
baby.birth_date || delivery.delivery_date,
baby.birth_time || null,
baby.birth_weight || null,
baby.birth_length || null,
baby.birth_status
]
);


}




const firstBaby=await client.query(
`
SELECT *
FROM pregnancy_babies
WHERE pregnancy_id=$1
ORDER BY baby_number
LIMIT 1
`,
[pregnancyId]
);



// Create past obstetric history for NEXT pregnancy
if(Number(pregnancy.pregnancy_no) >= 1){


const firstBaby = await client.query(
`
SELECT *
FROM pregnancy_babies
WHERE pregnancy_id=$1
ORDER BY baby_number ASC
LIMIT 1
`,
[pregnancyId]
);



await client.query(
`
INSERT INTO past_obstetric_history
(
pregnancy_id,
pregnancy_number,
year_of_delivery,
outcome,
sex,
birth_weight_kg,
mode_of_delivery,
child_status
)

VALUES
($1,$2,$3,$4,$5,$6,$7,$8)
`,
[

// IMPORTANT:
// store against CURRENT pregnancy for history viewing
pregnancyId,

pregnancy.pregnancy_no,

new Date(delivery.delivery_date).getFullYear(),

"DELIVERY",

firstBaby.rows[0]?.gender || null,

firstBaby.rows[0]?.birth_weight || null,

delivery.delivery_method,

firstBaby.rows[0]?.birth_status || null

]
);


}


}



// ==============================
// MISCARRIAGE / TERMINATED / REFERRED
// ==============================


else{


await client.query(
`
UPDATE pregnancy
SET
pregnancy_status=$1,
pregnancy_outcome=$2
WHERE pregnancy_id=$3
`,
[
outcome,
outcome,
pregnancyId
]
);


}




await client.query("COMMIT");


res.json({
message:"Saved successfully"
});


}catch(err){


await client.query("ROLLBACK");


console.error(
"SAVE PREGNANCY OUTCOME ERROR",
err
);


res.status(500).json({
message:err.message
});


}finally{

client.release();

}

});


// ==============================
// calculate pregnancy details
// ==============================

app.get('/api/pregnancy-summary/:patientId',async(req,res)=>{

try{

const {patientId}=req.params;


// Get patient clinic

const patientResult=await pool.query(
`
SELECT clinic_id
FROM patient
WHERE patient_id=$1
`,
[
patientId
]
);


const clinic_id =
patientResult.rows[0]?.clinic_id || null;



const pregnancies=await pool.query(
`
SELECT
pregnancy_id,
pregnancy_no,
pregnancy_status,
pregnancy_outcome
FROM pregnancy
WHERE patient_id=$1
ORDER BY pregnancy_no ASC
`,
[
patientId
]
);



let gravida =
pregnancies.rows.length+1;


let parity=0;

let livingChildren=0;



for(const pregnancy of pregnancies.rows){


if(
pregnancy.pregnancy_status==="DELIVERED"
&&
pregnancy.pregnancy_outcome==="DELIVERY"
){


parity++;



const babies=await pool.query(
`
SELECT COUNT(*)
FROM pregnancy_babies
WHERE pregnancy_id=$1
AND birth_status='ALIVE'
`,
[
pregnancy.pregnancy_id
]
);



livingChildren += Number(
babies.rows[0].count
);


}


}



res.json({

pregnancy_no:gravida,

gravida,

parity,

living_children:livingChildren,

clinic_id

});



}catch(err){

console.error(
"Pregnancy Summary Error",
err
);


res.status(500).json({
message:err.message
});


}

});

// ==============================
// MEDICAL & SURGICAL HISTORY
// ==============================

// GET medical history by patient
app.get('/api/medical-history/:patientId',async(req,res)=>{
  try{
    const result=await pool.query(
      `
      SELECT *
      FROM medical_surgical_history
      WHERE patient_id=$1
      `,
      [req.params.patientId]
    );
    if(result.rows.length===0){
      return res.json(null);
    }
    res.json(result.rows[0]);
  }catch(err){
    console.error("GET MEDICAL HISTORY ERROR:",err);
    res.status(500).json({error:err.message});
  }
});

// CREATE or UPDATE medical history
app.post('/api/medical-history',async(req,res)=>{
  try{
    const {
      patient_id,
      diabetes,
      hypertension,
      cardiac_disease,
      renal_disease,
      hepatic_disease,
      thyroid_disease,
      bronchial_asthma,
      epilepsy,
      psychiatric_illness,
      tuberculosis,
      malignancy,
      previous_dvt,
      previous_surgeries,
      blood_transfusion_history,
      drug_allergies,
      other_conditions
    }=req.body;

    const result=await pool.query(
      `
      INSERT INTO medical_surgical_history(
        patient_id,
        diabetes,
        hypertension,
        cardiac_disease,
        renal_disease,
        hepatic_disease,
        thyroid_disease,
        bronchial_asthma,
        epilepsy,
        psychiatric_illness,
        tuberculosis,
        malignancy,
        previous_dvt,
        previous_surgeries,
        blood_transfusion_history,
        drug_allergies,
        other_conditions
      )
      VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,$17
      )
      ON CONFLICT(patient_id)
      DO UPDATE SET
        diabetes=EXCLUDED.diabetes,
        hypertension=EXCLUDED.hypertension,
        cardiac_disease=EXCLUDED.cardiac_disease,
        renal_disease=EXCLUDED.renal_disease,
        hepatic_disease=EXCLUDED.hepatic_disease,
        thyroid_disease=EXCLUDED.thyroid_disease,
        bronchial_asthma=EXCLUDED.bronchial_asthma,
        epilepsy=EXCLUDED.epilepsy,
        psychiatric_illness=EXCLUDED.psychiatric_illness,
        tuberculosis=EXCLUDED.tuberculosis,
        malignancy=EXCLUDED.malignancy,
        previous_dvt=EXCLUDED.previous_dvt,
        previous_surgeries=EXCLUDED.previous_surgeries,
        blood_transfusion_history=EXCLUDED.blood_transfusion_history,
        drug_allergies=EXCLUDED.drug_allergies,
        other_conditions=EXCLUDED.other_conditions
      RETURNING *;
      `,
      [
        patient_id,
        diabetes,
        hypertension,
        cardiac_disease,
        renal_disease,
        hepatic_disease,
        thyroid_disease,
        bronchial_asthma,
        epilepsy,
        psychiatric_illness,
        tuberculosis,
        malignancy,
        previous_dvt,
        previous_surgeries,
        blood_transfusion_history,
        drug_allergies,
        other_conditions
      ]
    );

    res.json(result.rows[0]);

  }catch(err){
    console.error("SAVE MEDICAL HISTORY ERROR:",err);
    res.status(500).json({error:err.message});
  }
});


app.get('/api/pregnancy/:pregnancyId', async(req,res)=>{
try{

const result = await pool.query(
`
SELECT *
FROM pregnancy
WHERE pregnancy_id=$1
`,
[
req.params.pregnancyId
]
);

if(result.rows.length===0){
return res.status(404).json({
error:"Pregnancy not found"
});
}

res.json(result.rows[0]);

}catch(err){

console.error("GET SINGLE PREGNANCY ERROR:",err);

res.status(500).json({
error:err.message
});

}
});


// ==============================
// FAMILY HISTORY
// ==============================

// GET family history by patient
app.get('/api/family-history/:patientId',async(req,res)=>{
  try{

    const result=await pool.query(
      `
      SELECT *
      FROM family_history
      WHERE patient_id=$1
      `,
      [req.params.patientId]
    );

    if(result.rows.length===0){
      return res.json(null);
    }

    res.json(result.rows[0]);

  }catch(err){

    console.error("GET FAMILY HISTORY ERROR:",err);

    res.status(500).json({
      error:err.message
    });

  }
});


// CREATE OR UPDATE family history
app.post('/api/family-history',async(req,res)=>{
  try{

    const {
      patient_id,
      diabetes,
      hypertension,
      twin_pregnancies,
      congenital_disorders,
      thalassemia,
      sickle_cell_disease,
      genetic_disorders,
      psychiatric_illness,
      other_conditions
    }=req.body;


    const result=await pool.query(
      `
      INSERT INTO family_history(
        patient_id,
        diabetes,
        hypertension,
        twin_pregnancies,
        congenital_disorders,
        thalassemia,
        sickle_cell_disease,
        genetic_disorders,
        psychiatric_illness,
        other_conditions
      )
      VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      )

      ON CONFLICT(patient_id)

      DO UPDATE SET

        diabetes=EXCLUDED.diabetes,
        hypertension=EXCLUDED.hypertension,
        twin_pregnancies=EXCLUDED.twin_pregnancies,
        congenital_disorders=EXCLUDED.congenital_disorders,
        thalassemia=EXCLUDED.thalassemia,
        sickle_cell_disease=EXCLUDED.sickle_cell_disease,
        genetic_disorders=EXCLUDED.genetic_disorders,
        psychiatric_illness=EXCLUDED.psychiatric_illness,
        other_conditions=EXCLUDED.other_conditions

      RETURNING *;
      `,
      [
        patient_id,
        diabetes,
        hypertension,
        twin_pregnancies,
        congenital_disorders,
        thalassemia,
        sickle_cell_disease,
        genetic_disorders,
        psychiatric_illness,
        other_conditions
      ]
    );


    res.json(result.rows[0]);


  }catch(err){

    console.error("SAVE FAMILY HISTORY ERROR:",err);

    res.status(500).json({
      error:err.message
    });

  }
});

// ==========================================
// CLINIC CARE ROUTES
// ==========================================

// GET Clinic Visits by Pregnancy
app.get('/api/clinic-care/:pregnancyId',async(req,res)=>{
  try{
    const visits=await pool.query(
      `
      SELECT *
      FROM clinic_care
      WHERE pregnancy_id=$1
      ORDER BY visit_date DESC
      `,
      [req.params.pregnancyId]
    );

    res.json(visits.rows);

  }catch(err){
    console.error("CLINIC CARE GET ERROR:",err);
    res.status(500).json({
      error:err.message
    });
  }
});


// POST Add Clinic Visit
app.post('/api/clinic-care',async(req,res)=>{
  try{

    const{
      pregnancy_id,
      visit_date,
      poa,
      weight,
      bp_systolic,
      bp_diastolic,
      urine_sugar,
      urine_albumin,
      pallor,
      oedema_ankle,
      oedema_facial,
      fundal_height,
      foetal_lie,
      presentation,
      engagement,
      fm,
      fhs,
      iron,
      folate,
      calcium,
      vitamin_c,
      food_supplementation,
      officer_signature,
      designation
    }=req.body;


    const result=await pool.query(
      `
      INSERT INTO clinic_care(
        pregnancy_id,
        visit_date,
        poa,
        weight,
        bp_systolic,
        bp_diastolic,
        urine_sugar,
        urine_albumin,
        pallor,
        oedema_ankle,
        oedema_facial,
        fundal_height,
        foetal_lie,
        presentation,
        engagement,
        fm,
        fhs,
        iron,
        folate,
        calcium,
        vitamin_c,
        food_supplementation,
        officer_signature,
        designation
      )
      VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24
      )
      RETURNING *
      `,
      [
        pregnancy_id,
        visit_date,
        poa,
        weight,
        bp_systolic,
        bp_diastolic,
        urine_sugar,
        urine_albumin,
        pallor,
        oedema_ankle,
        oedema_facial,
        fundal_height,
        foetal_lie,
        presentation,
        engagement,
        fm,
        fhs,
        iron,
        folate,
        calcium,
        vitamin_c,
        food_supplementation,
        officer_signature,
        designation
      ]
    );


    res.status(201).json(result.rows[0]);


  }catch(err){

    console.error("CLINIC CARE POST ERROR:",err);

    res.status(500).json({
      error:err.message
    });

  }
});

// ==========================================
// PAST OBSTETRIC HISTORY ROUTES
// ==========================================

// GET Past Obstetric History for a Pregnancy
app.get('/api/past-obstetric-history/:pregnancyId', async(req,res)=>{

try{

const result = await pool.query(
`
SELECT
poh.*,

COALESCE(
json_agg(
json_build_object(
'baby_id',pb.baby_id,
'baby_number',pb.baby_number,
'gender',pb.gender,
'birth_weight',pb.birth_weight,
'birth_length',pb.birth_length,
'birth_status',pb.birth_status
)
)
FILTER(WHERE pb.baby_id IS NOT NULL),
'[]'
) AS babies


FROM past_obstetric_history poh


LEFT JOIN pregnancy_babies pb
ON poh.pregnancy_id = pb.pregnancy_id


WHERE poh.pregnancy_id=$1


GROUP BY poh.history_id


ORDER BY poh.pregnancy_number ASC

`,
[
req.params.pregnancyId
]
);


res.json(result.rows);


}catch(err){

console.error(
"GET Past Obstetric History Error:",
err
);

res.status(500).json({
error:err.message
});

}

});

// INSERT Past Obstetric History Record
app.post('/api/past-obstetric-history', async (req, res) => {

  const {
    pregnancy_id,
    pregnancy_number,
    year_of_delivery,
    gestational_age_weeks,
    outcome,
    sex,
    birth_weight_kg,
    mode_of_delivery,
    place_of_delivery,
    antenatal_complications,
    postnatal_complications,
    child_status,
    remarks
  } = req.body;

  try {

    const result = await pool.query(
      `
      INSERT INTO past_obstetric_history
      (
        pregnancy_id,
        pregnancy_number,
        year_of_delivery,
        gestational_age_weeks,
        outcome,
        sex,
        birth_weight_kg,
        mode_of_delivery,
        place_of_delivery,
        antenatal_complications,
        postnatal_complications,
        child_status,
        remarks
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      RETURNING *
      `,
      [
        pregnancy_id,
        pregnancy_number,
        year_of_delivery,
        gestational_age_weeks,
        outcome,
        sex,
        birth_weight_kg,
        mode_of_delivery,
        place_of_delivery,
        antenatal_complications,
        postnatal_complications,
        child_status,
        remarks
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    console.error("POST Past Obstetric History Error:", err);

    res.status(500).json({
      error: err.message
    });

  }

});
// GET Basic Patient Details (for headers/titles)
app.get('/api/patients/details/:id', async (req, res) => {
  try {
    const patient = await pool.query(
      "SELECT first_name, last_name FROM patient WHERE patient_id = $1",
      [req.params.id]
    );
    if (patient.rows.length === 0) return res.status(404).json({ error: "Patient not found" });
    res.json(patient.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ROUTINE INVESTIGATIONS
// ==========================================


app.get('/api/labs/:pregnancyId', async(req,res)=>{

    try{

        const { pregnancyId } = req.params;


        const result = await pool.query(

        `
        SELECT *
        FROM routine_investigations
        WHERE pregnancy_id=$1
        `,

        [pregnancyId]

        );


        if(result.rows.length===0){

            return res.json(null);

        }


        res.json(result.rows[0]);


    }
    catch(error){

        console.error(error);

        res.status(500).json({
            error:error.message
        });

    }

});

app.post('/api/labs', async(req,res)=>{


try{


const {

pregnancy_id,

syphilis_poa,
syphilis_sample_date,
syphilis_result_date,
syphilis_result,
syphilis_referral_date,


bs_1_poa,
bs_1_result,

bs_2_poa,
bs_2_result,


hb_1_poa,
hb_1_result,

hb_2_poa,
hb_2_result,


hiv_sample_date,
hiv_result_date,


malaria_poa,
malaria_result,


other_investigations


}=req.body;



const result = await pool.query(

`

INSERT INTO routine_investigations
(

pregnancy_id,

syphilis_poa,
syphilis_sample_date,
syphilis_result_date,
syphilis_result,
syphilis_referral_date,


bs_1_poa,
bs_1_result,

bs_2_poa,
bs_2_result,


hb_1_poa,
hb_1_result,

hb_2_poa,
hb_2_result,


hiv_sample_date,
hiv_result_date,


malaria_poa,
malaria_result,


other_investigations

)


VALUES

(

$1,

$2,$3,$4,$5,$6,

$7,$8,

$9,$10,

$11,$12,

$13,$14,

$15,$16,

$17,$18,

$19

)


ON CONFLICT(pregnancy_id)

DO UPDATE SET


syphilis_poa = EXCLUDED.syphilis_poa,
syphilis_sample_date = EXCLUDED.syphilis_sample_date,
syphilis_result_date = EXCLUDED.syphilis_result_date,
syphilis_result = EXCLUDED.syphilis_result,
syphilis_referral_date = EXCLUDED.syphilis_referral_date,


bs_1_poa = EXCLUDED.bs_1_poa,
bs_1_result = EXCLUDED.bs_1_result,

bs_2_poa = EXCLUDED.bs_2_poa,
bs_2_result = EXCLUDED.bs_2_result,


hb_1_poa = EXCLUDED.hb_1_poa,
hb_1_result = EXCLUDED.hb_1_result,

hb_2_poa = EXCLUDED.hb_2_poa,
hb_2_result = EXCLUDED.hb_2_result,


hiv_sample_date = EXCLUDED.hiv_sample_date,
hiv_result_date = EXCLUDED.hiv_result_date,


malaria_poa = EXCLUDED.malaria_poa,
malaria_result = EXCLUDED.malaria_result,


other_investigations = EXCLUDED.other_investigations


RETURNING *;

`,


[

pregnancy_id,

syphilis_poa,
syphilis_sample_date || null,
syphilis_result_date || null,
syphilis_result,
syphilis_referral_date || null,


bs_1_poa,
bs_1_result,


bs_2_poa,
bs_2_result,


hb_1_poa,
hb_1_result,


hb_2_poa,
hb_2_result,


hiv_sample_date || null,
hiv_result_date || null,


malaria_poa,
malaria_result,


other_investigations


]

);



res.json(result.rows[0]);


}

catch(error){


console.error(error);


res.status(500).json({

error:error.message

});


}


});
// ==========================================
// BIRTH & EMERGENCY PREPAREDNESS PLAN
// ==========================================

// Get birth plan by pregnancy
app.get("/api/birth-plan/:pregnancyId", async(req,res)=>{
  try{
    const result=await pool.query(
      `SELECT * FROM birth_plan WHERE pregnancy_id=$1 ORDER BY plan_date DESC`,
      [req.params.pregnancyId]
    );
    res.json(result.rows);
  }catch(err){
    console.error("GET BIRTH PLAN ERROR:",err);
    res.status(500).json({error:err.message});
  }
});

// Create birth plan
app.post("/api/birth-plan", async(req,res)=>{
  try{
    const {
      pregnancy_id,
      plan_date,
      intended_delivery_facility,
      emergency_transport_mode,
      birth_companion_name,
      support_phone,
      blood_donor_name,
      blood_donor_phone,
      emergency_funds_arranged
    }=req.body;
    const result=await pool.query(
      `
      INSERT INTO birth_plan(
        pregnancy_id,
        plan_date,
        intended_delivery_facility,
        emergency_transport_mode,
        birth_companion_name,
        support_phone,
        blood_donor_name,
        blood_donor_phone,
        emergency_funds_arranged
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        pregnancy_id,
        plan_date,
        intended_delivery_facility,
        emergency_transport_mode,
        birth_companion_name,
        support_phone,
        blood_donor_name,
        blood_donor_phone,
        emergency_funds_arranged
      ]
    );
    res.json(result.rows[0]);
  }catch(err){
    console.error("CREATE BIRTH PLAN ERROR:",err);
    res.status(500).json({error:err.message});
  }
});

// Update birth plan
app.put("/api/birth-plan/:id", async(req,res)=>{
  try{
    const result=await pool.query(
      `
      UPDATE birth_plan
      SET
        plan_date=$1,
        intended_delivery_facility=$2,
        emergency_transport_mode=$3,
        birth_companion_name=$4,
        support_phone=$5,
        blood_donor_name=$6,
        blood_donor_phone=$7,
        emergency_funds_arranged=$8,
        updated_at=CURRENT_TIMESTAMP
      WHERE birth_plan_id=$9
      RETURNING *
      `,
      [
        req.body.plan_date,
        req.body.intended_delivery_facility,
        req.body.emergency_transport_mode,
        req.body.birth_companion_name,
        req.body.support_phone,
        req.body.blood_donor_name,
        req.body.blood_donor_phone,
        req.body.emergency_funds_arranged,
        req.params.id
      ]
    );
    res.json(result.rows[0]);
  }catch(err){
    console.error("UPDATE BIRTH PLAN ERROR:",err);
    res.status(500).json({error:err.message});
  }
});

// Delete birth plan
app.delete("/api/birth-plan/:id", async(req,res)=>{
  try{
    await pool.query(
      `DELETE FROM birth_plan WHERE birth_plan_id=$1`,
      [req.params.id]
    );
    res.json({message:"Birth plan deleted"});
  }catch(err){
    console.error("DELETE BIRTH PLAN ERROR:",err);
    res.status(500).json({error:err.message});
  }
});
// ==========================================
// Delivery and PNC
// ==========================================

// ==========================================
// POSTNATAL CARE (PNC) VISITS
// ==========================================

// GET all PNC visits for a pregnancy
app.get('/api/pnc-visits/:pregnancyId', async(req,res)=>{
  try{
    const visits=await pool.query(
      `
      SELECT *
      FROM pnc_visits
      WHERE pregnancy_id=$1
      ORDER BY visit_date ASC
      `,
      [req.params.pregnancyId]
    );
    res.json(visits.rows);
  }catch(err){
    console.error("PNC GET ERROR:",err);
    res.status(500).json({error:err.message});
  }
});

// POST new PNC visit
app.post('/api/pnc-visits', async(req,res)=>{
  try{
    const {
      pregnancy_id,
      visit_date,
      visit_type,
      infant_care_edu,
      danger_signs_newborn_edu,
      exclusive_breastfeeding_edu,
      breastfeeding_positioning_edu,
      breastfeeding_supply_edu,
      pnc_danger_signs_edu,
      family_planning_importance,
      family_planning_methods,
      next_clinic_date,
      mother_left_area,
      referral_letter_issued,
      mother_temp,
      mother_anemia,
      mother_breasts,
      uterine_involution,
      lochia_type,
      lochia_foul_smell,
      perineal_wound_status,
      perineal_wound_infected,
      gauze_retained,
      mood_changes,
      upper_abdominal_pain,
      diarrhoea,
      vomiting,
      difficulty_breathing,
      blurred_vision_headache,
      calf_pain_dvt,
      epds_status,
      child_distress_signs,
      child_fever,
      child_skin_color,
      umbilical_cord_status,
      child_grunting,
      child_sucking_ability,
      child_attachment_observed,
      child_micronutrients,
      bcg_vaccination,
      neonatal_death,
      death_age_window,
      death_investigated,
      cause_of_death,
      other_remarks
    }=req.body;

    const clean=(value)=>value===""?null:value;

    const query=`
    INSERT INTO pnc_visits(
      pregnancy_id,
      visit_date,
      visit_type,
      infant_care_edu,
      danger_signs_newborn_edu,
      exclusive_breastfeeding_edu,
      breastfeeding_positioning_edu,
      breastfeeding_supply_edu,
      pnc_danger_signs_edu,
      family_planning_importance,
      family_planning_methods,
      next_clinic_date,
      mother_left_area,
      referral_letter_issued,
      mother_temp,
      mother_anemia,
      mother_breasts,
      uterine_involution,
      lochia_type,
      lochia_foul_smell,
      perineal_wound_status,
      perineal_wound_infected,
      gauze_retained,
      mood_changes,
      upper_abdominal_pain,
      diarrhoea,
      vomiting,
      difficulty_breathing,
      blurred_vision_headache,
      calf_pain_dvt,
      epds_status,
      child_distress_signs,
      child_fever,
      child_skin_color,
      umbilical_cord_status,
      child_grunting,
      child_sucking_ability,
      child_attachment_observed,
      child_micronutrients,
      bcg_vaccination,
      neonatal_death,
      death_age_window,
      death_investigated,
      cause_of_death,
      other_remarks
    )
    VALUES(
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
      $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
      $41,$42,$43,$44,$45
    )
    RETURNING *;
    `;

    const values=[
      pregnancy_id,
      visit_date,
      visit_type,
      infant_care_edu,
      danger_signs_newborn_edu,
      exclusive_breastfeeding_edu,
      breastfeeding_positioning_edu,
      breastfeeding_supply_edu,
      pnc_danger_signs_edu,
      family_planning_importance,
      family_planning_methods,
      clean(next_clinic_date),
      mother_left_area,
      referral_letter_issued,
      clean(mother_temp),
      mother_anemia,
      mother_breasts,
      uterine_involution,
      lochia_type,
      lochia_foul_smell,
      perineal_wound_status,
      perineal_wound_infected,
      gauze_retained,
      mood_changes,
      upper_abdominal_pain,
      diarrhoea,
      vomiting,
      difficulty_breathing,
      blurred_vision_headache,
      calf_pain_dvt,
      epds_status,
      child_distress_signs,
      child_fever,
      child_skin_color,
      umbilical_cord_status,
      child_grunting,
      child_sucking_ability,
      child_attachment_observed,
      child_micronutrients,
      bcg_vaccination,
      neonatal_death,
      death_age_window,
      death_investigated,
      cause_of_death,
      other_remarks
    ];

    const result=await pool.query(query,values);
    res.json(result.rows[0]);

  }catch(err){
    console.error("PNC POST ERROR:",err);
    res.status(500).json({error:err.message});
  }
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));