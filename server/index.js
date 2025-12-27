const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/api/categories', require('./routes/equipmentCategories'));
app.use('/api/work-centers', require('./routes/workCenters'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/worksheets', require('./routes/worksheets'));

// Test Route
app.get('/', (req, res) => {
    res.send('GearGuard API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
