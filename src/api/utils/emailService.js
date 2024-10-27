const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

const serviceId = process.env.EMAIL_SERVICE_ID;
const templateId = process.env.EMAIL_TEMPLATE_ID;
const privateKey = process.env.EMAIL_PRIVATE_KEY;
const publicKey = process.env.EMAIL_PUBLIC_KEY;

exports.sendVerificationEmail = (userName, userEmail, verificationLink) => {
  const emailParams = {
    user_name: userName,
    user_email: userEmail,
    verification_link: verificationLink,
  };

  emailjs.send(serviceId, templateId, emailParams, { publicKey:publicKey,  privateKey: privateKey })
    .then((result) => {
      console.log('Email sent successfully:', result.text);
    })
    .catch((error) => {
      console.error('Error sending email:', error);
    });
};

// Example usage
// const userName = 'John Doe';
// const userEmail = 'johndoe@example.com';
// const verificationLink = `https://yourapp.com/verify?token=yourGeneratedToken`;

// sendVerificationEmail(userName, userEmail, verificationLink);

