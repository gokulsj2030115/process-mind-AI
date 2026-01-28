const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin(email, password) {
    if (!email || !password) {
        console.log("Usage: node create_admin.js <email> <password>");
        process.exit(1);
    }

    console.log(`Creating Admin: ${email}...`);

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log("User already exists. Updating password instead...");
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: passwordHash, role: 'admin' })
                .eq('email', email);

            if (updateError) throw updateError;
            console.log("Password updated successfully.");
        } else {
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ email, password_hash: passwordHash, role: 'admin' }]);

            if (insertError) throw insertError;
            console.log("Admin user created successfully.");
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

// Get from command line or use defaults
const args = process.argv.slice(2);
const email = args[0] || 'admin@processmind.ai';
const password = args[1] || 'ProcessMind2026!';

createAdmin(email, password);
