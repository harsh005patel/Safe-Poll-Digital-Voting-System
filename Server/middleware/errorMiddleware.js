// unsupported endpoints
const notFound = (req, res, next) => {
    const error = new Error(`Not found: ${req.originalUrl}`)
    res.status(404)
    next(error)
};

// error middleware
const errorHandler = (error, req, res, next) => {
    console.error('Error handler called with:', error);
    
    if(res.headerSent) {
        return next(error)
    }

    res.status(error.code || 500).json({
        error: {
            message: error.message || "Unknown error occurred.",
            details: error.stack || "No stack trace available"
        }
    })
}

export { notFound, errorHandler }