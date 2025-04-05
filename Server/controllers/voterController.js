import bcrypt from 'bcryptjs'
import VoterModel from '../models/voter.model.js'
import HttpError from '../models/error.model.js'
import jwt from 'jsonwebtoken' 

const registerVoter = async (req, res, next) => {
    try {
        const {fullName, email, password, password2} = req.body
        console.log('Registration attempt:', { fullName, email });

        if(!fullName || !email || !password || !password2) {
            console.log('Missing fields:', { fullName, email, password: !!password, password2: !!password2 });
            return next(new HttpError("Missing required fields.", 422))
        }

        const newEmail = email.toLowerCase()
        
        // check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            console.log('Invalid email format:', newEmail);
            return next(new HttpError("Invalid email format.", 422));
        }
       
        // check for exisiting voter
        const existingVoter = await VoterModel.findOne({email: newEmail})
        if(existingVoter) {
            console.log('Email already registered:', newEmail);
            return next(new HttpError("Email already registered.", 422))
        }
       
        if((password.trim().length) < 6) {
            console.log('Password too short:', password.length);
            return next(new HttpError("Password must be at least 6 characters long.", 422))
        }

        // check if password match with confirmed password
        if(password != password2) {
            console.log('Passwords do not match');
            return next(new HttpError("Passwords do not match.", 422))
        }
        
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // check for admin
        let isAdmin = false
        if(newEmail == "admin123@gmail.com" || newEmail == "admin1234@gmail.com") {
            isAdmin = true
            console.log('Admin account detected:', newEmail);
        }
       
        const newVoter = await VoterModel.create({
            fullName : fullName,
            email: newEmail,
            password: hashedPassword,
            isAdmin : isAdmin,
            votedElections: []
        })

        console.log('Voter created successfully:', { id: newVoter._id, email: newVoter.email, isAdmin: newVoter.isAdmin });

        const token = generateToken({ id: newVoter._id, isAdmin });
        res.status(201).json({
            token,
            id: newVoter._id,
            fullName: newVoter.fullName,
            email: newVoter.email,
            isAdmin: newVoter.isAdmin,
            votedElections: newVoter.votedElections
        });
    } catch (error) {
        console.error('Registration error:', error);
        return next(new HttpError("Voter registration failed.", 422))
    }
}

const generateToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'})
    return token
}

const loginVoter = async (req, res, next) => {
    try {
        const {email, password} = req.body
        if(!email || !password) {
            return next(new HttpError("Missing required fields.", 422))
        } 
        const newEmail = email.toLowerCase()

        // find voter
        const voter = await VoterModel.findOne({email: newEmail})
        if(!voter) {
            return next(new HttpError("Voter not found.", 422))
        }

        // check password
        const isValidPassword = await bcrypt.compare(password, voter.password)
        if(!isValidPassword) {
            return next(new HttpError("Invalid password.", 422))
        }

        const token = generateToken({ id: voter._id, isAdmin: voter.isAdmin })
        res.json({
            token,
            id: voter._id,
            fullName: voter.fullName,
            email: voter.email,
            isAdmin: voter.isAdmin,
            votedElections: voter.votedElections
        })
    } catch (error) {
        return next(new HttpError("Voter login failed.", 422))   
    }
}

const getVoter = async (req, res, next) => {
    try {
        const {id} = req.params
        const voter = await VoterModel.findById(id).select("-password") // excluding password info
        if (!voter) {
            return next(new HttpError("Voter not found.", 404))
        }
        res.json(voter)
    } catch (error) {
        return next(new HttpError("Failed to get voter.", 404))
    }
}

export { registerVoter, loginVoter, getVoter }