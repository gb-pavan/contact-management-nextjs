const { swaggerUi, swaggerDocs } = require('./swagger/swaggerDocs');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/auth', authRoutes);
app.use('/contacts',contactRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
