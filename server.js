require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const registrationRoutes = require('./routes/registration');
const storeHugsRoutes = require('./routes/storeHugs');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'https://medicaltraininghub.com',
  'https://www.medicaltraininghub.com',
  'http://medicaltraininghub.com',
  'http://www.medicaltraininghub.com',
];

const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.get('/mth-config.js', (_req, res) => {
  const apiBase = (process.env.API_PUBLIC_URL || process.env.API_BASE_URL || '').replace(/\/$/, '');
  res.type('application/javascript');
  res.send(`window.MTH_API_BASE = '${apiBase || ''}';\n`);
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', registrationRoutes);
app.use('/api', storeHugsRoutes);
app.use('/api/admin', authRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.redirect('/login');
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
