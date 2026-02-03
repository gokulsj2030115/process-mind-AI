const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if keys are present
if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing. Database connection will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
