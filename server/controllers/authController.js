const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// @route   POST /api/auth/register
// @desc    Register a user (farmer by default)
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        // Ensure only allowed roles are provided; default to 'farmer'
        const userRole = (role && role === 'admin') ? 'admin' : 'farmer';

        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
            [name, email, password_hash, userRole]
        );

        // Return JWT
        const payload = {
            user: {
                id: newUser.rows[0].id,
                role: newUser.rows[0].role
            }
        };

        const secret = process.env.JWT_SECRET || 'secret';

        jwt.sign(
            payload,
            secret,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ msg: 'User registered successfully', token, user: newUser.rows[0] });
            }
        );
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check for user
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const foundUser = user.rows[0];

        // Match password
        const isMatch = await bcrypt.compare(password, foundUser.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: foundUser.id,
                role: foundUser.role
            }
        };

        const secret = process.env.JWT_SECRET || 'secret';

        jwt.sign(
            payload,
            secret,
            { expiresIn: '7d' }, // 7 days expiry
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role } });
            }
        );

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error');
    }
};
