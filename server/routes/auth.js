const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Password Validation Regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

// Register
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
            return res.status(401).json("User already exists");
        }

        // 2. Validate Password
        if (!passwordRegex.test(password)) {
            return res.status(400).json("Password must contain at least 8 characters, one uppercase, one lowercase, and one special character.");
        }

        // 3. Bcrypt the user password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // 4. Enter the new user inside our database
        // Default role is 'portal_user' as per requirements
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'portal_user') RETURNING *",
            [name, email, bcryptPassword]
        );

        // 5. Generating our jwt token
        const token = jwt.sign({ user: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: newUser.rows[0].id, name: newUser.rows[0].name, email: newUser.rows[0].email, role: newUser.rows[0].role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user doesn't exist
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json("Account not exist");
        }

        // 2. Check if incoming password is the same the database password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json("Invalid Password");
        }

        // 3. Give them the jwt token
        const token = jwt.sign({ user: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email, role: user.rows[0].role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
