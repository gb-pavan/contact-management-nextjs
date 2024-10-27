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

        console.log("user",user);

        if (!user.isVerified){
          return res.status(401).json({error: 'User not Verified. Please check your mail'})
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id,email:email }, SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ token });
    });
};

exports.verifyEmail = async (req,res) => {
    const { token } = req.query;
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const userRow = userService.getUserByEmail(decoded.email);
    const userRow = await new Promise((resolve, reject) => {
        userService.getUserByEmail(decoded.email, (err, user) => {
            if (err) {
                reject(err); // Reject the promise if there's an error
            } else {
                resolve(user); // Resolve with the user row
            }
        });
    });
    if (userRow){
        userRow.isVerified = true;
        const updateUserTable = await new Promise((resolve, reject) => {
            userService.updateUsersTable(decoded.email, (err, user) => {
                if (err) {
                    reject(err); // Reject the promise if there's an error
                } else {
                    resolve(user); // Resolve with the user row
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

            // Generate a one-time code (OTP)
        const otp = crypto.randomInt(100000, 999999); // Generates a 6-digit OTP
        const expiresAt = Date.now() + 3600000; // Set expiration time (1 hour)

        // Store OTP and expiration time in the database
        await userService.saveOtpToDatabase(email, otp, expiresAt); // Implement this function

        // Send the OTP to the user's email
        await sendMail.sendVerificationEmail(email,email, `Your password reset code is: ${otp}`);

        res.status(200).send('Password reset code sent to your email.');
      }); // Assuming this function is implemented

    

    
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).send('Internal server error.');
  }
}

exports.resetPassword = async (req,res) => {
    const { email, otp, newPassword } = req.body;

  try {
    // Retrieve OTP and expiration time from the database
    const otpData = await userService.getOtpFromDatabase(email); // Implement this function

    if (!otpData) {
      return res.status(400).send('No OTP found for this email.');
    }

    // Verify the OTP
    if (Number(otpData.otp) !== otp) {
      return res.status(400).send('Invalid OTP.');
    }

    // Check if OTP is expired
    if (Date.now() > otpData.otp_expires_at) {
      return res.status(400).send('OTP has expired.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await userService.updateUserPassword(email, hashedPassword); // Implement this function

    // Optionally, delete the OTP from the database
    await userService.deleteOtpFromDatabase(email); // Implement this function

    res.status(200).send('Password has been reset successfully.');
  } catch (error) {
    res.status(500).send('Internal server error.');
  }
}