const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const journalRoutes = require('./routes/journal');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/journal', journalRoutes);

//Basic Check
app.get('/', (req, res) => res.send('ArvyaX API is running'));

// Database Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));