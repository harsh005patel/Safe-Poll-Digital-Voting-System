import express from 'express'
import cors from 'cors'
import {connect} from 'mongoose'
import dotenv from 'dotenv'
import Routes from './routes/Routes.js'
import {notFound, errorHandler} from './middleware/errorMiddleware.js'
import upload from 'express-fileupload'
import path from 'path'
import { fileURLToPath } from 'url'
import updateElectionStatus from './jobs/updateElectionStatus.js'
import Election from './models/election.model.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(upload())
app.use(cors({credentials: true, origin: ["http://localhost:3000"]}))
app.use('/api', Routes)
app.use(notFound)
app.use(errorHandler)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add more detailed MongoDB connection logging
connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Successfully connected to MongoDB.');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        // Initialize election status update job
        await Election.updateActiveStatus();
        console.log('Initial election status update completed');
        
        app.listen(process.env.PORT, ()=> {
            console.log('Connected to MongoDB.')
            console.log(`Server is running on port ${process.env.PORT}.`)
            console.log(`Server URL: http://localhost:${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err)
        console.error('Full error:', JSON.stringify(err, null, 2))
    })

// Add basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});