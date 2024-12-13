/* eslint-disable */
import express from 'express';
import routes from './routes/index';
import process from 'process';
const app = express()
const port = process.env.PORT || 5000;

//use middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//use all routes
app.use('/', routes)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
export default app;
