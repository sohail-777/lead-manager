require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const { MONGODB_URI, JWT_SECRET, PORT = 5000 } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Missing MONGODB_URI or JWT_SECRET. Copy server/.env.example to server/.env');
  process.exit(1);
}

connectDB(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
