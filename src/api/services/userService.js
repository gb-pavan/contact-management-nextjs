const db = require('../database/database');

exports.createUser = async (email,hashedPassword,callback) => {
    const query = `INSERT INTO users (email,password, isVerified) VALUES (?, ?, ?)`;
    db.run(query, [email,hashedPassword, false], err => {
        callback(err,this);
    });
};

// Function to fetch a user by email
exports.getUserByEmail = (email, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        callback(err, user);
    });
};

exports.updateUsersTable= (email, callback) => {
    const query = `UPDATE users SET isVerified = 1 WHERE email = ?`;
    db.run(query, [email], (err) => {
        callback(err);
    });
};


// Save OTP to database
exports.saveOtpToDatabase = (email, otp, expiresAt) => {
  const query = `UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?`;
  return new Promise((resolve, reject) => {
    db.run(query, [otp, expiresAt, email], function(err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

// Get OTP from database
exports.getOtpFromDatabase = (email) => {
  const query = `SELECT otp, otp_expires_at FROM users WHERE email = ?`;
  return new Promise((resolve, reject) => {
    db.get(query, [email], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Update user's password
exports.updateUserPassword = (email, hashedPassword) => {
  const query = `UPDATE users SET password = ? WHERE email = ?`;
  return new Promise((resolve, reject) => {
    db.run(query, [hashedPassword, email], function(err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

// Delete OTP from database
exports.deleteOtpFromDatabase = (email) => {
  const query = `UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE email = ?`;
  return new Promise((resolve, reject) => {
    db.run(query, [email], function(err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}
