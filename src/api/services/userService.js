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