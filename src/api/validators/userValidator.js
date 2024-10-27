const Joi = require('joi'); 

// User schema for validating user data
const userSchema = Joi.object({
    email: Joi.string().email().required(), 
    password: Joi.string().min(6).required(),
});

// Contact schema for validating contact data
const contactSchema = Joi.object({
    name: Joi.string().max(255).required(),
    email: Joi.string().email().max(255).required(),
    phone: Joi.string().max(15).required(),
    address: Joi.string().required(),
    timezone: Joi.string().max(50).required()
});

module.exports = {
    userSchema,
    contactSchema
};




