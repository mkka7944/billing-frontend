
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ipegpbgcektdtbnfvhvc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVIn0.eyJyO0qvvTjRbKQQqHWNpsDbCBCeT9hPMgnAyE2bE"; // Partial key from logs, I'll try it or use a script to read it

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMC11() {
    console.log("Investigating MC-11 Sargodha...");

    // 1. Total Active in MC-11
    const { count: totalActive, error: err1 } = await supabase
        .from('survey_units')
        .select('*', { count: 'exact', head: true })
        .eq('city_district', 'SARGODHA')
        .eq('uc_name', 'MC-11')
        .eq('status', 'ACTIVE');

    // 2. Total with Bills (Any status)
    const { count: withBills, error: err2 } = await supabase
        .from('survey_units')
        .select('survey_id, bills!inner(*)', { count: 'exact', head: true })
        .eq('city_district', 'SARGODHA')
        .eq('uc_name', 'MC-11');

    // 3. Active with Bills (Biller)
    const { count: activeBillers, error: err3 } = await supabase
        .from('survey_units')
        .select('survey_id, bills!inner(*)', { count: 'exact', head: true })
        .eq('city_district', 'SARGODHA')
        .eq('uc_name', 'MC-11')
        .eq('status', 'ACTIVE');

    console.log(`Total Active (status='ACTIVE'): ${totalActive}`);
    console.log(`Any records with bills: ${withBills}`);
    console.log(`Active records with bills (Biller): ${activeBillers}`);

    if (err1) console.error("Error 1:", err1);
    if (err2) console.error("Error 2:", err2);
    if (err3) console.error("Error 3:", err3);
}

checkMC11();
