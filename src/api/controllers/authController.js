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
            const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;
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

        if (!user.isVerified){
          return res.status(401).json({error: 'User not Verified. Please check your mail'})
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id,email:email }, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ token });
    });
};

exports.verifyEmail = async (req,res) => {
    const { token } = req.query;
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRow = await new Promise((resolve, reject) => {
        userService.getUserByEmail(decoded.email, (err, user) => {
            if (err) {
                reject(err); 
            } else {
                resolve(user); 
            }
        });
    });
    if (userRow){
        userRow.isVerified = true;
        const updateUserTable = await new Promise((resolve, reject) => {
            userService.updateUsersTable(decoded.email, (err, user) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
        return res.send(`isVerified: ${userRow.isVerified}`)
    }
  } catch (error) {
    return res.status(401).send('Invalid or expired token.');
  }

}

exports.sendOTP = async (req,res) => {
    const { email } = req.body;

  try {
    await userService.getUserByEmail(email,async (err, userRow) => {
        if (err) {
            return res.status(401).json({ error: err });
        }
        if (!userRow) {
          return res.status(404).send('User not found.');
        }

        const otp = crypto.randomInt(100000, 999999); // Generates a 6-digit OTP
        const expiresAt = Date.now() + 3600000; // Set expiration time (1 hour)

        await userService.saveOtpToDatabase(email, otp, expiresAt);

        await sendMail.sendVerificationEmail(email,email, `Your password reset code is: ${otp}`);

        res.status(200).send('Password reset code sent to your email.');
      }); 

    

    
  } catch (error) {
    res.status(500).send('Internal server error.');
  }
}

exports.resetPassword = async (req,res) => {
    const { email, otp, newPassword } = req.body;

  try {
    const otpData = await userService.getOtpFromDatabase(email);

    if (!otpData) {
      return res.status(400).send('No OTP found for this email.');
    }

    if (Number(otpData.otp) !== otp) {
      return res.status(400).send('Invalid OTP.');
    }

    if (Date.now() > otpData.otp_expires_at) {
      return res.status(400).send('OTP has expired.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUserPassword(email, hashedPassword); 
    await userService.deleteOtpFromDatabase(email);

    res.status(200).send('Password has been reset successfully.');
  } catch (error) {
    res.status(500).send('Internal server error.');
  }
}