import jwt from 'jsonwebtoken'
import HttpError from '../models/error.model.js'

const authMiddleware = async (req, res, next) => {
    console.log('Auth middleware called');
    const Authorization = req.headers.authorization || req.headers.Authorization
    console.log('Authorization header:', Authorization);

    if(Authorization && Authorization.startsWith("Bearer")) {
        const token = Authorization.split(' ')[1]
        console.log('Token extracted:', token ? 'Token exists' : 'No token');
        
        jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
            if(err) {
                console.error('Token verification error:', err);
                return next(new HttpError("Token expired or invalid.", 403))
            }

            console.log('Token verified, user info:', info);
            req.user = info
            return next()
        })
    }
    else {
        console.log('No authorization header found');
        return next(new HttpError("Missing or invalid token.", 403))
    }
}

export default authMiddleware