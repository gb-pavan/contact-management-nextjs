const express = require('express');
const app = express();
app.use(express.json());

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); // Use a library for CSV parsing
const { createObjectCsvWriter } = require('csv-writer');
const {contactSchema } = require('../validators/userValidator');




const contactService = require('../services/contactService');

exports.addContact = async (req,res) => {
    const {user_mail,contact}= req.body;
    console.log("controller mail",user_mail);
    const { name,
    email,
    phone,
    address,
    timezone}= contact;
    contactService.addContact(user_mail,name,email,phone,address,timezone, async err => {
        if (err){
            return res.status(500).json({ error: err.message });
        }
        else{
            res.status(201).json({ message: 'Contact added successfully.' });
        }
    });
}

exports.getContacts = async (req, res) => {
    const { user_mail, filters = {}, sort = {}, dateRange = {} } = req.body;

    try {
        // Retrieve contacts from the database
        contactService.getContacts(user_mail, filters, sort, dateRange, (err, contacts) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ contacts });
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve contacts." });
    }
};

exports.updateContact = async (req, res) => {
    const { user_mail,contactId, updates } = req.body;

    try {
        // Call the database function to update the contact
        contactService.updateContact(user_mail,contactId, updates, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.changes === 0) {
                // If no rows were updated, the contact may not exist or is deleted
                return res.status(404).json({ error: "Contact not found or has been deleted." });
            }
            res.status(200).json({ message: "Contact updated successfully.", result });
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to update contact." });
    }
};

exports.deleteContact = async (req, res) => {
    const { user_mail, contactId } = req.body;
    console.log("delete");
    console.log("usermail",user_mail);
    console.log("contactid",contactId);

    try {
        // Call the database function to delete the contact
        contactService.deleteContact(user_mail, contactId, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.changes === 0) {
                // If no rows were updated, the contact may not exist or doesn't belong to the user
                return res.status(404).json({ error: "Contact not found or doesn't belong to the user." });
            }
            res.status(200).json({ message: "Contact deleted successfully." });
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete contact." });
    }
};


exports.batchProcessContacts = async (req, res) => {
    const { user_mail, contacts = [] } = req.body;

    try {

        // Call the model function to process contacts
        contactService.batchProcessContacts(user_mail, contacts, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Batch processing completed successfully.' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.uploadContacts = async (req, res) => {
    console.log("Uploaded file information:", req.file);

    if (!req.file) {
        console.log("No file uploaded.");
        return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    console.log("Using multer-provided filePath:", filePath);
    console.log("File exists check after upload:", fs.existsSync(filePath));

    const { user_mail } = req.body;
    console.log("User email:", user_mail);

    try {
        const contacts = [];

        if (req.file.mimetype === 'text/csv') {
            console.log("Detected file type:", req.file.mimetype);
            console.log("File path exists before streaming:", fs.existsSync(filePath));

            const readStream = fs.createReadStream(filePath);
            let hasError = false; // Track if any error occurs

            readStream
                .pipe(csv())
                .on('data', (row) => {
                    console.log("Row data before validation:", row);

                    const { error, value } = contactSchema.validate(row);
                    if (error) {
                        console.log("Validation error:", error.message);
                        hasError = true;  // Mark an error to avoid further processing
                        readStream.destroy();  // Stop stream processing
                        return res.status(400).json({ error: error.message });
                    }

                    console.log("Row after validation:", value);
                    contacts.push(value);
                })
                .on('end', async () => {
                    if (!hasError) {
                        console.log("Finished reading CSV. Total contacts:", contacts.length);
                        try {
                            await processContacts(contacts, user_mail);
                            res.status(200).json({ message: 'Contacts uploaded successfully.', contacts });
                        } catch (dbError) {
                            console.error("Database error:", dbError);
                            res.status(500).json({ error: 'Database error during contacts processing.' });
                        }
                    }
                })
                .on('close', () => {
                    if (fs.existsSync(filePath)) {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("Error deleting file:", err);
                            else console.log("File successfully deleted:", filePath);
                        });
                    }
                })
                .on('error', (streamError) => {
                    console.error("Stream error during CSV parsing:", streamError);
                    res.status(500).json({ error: 'Error during file read stream.' });
                });
        } else {
            // Handle Excel files if needed
        }
    } catch (error) {
        console.error("Outer try-catch error:", error);
        res.status(500).json({ error: 'Failed to process the uploaded file.' });
    }
};

const processContacts = async (contacts, user_mail) => {
    for (const contact of contacts) {
        await new Promise((resolve, reject) => {
            contactService.addContact(
                user_mail,
                contact.name,
                contact.email,
                contact.phone,
                contact.address,
                contact.timezone,
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
};

exports.downloadContacts = async (req, res) => {
    const user_mail = req.query.user_mail;
    try {
        const contacts = await contactService.getContactsByEmail(user_mail);
        console.log("contacts download", contacts);

        const exportPath = path.join(__dirname, '../exports');
        console.log("Checking path:", exportPath);

        // Ensure the exports directory exists
        if (!fs.existsSync(exportPath)) {
            fs.mkdirSync(exportPath, { recursive: true });
        }

        const filePath = path.join(exportPath, 'contacts.csv');
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'phone', title: 'Phone' },
                { id: 'address', title: 'Address' },
                { id: 'timezone', title: 'Timezone' },
                { id: 'created_at', title: 'Created At' }
            ]
        });

        // Write records to the CSV file
        await csvWriter.writeRecords(contacts);
        console.log("CSV file created at:", filePath);
        
        // Send the file as a response
        res.download(filePath, 'contacts.csv', (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).send("Could not download the file.");
            } else {
                console.log("File sent successfully.");
            }
        });
    } catch (error) {
        console.error("Error in downloadContacts:", error);
        res.status(500).send("Error creating or downloading the CSV file.");
    }
};





