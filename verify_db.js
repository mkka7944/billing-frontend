
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the appropriate location
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDistricts() {
    console.log('Fetching counts and unique samples...');

    // Total count
    const { count, error: cError } = await supabase
        .from('survey_units')
        .select('*', { count: 'exact', head: true });

    console.log('Total survey_units:', count);

    // Fetch first 1000
    const { data, error } = await supabase
        .from('survey_units')
        .select('city_district')
        .limit(1000);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const unique = [...new Set(data.map(i => i.city_district))];
    console.log('Unique districts in first 1000 rows:', unique);

    // Try specifically for Sargodha
    const { data: sargodhaData, error: sError } = await supabase
        .from('survey_units')
        .select('city_district, tehsil, uc_name')
        .ilike('city_district', '%Sargodha%')
        .limit(1);

    if (sError) {
        console.error('Sargodha Error:', sError);
    } else {
        console.log('Sargodha entries found:', sargodhaData.length);
        if (sargodhaData.length > 0) {
            console.log('RAW Sargodha Row:', JSON.stringify(sargodhaData[0]));
        }
    }
}

checkDistricts();
