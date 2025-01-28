// server.js
import express from 'express';
import routes from './routes/index';
import process from 'process';
import fileQueue from './worker';
import redisClient from './utils/redis';

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/', routes);

// Start server - modified to listen on all interfaces
const server = app.listen(port, host,() => {
    console.log(`Server app listening on port ${port} and Host ${host}`);
});

// Handle errors
server.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
});
