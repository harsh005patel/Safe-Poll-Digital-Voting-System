import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import routes from './routes/Routes.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Mount routes
app.use('/api', routes)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    // Start server
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error)
  }) 