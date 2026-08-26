import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bgmaakxlhybzycijvhvb.supabase.co';
const supabaseAnonKey = 'sb_publishable_ERAh8lFCwuQjNGS7IqqFtA_ohgYX5z2';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const csvData = `TBO - Orange - DataBuild,246737,69205844,Rajadurai Annadurai,Employee,2023-01-04,2023-07-29,,2023-09-21,Inactive,Chennai,Govind Singh Bisht,Deploy,,2023-08-25,2023-09-21,10,2023-09-01,Data Build Services,DB,DB,TBO,L2,,,,Yes,Jaysundar VC,Project ID,Vigneshwaran Murthy,9698022234.0,New,New,,Orange,Orange,TBO - Delivery,Mobile Networks,,Ramp Down,Ramp Down,,,,,,,rajadurai.a.ext@nokia.com,,
TBO DB - RJIO India,246737,69205844,Rajadurai Annadurai,Employee,2023-01-04,2023-09-22,,2024-06-30,Inactive,Chennai,S Ramamoorthy,Deploy,,2024-05-24,2024-06-20,10,2024-05-21,Data Build Services,DB,DB,TBO,L2,,,,Yes,Jaysundar VC,,Vigneshwaran Murthy,9698022234.0,New,New,,RJIO,India,TBO - Delivery,Mobile Networks,,Project change,Project change,,,,,,,rajadurai.a.ext@nokia.com,,
TBO DB - RJIO India,250685,69214572,Srinuvasan Vijayaragavan,Employee,2023-03-27,2023-03-27,,2023-09-22,Active,Chennai,S Ramamoorthy,Deploy,,2023-08-25,2023-09-21,20,2023-08-30,Data Build Services,DB,DB,TBO,L2,,,,Yes,Jaysundar VC,,Vigneshwaran Murthy,,New,New,,RJIO,India,TBO - Delivery,Mobile Networks,,Ramp Down,Ramp Down,,,,,,,srinuvasan.vijayaragavan.ext@nokia.com,,
TBO DB - RJIO India,246737,69205844,Rajadurai Annadurai,Employee,2023-01-04,2023-01-05,,2023-07-28,Inactive,Chennai,S Ramamoorthy,Deploy,,2023-06-23,2023-07-27,20,2023-06-20,Data Build Services,DB,DB,TBO,L2,,,,Yes,Jaysundar VC,,Vigneshwaran Murthy,9698022234.0,New,New,,RJIO,India,TBO - Delivery,Mobile Networks,,Ramp Down,Ramp Down,,,,,,,rajadurai.a.ext@nokia.com,,
 TBO - Charter_Talon (Pole Validation),287139,69227223,SUMITHA MATHAVAN,Employee,2024-09-06,2024-09-06,,2025-06-20,Notice Period,Chennai,Rupakumar Chamarthi,Deploy,,2025-06-01,2025-06-20,10,2025-06-10,DEC,RI,DEC,TBO,L1,,,,Yes,Jaysundar VC,,Vigneshwaran Murthy,,,,,Pole - Validation,USA,TBO - Delivery,Mobile Networks,,,,,,,,,,sumitha.mathavan.ext@SUT.com,,
NB20241104969SUB005SR01,250685,69214572,Srinuvasan Vijayaragavan,Employee,2024-06-28,2024-12-02,,2025-06-26,Ramp Down,Chennai,Govind Singh Bisht,Deploy,,2025-06-01,2025-06-30,30,2025-05-22,Data Build,DB,DB,Rate Card,L2,,,,YES,Jaysundar VC,,Vigneshwaran Murthy,,,,,Vodafone,India,Time & Material,Mobile Networks,Laptop allocated from Chennai,,,UST,HP EliteBook 840 G9,G605LBLR,5CG3142JXS,45471.0,,srinuvasan.vijayaragavan.ext@UST.com,,
NB202508081719SUB091SR01,287139,69227223,Sumitha Mathavan,Employee,2024-09-06,2025-08-15,,2025-10-07,Active,Chennai,Govind Singh Bisht,Deploy,,2025-10-01,2025-10-08,20,2025-10-21,Data Build,DB,DB,Rate Card,L2,,,,YES,Jaysundar VC,,Vigneshwaran Murthy,,,New,,Bharti,India,Time & Material,Mobile Networks,,Ramp Down,Ramp Down,,,,,,,sumitha.mathavan.ext@UST.com,,Chennai
NB202508081719SUB085SR01,250685,69214572,Srinuvasan Vijayaragavan,Employee,2023-03-27,2025-08-15,,2025-10-07,Notice Period,Chennai,Govind Singh Bisht,Deploy,,2025-10-01,2025-10-08,20,2025-10-21,Data Build,DB,DB,Rate Card,L2,,,,YES,Jaysundar VC,,Vigneshwaran Murthy,,,New,,Bharti,India,Time & Material,Mobile Networks,,Ramp Down,Ramp Down,,,,,,,srinuvasan.vijayaragavan.ext@UST.com,,Chennai`;

async function seed() {
  const lines = csvData.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    // SR(0), UID(1), Nokia ID(2), Employee Name(3), Employee Type(4), UST DOJ(5), Nokia DOJ(6),
    // Resignation Applied(7), Nokia LWD(8), Account Status(9), Location(10), Nokia LM(11), Stream(12),
    // PO Number(13), ... Contact Number(30), ... Nokia Mail ID(47)

    const uid = parts[1];
    const name = parts[3];
    const doj = parts[5];
    const status = parts[9];
    const location = parts[10];
    const phone = parts[30];
    const designation = parts[18];
    const email = parts[47];

    const formattedPhone = phone ? phone.replace('.0', '') : '';

    const payload = {
      employee_id: uid,
      employee_name: name,
      joining_date: doj,
      status: status,
      location: location,
      phone_number: formattedPhone || null,
      designation: designation,
      email: email || 'dummy@example.com'
    };

    const { error } = await supabase.from('employees').insert(payload);
    if (error) {
       console.log('Error inserting:', uid, error.message);
    } else {
       console.log('Inserted:', uid);
    }
  }
}

seed();
