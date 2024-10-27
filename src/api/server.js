const { swaggerUi, swaggerDocs } = require('./swagger/swaggerDocs');
const express = require('express');

const cors = require('cors');





const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');


const app = express();
require('dotenv').config();
app.use(express.json());


// Allow CORS for all origins (for testing)
app.use(cors());


// Set up Swagger UI
    app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    app.use('/auth', authRoutes);
    app.use('/contacts',contactRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
