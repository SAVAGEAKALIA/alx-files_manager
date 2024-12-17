/* eslint-disable */
import express from 'express';
import routes from './routes/index';
import process from 'process';
import fileQueue from './worker';
import redisClient from './utils/redis';
const app = express()
const port = process.env.PORT || 5000;

//use middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


//use all routes
app.use('/', routes)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
export default app;
