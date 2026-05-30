require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const shiftRoutes = require('./routes/shiftRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/worker/shifts', shiftRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Healthcare Shift Marketplace API is running.');
});

// Database connection
mongoose.connect('mongodb://localhost:27017/healthcareshifts')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((error) => {
    console.log('Database connection failed', error.message);
  });