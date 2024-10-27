const express = require('express');
const contactController = require('../controllers/contactController');
const router = express.Router();
const upload = require('../middlewares/fileUpload');


router.post('/upload', upload.single('file'), contactController.uploadContacts);

/**
 * @swagger
 * /contacts/add-contact:
 *   post:
 *     summary: Add a new contact
 *     description: Creates a new contact associated with a user.
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_mail:
 *                 type: string
 *                 format: email
 *                 description: The email of the user adding the contact.
 *               contact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the contact.
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The email of the contact.
 *                   phone:
 *                     type: string
 *                     description: The phone number of the contact.
 *                   address:
 *                     type: string
 *                     description: The address of the contact.
 *                   timezone:
 *                     type: string
 *                     description: The timezone of the contact.
 *     responses:
 *       201:
 *         description: Contact added successfully.
 *       500:
 *         description: Internal server error.
 */


router.post('/add-contact', contactController.addContact);

/**
 * @swagger
 * /contacts/get-contacts:
 *   get:
 *     summary: Retrieve contacts
 *     description: Fetches a list of contacts for a user, with optional filters and sorting.
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_mail:
 *                 type: string
 *                 format: email
 *                 description: The email of the user whose contacts are to be retrieved.
 *               filters:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 description: Optional filters to apply when retrieving contacts.
 *               sort:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     description: The field by which to sort the contacts.
 *                   order:
 *                     type: string
 *                     enum: [asc, desc]
 *                     description: The sort order (ascending or descending).
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: The start date for filtering contacts.
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: The end date for filtering contacts.
 *     responses:
 *       200:
 *         description: Successfully retrieved contacts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the contact.
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: The email of the contact.
 *                       phone:
 *                         type: string
 *                         description: The phone number of the contact.
 *                       address:
 *                         type: string
 *                         description: The address of the contact.
 *                       timezone:
 *                         type: string
 *                         description: The timezone of the contact.
 *       500:
 *         description: Internal server error.
 */


router.get('/get-contacts', contactController.getContacts);

/**
 * @swagger
 * /contacts/update-contact:
 *   put:
 *     summary: Update an existing contact
 *     description: Updates the details of a specific contact for a user.
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_mail:
 *                 type: string
 *                 format: email
 *                 description: The email of the user updating the contact.
 *               contactId:
 *                 type: number
 *                 description: The ID of the contact to be updated.
 *               updates:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The updated name of the contact.
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: The updated email of the contact.
 *                   phone:
 *                     type: string
 *                     description: The updated phone number of the contact.
 *                   address:
 *                     type: string
 *                     description: The updated address of the contact.
 *                   timezone:
 *                     type: string
 *                     description: The updated timezone of the contact.
 *     responses:
 *       200:
 *         description: Contact updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 result:
 *                   type: object
 *                   description: Result of the update operation.
 *       404:
 *         description: Contact not found or has been deleted.
 *       500:
 *         description: Internal server error.
 */


router.put('/update-contact', contactController.updateContact);


/**
 * @swagger
 * /contacts/delete-contact:
 *   delete:
 *     summary: Delete a contact
 *     description: Deletes a specific contact for a user.
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_mail:
 *                 type: string
 *                 format: email
 *                 description: The email of the user deleting the contact.
 *               contactId:
 *                 type: number
 *                 description: The ID of the contact to be deleted.
 *     responses:
 *       200:
 *         description: Contact deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       404:
 *         description: Contact not found or doesn't belong to the user.
 *       500:
 *         description: Internal server error.
 */

router.delete('/delete-contact', contactController.deleteContact);


/**
 * @swagger
 * /contacts/batch-update-contacts:
 *   post:
 *     summary: Batch process contacts
 *     description: Processes a batch of contacts for a user.
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_mail:
 *                 type: string
 *                 format: email
 *                 description: The email of the user processing the contacts.
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the contact.
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: The email of the contact.
 *                     phone:
 *                       type: string
 *                       description: The phone number of the contact.
 *                     address:
 *                       type: string
 *                       description: The address of the contact.
 *                     timezone:
 *                       type: string
 *                       description: The timezone of the contact.
 *     responses:
 *       200:
 *         description: Batch processing completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       500:
 *         description: Internal server error.
 */


router.post('/batch-update-contacts', contactController.batchProcessContacts);


/**
 * @swagger
 * /contacts/download:
 *   get:
 *     summary: Download contacts
 *     description: Downloads all contacts for a specified user as a CSV file.
 *     tags: [Contacts]
 *     parameters:
 *       - name: user_mail
 *         in: query
 *         required: true
 *         description: The email of the user whose contacts are being downloaded.
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */



// Route to download all contacts as a CSV or Excel file
router.get('/download', contactController.downloadContacts);

/**
 * @swagger
 * contacts/upload-file:
 *   post:
 *     summary: Upload contacts
 *     description: Uploads a CSV or Excel file containing contacts for a user.
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_mail:
 *                 type: string
 *                 format: email
 *                 description: The email of the user uploading the contacts.
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file containing the contacts (CSV or Excel).
 *     responses:
 *       200:
 *         description: Contacts uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 contacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 *       400:
 *         description: No file uploaded or validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */

router.post('/upload', upload.single('file'), contactController.uploadContacts)


module.exports = router;