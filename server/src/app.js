const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { STATUSES, SOURCES } = require('./constants');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/meta', (req, res) => res.json({ statuses: STATUSES, sources: SOURCES }));
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api', notFound);

// In production, serve the built React app from the same server (single deploy).
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

module.exports = app;
