const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const {userSchema} = require('../validators/userValidator');
const sendMail = require('../utils/emailService');
const crypto = require('crypto');
 

const SECRET_KEY = "your_secret_key";

// Register a new user
exports.register = async (req, res) => {
    const { email, password } = req.body;    
    const { error } = userSchema.validate({ email, password });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    
    userService.createUser(email, hashedPassword, async (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        else{

            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            const verificationUrl = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;
            await sendMail.sendVerificationEmail(email, email, verificationUrl);
            res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
        }
    });

    
};

// Login a user and generate a token
exports.login = (req, res) => {
    const { email, password } = req.body;

    userService.getUserByEmail(email, async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log("user details",user);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id,email:email }, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ token });
    });
};