const moment = require('moment');
require('moment-timezone');


const db = require('../database/database');
const user = require('../services/userService')

exports.addContact = async (user_mail,name,email,phone,address,timezone, callback) => {
    // const user_row = await user.getUserByEmail(user_mail,()=>{});
        const user_row = await new Promise((resolve, reject) => {
        user.getUserByEmail(user_mail, (err, user) => {
            if (err) {
                reject(err); // Reject the promise if there's an error
            } else {
                resolve(user); // Resolve with the user row
            }
        });
    });

    const query = `INSERT INTO contacts (user_id, name, email, phone, address, timezone, created_at, updated_at,is_deleted) VALUES (?, ?, ?, ?, ?, ?,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,0)`;
    db.run(query, [user_row.id, name, email, phone, address, timezone], function(err) {
        callback(err, this);
    });
};

exports.getContacts = async (user_mail, filters = {}, sort = {},dateRange = {}, callback) => {
    // const user_row = await user.getUserByEmail(user_mail);

    // const user_row = await user.getUserByEmail(user_mail,()=>{});
        const user_row = await new Promise((resolve, reject) => {
        user.getUserByEmail(user_mail, (err, user) => {
            if (err) {
                reject(err); // Reject the promise if there's an error
            } else {
                resolve(user); // Resolve with the user row
            }
        });
    });
    
    // Base query
    let query = `SELECT * FROM contacts WHERE user_id = ? AND is_deleted = 0`;
    const params = [user_row.id];
    
    // Add filters
    if (filters.name) {
        query += ` AND name LIKE ?`;
        params.push(`%${filters.name}%`);
    }
    if (filters.email) {
        query += ` AND email LIKE ?`;
        params.push(`%${filters.email}%`);
    }
    if (filters.timezone) {
        query += ` AND timezone = ?`;
        params.push(filters.timezone);
    }
    
    // Add sorting
    if (sort.field && sort.order) {
        query += ` ORDER BY ${sort.field} ${sort.order.toUpperCase()}`;
    }

    // Add date range filter if provided
    if (dateRange.startDate && dateRange.endDate) {
        query += ` AND created_at BETWEEN ? AND ?`;
        params.push(dateRange.startDate, dateRange.endDate);
    }
    
    // Execute query
    db.all(query, params, (err, rows) => {
        if (err) {
            return callback(err);
        }

       console.log("filtered rows",rows);

        // Convert timestamps to user's timezone
        const convertedRows = rows.map(row => { 
            console.log("created_at", row.created_at);
            console.log("filters",filters.timezone);
            return {
                ...row,
                created_at: moment.utc(row.created_at).tz(filters.timezone).format(), // Convert to user's timezone
                updated_at: moment.utc(row.updated_at).tz(filters.timezone).format() // Convert to user's timezone
            };
        });

        callback(null, convertedRows);
    });
};

// exports.updateContact = async (user_mail,contactId, updates, callback) => {

//     const user_row = await user.findUserByEmail(user_mail);
//     const query = `
//         UPDATE contacts 
//         SET name = COALESCE(?, name),
//             email = COALESCE(?, email),
//             phone = COALESCE(?, phone),
//             address = COALESCE(?, address),
//             timezone = COALESCE(?, timezone),
//             updated_at = CURRENT_TIMESTAMP
//         WHERE id = ? AND is_deleted = 0 AND user_id = ?
//     `;
    
//     const { name, email, phone, address, timezone } = updates;
//     db.run(query, [name, email, phone, address, timezone, contactId, user_mail.id], function(err) {
//         callback(err, this);
//     });
// };

exports.updateContact = async (user_mail, contactId, updates, callback) => {
    try {
        // const user_row = await user.getUserByEmail(user_mail,()=>{});
        const user_row = await new Promise((resolve, reject) => {
            user.getUserByEmail(user_mail, (err, user) => {
                if (err) {
                    reject(err); // Reject the promise if there's an error
                } else {
                    resolve(user); // Resolve with the user row
                }
            });
        });
        
        // Check if user_row is found
        if (!user_row) {
            return callback(new Error("User not found"), null);
        }

        const userId = user_row.id; // Assuming user_row has an id property
        
        const query = `
            UPDATE contacts 
            SET name = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                address = COALESCE(?, address),
                timezone = COALESCE(?, timezone),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_deleted = 0 AND user_id = ?
        `;
        
        const { name, email, phone, address, timezone } = updates;
        
        db.run(query, [name, email, phone, address, timezone, contactId, userId], function(err) {
            if (err) {
                return callback(err, null);
            }
            // Check if any rows were updated
            if (this.changes === 0) {
                return callback(new Error("No contact found with the provided ID for this user."), null);
            }
            callback(null, this);
        });
    } catch (err) {
        callback(err, null);
    }
};


// exports.deleteContact = async (user_mail,contactId, callback) => {
//     const user_row = await user.findUserByEmail(user_mail)
//     const query = `
//         UPDATE contacts 
//         SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP 
//         WHERE id = ? AND user_id = ?
//     `;
    
//     db.run(query, [contactId,user_row.id ], function(err) {
//         callback(err, this);
//     });
// };

exports.deleteContact = async (user_mail, contactId, callback) => {
    // const user_row = await user.getUserByEmail(user_mail,()=>{});
        const user_row = await new Promise((resolve, reject) => {
            user.getUserByEmail(user_mail, (err, user) => {
                if (err) {
                    reject(err); // Reject the promise if there's an error
                } else {
                    resolve(user); // Resolve with the user row
                }
            });
        });
    if (!user_row) {
        return callback(new Error("User not found"), null); // Handle the case where the user is not found
    }

    const query = `
        UPDATE contacts 
        SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
    `;
    
    db.run(query, [contactId, user_row.id], function(err) {
        callback(err, this);
    });
};

exports.batchProcessContacts = async (user_mail, contacts, callback) => {
    const user_row = await new Promise((resolve, reject) => {
            user.getUserByEmail(user_mail, (err, user) => {
                if (err) {
                    reject(err); // Reject the promise if there's an error
                } else {
                    resolve(user); // Resolve with the user row
                }
            });
        });

        console.log("user_row",user_row);

        if (!user_row) {
            return callback(new Error("User not found"), null);
        }
    const addQuery = `INSERT INTO contacts (user_id, name, email, phone, address, timezone) VALUES (?, ?, ?, ?, ?, ?)`;
    const updateQuery = `
        UPDATE contacts SET 
            name = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            address = COALESCE(?, address),
            timezone = COALESCE(?, timezone),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_deleted = 0 AND user_id = ?
    `;

    const promises = contacts.map(contact => {
        return new Promise((resolve, reject) => {
            const { id, name, email, phone, address, timezone } = contact;

            if (id) {
                // Update existing contact
                db.run(updateQuery, [name, email, phone, address, timezone, id, user_row.id], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    if (this.changes === 0) {
                        return reject(new Error("Contact not found or has been deleted."));
                    }
                    resolve();
                });
            } else {
                // Add new contact
                db.run(addQuery, [user_row.id, name, email, phone, address, timezone], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });
    });

    Promise.all(promises)
        .then(() => callback(null))
        .catch(err => callback(err));
};


// contactModel.js

exports.getContactsByEmail = async (userMail) => {
    console.log("userMail",userMail);
    const user_row = await new Promise((resolve, reject) => {
            user.getUserByEmail(userMail, (err, user) => {
                if (err) {
                    reject(err); // Reject the promise if there's an error
                } else {
                    resolve(user); // Resolve with the user row
                }
            });
        });
    console.log("userRow",user_row);

    return new Promise((resolve, reject) => {
        const query = `SELECT name, email, phone, address, timezone, created_at 
                       FROM contacts WHERE user_id = ? AND is_deleted = 0`;
        db.all(query, [user_row.id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};



