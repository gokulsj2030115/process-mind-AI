const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdmin() {
    const email = 'admin@example.com';
    const newPassword = 'password123';

    console.log(`Resetting password for ${email}...`);

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        const { data, error } = await supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('email', email);

        if (error) {
            console.error('Error updating password:', error.message);
            return;
        }

        console.log('Password successfully reset to: password123');
    } catch (err) {
        console.error('Unexpected Error:', err.message);
    }
}

resetAdmin();
