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
import initializeUploads from './setup-uploads.js'

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize upload directories
initializeUploads();

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configure file upload middleware
app.use(upload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  createParentPath: true,
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  debug: process.env.NODE_ENV === 'development'
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api', Routes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

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