const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL or Key is missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    const results = {
        timestamp: new Date().toISOString(),
        supabaseUrl,
        users: [],
        error: null
    };

    try {
        const { data, error } = await supabase
            .from('users')
            .select('email, role, created_at');

        if (error) {
            results.error = error;
        } else {
            results.users = data;
        }
    } catch (err) {
        results.error = err.message;
    }

    fs.writeFileSync('debug_auth_results.json', JSON.stringify(results, null, 2));
    console.log('Results written to debug_auth_results.json');
}

checkUsers();
