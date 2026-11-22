require('dotenv').config();
const dns = require('dns');
// Set public DNS servers to resolve MongoDB Atlas SRV records when ISP DNS blocks querySrv
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in environment
}

const mongoose = require('mongoose');
const app = require('./app');
const { archiveExpiredItems } = require('./services/archive');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lostx';

async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Run item auto-archiving on startup and every 24 hours
    archiveExpiredItems().catch(() => {});
    setInterval(() => {
      archiveExpiredItems().catch(() => {});
    }, 24 * 60 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`LostX API Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.warn('\nNote: Ensure your MongoDB Atlas connection string is configured in server/.env,');
    console.warn('or start a local MongoDB instance on port 27017.\n');
    
    // Still start the HTTP server so health checks and CORS work
    app.listen(PORT, () => {
      console.log(`LostX API Server is listening on http://localhost:${PORT} (Database pending connection)`);
    });
  }
}

startServer();
