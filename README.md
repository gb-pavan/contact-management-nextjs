


*** Contact Management App ***
This application provides a RESTful API for user authentication and contact management. It is built using Node.js and Express. API end points are tested using swagger.

*** Running the Backend Server ***
To start the backend server, run:

`npm run dev` 

It will run the application, it runs the backend server as well.

*** API Endpoints ***

### *** Register User ***
- **Path:** `http://localhost:3000/auth/register`
- **Method:** `POST`
- **Request Body:**
    ```json
    Copy code
    {
    "email": "testten@example.com",
    "password": "pass10"
    }```
-**Response:** A link will be sent to the provided email for verification. When clicked, the isVerified column in the users table is set to true.

### *** Login User ***
- **Path:** `http://localhost:3000/auth/login`
- **Method:** `POST`
- **Request Body:**
    ```json
    Copy code
    {
    "email": "testten@example.com",
    "password": "pass10"
    }```
-**Response:** Upon successful login, you will receive a JWT token.

### *** Forgot Password ***
- **Path:** `http://localhost:3000/auth/forgot/forgot-password`
- **Method:** `POST`
-  **Request Body:**
    ```json
    Copy code
    {
    "email": "testten@example.com"
    }```
- **Response:** An OTP will be sent to the provided email for password reset.


### *** Reset Password ***
- **Path:**  `http://localhost:3000/auth/reset/reset-password`
- **Method:** `POST`
- **Request Body:**
    ```json
    Copy code
    {
    "email": "testten@example.com",
    "otp": 992911,
    "newPassword": "passnew"
    }```
- **Response:** If the OTP is valid, the password will be reset successfully, and a confirmation message will be returned.



### *** Upload Contacts ***

- **Method:** `POST`
- **Path:** `http://localhost:3000/contacts/upload`
- **Description:** Uploads a CSV or Excel file containing contacts for a user.
- **Request Body:**
    ```json
    {
        "user_mail": "user@example.com",
        "file": "binary file"
    }
    ```
- **Response:** Contacts uploaded successfully.

### *** Add a New Contact ***

- **Method:** `POST`
- **Path:** `http://localhost:3000/contacts/add-contact`
- **Description:** Creates a new contact associated with a user.
- **Request Body:**
    ```json
    {
        "user_mail": "user@example.com",
        "contact": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "1234567890",
            "address": "123 Main St, City, Country",
            "timezone": "GMT+5:30"
        }
    }
    ```
- **Response:** Contact added successfully.

### *** Retrieve Contacts ***

- **Method:** `GET`
- **Path:** `http://localhost:3000/contacts/get-contacts`
- **Description:** Fetches a list of contacts for a user, with optional filters and sorting.
- **Request Body:**
    ```json
    {
        "user_mail": "user@example.com",
        "filters": {
            "field1": "value1"
        },
        "sort": {
            "field": "name",
            "order": "asc"
        },
        "dateRange": {
            "startDate": "2023-01-01",
            "endDate": "2023-12-31"
        }
    }
    ```
- **Response:** Successfully retrieved contacts.

### *** Update an Existing Contact ***

- **Method:** `PUT`
- **Path:** `http://localhost:3000/contacts/update-contact`
- **Description:** Updates the details of a specific contact for a user.
- **Request Body:**
    ```json
    {
        "user_mail": "user@example.com",
        "contactId": 1,
        "updates": {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "0987654321",
            "address": "456 Main St, City, Country",
            "timezone": "GMT+5:30"
        }
    }
    ```
- **Response:** Contact updated successfully.

### *** Delete a Contact ***

- **Method:** `DELETE`
- **Path:** `http://localhost:3000/contacts/delete-contact`
- **Description:** Deletes a specific contact for a user.
- **Request Body:**
    ```json
    {
        "user_mail": "user@example.com",
        "contactId": 1
    }
    ```
- **Response:** Contact deleted successfully.

### *** Batch Process Contacts ***

- **Method:** `POST`
- **Path:** `http://localhost:3000/contacts/batch-update-contacts`
- **Description:** Processes a batch of contacts for a user.
- **Request Body:**
    ```json
    {
        "user_mail": "user@example.com",
        "contacts": [
            {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "1234567890",
                "address": "123 Main St, City, Country",
                "timezone": "GMT+5:30"
            },
            {
                "name": "Jane Doe",
                "email": "jane.doe@example.com",
                "phone": "1234567891",
                "address": "456 Main St, City, Country",
                "timezone": "GMT+5:30"
            }
        ]
    }
    ```
- **Response:** Batch processing completed successfully.

### *** Download Contacts ***

- **Method:** `GET`
- **Path:** `http://localhost:3000/contacts/download`
- **Description:** Downloads all contacts for a specified user as a CSV file.
- **Query Parameter:** 
    - **user_mail:** The email of the user whose contacts are being downloaded.
- **Response:** CSV file downloaded successfully.

### *** Upload Contacts File ***

- **Method:** `POST`
- **Path:** `http://localhost:3000/contacts/upload-file`
- **Description:** Uploads a CSV or Excel file containing contacts for a user.
- **Request Body:**
    ```json
    {
        "user_mail": "user@example.com",
        "file": "binary file"
    }
    ```
- **Response:** Contacts uploaded successfully.


*** End of Document ***

