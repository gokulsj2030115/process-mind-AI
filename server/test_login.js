const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    const email = 'admin@example.com';
    const password = 'password123';

    console.log(`--- Testing Login for ${email} ---`);

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.error('User not found in database.');
            return;
        }

        console.log('User found. Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            console.log('SUCCESS: Credentials are valid.');
        } else {
            console.log('FAILURE: Invalid password.');
            console.log('Hash in DB:', user.password_hash);
        }

    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

testLogin();
