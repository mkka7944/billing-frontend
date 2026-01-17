
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ipegpbgcektdtbnfvhvc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVIn0.eyJyO0qvvTjRbKQQqHWNpsDbCBCeT9hPMgnAyE2bE";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMC11() {
    console.log("Investigating MC-11 Sargodha...");

    const { count: totalActive } = await supabase
        .from('survey_units')
        .select('*', { count: 'exact', head: true })
        .eq('city_district', 'SARGODHA')
        .eq('uc_name', 'MC-11')
        .eq('status', 'ACTIVE');

    const { count: activeBillers } = await supabase
        .from('survey_units')
        .select('survey_id, bills!inner(*)', { count: 'exact', head: true })
        .eq('city_district', 'SARGODHA')
        .eq('uc_name', 'MC-11')
        .eq('status', 'ACTIVE');

    console.log(`Total Active: ${totalActive}`);
    console.log(`Active Billers: ${activeBillers}`);
}

checkMC11();
