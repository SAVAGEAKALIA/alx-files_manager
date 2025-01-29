/* eslint-disable */
// server.js
import express from 'express';
//Changed routes to router to check if error from here
import router from './routes/index';
import process from 'process';
import fileQueue from './worker';
import redisClient from './utils/redis';

const app = express();
const port = process.env.PORT || 5000;

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/', router);

// Start server - modified to listen on all interfaces
app.listen(port,() => {
    console.log(`Server app listening on port ${port}`);
});
