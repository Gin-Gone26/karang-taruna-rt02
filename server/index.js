const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- Tambahkan ini
require('dotenv').config();
const db = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Izinkan akses publik ke folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // <-- Tambahkan ini

app.get('/', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API Karang Taruna RT 02 sudah berjalan!' 
  });
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});