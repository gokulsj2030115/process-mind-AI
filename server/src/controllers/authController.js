const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Admin (Seed function or internal tool)
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password_hash: passwordHash,
                    role: 'admin' // Defaulting to admin for this specialized app
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email } });
    } catch (err) {
        console.error("Registration Error LOG:", err);
        res.status(500).json({ message: 'Server error', error: err.message, details: err });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.log("Login Failed: User not found or DB error", error);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`Login Attempt for ${email}: Match Result = ${isMatch}`);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, role, created_at')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
