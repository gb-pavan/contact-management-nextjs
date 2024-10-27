const { swaggerUi, swaggerDocs } = require('./swagger/swaggerDocs');
const express = require('express');


const authRoutes = require('./routes/authRoutes');


const app = express();
require('dotenv').config();
app.use(express.json());

// Set up Swagger UI
    app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
