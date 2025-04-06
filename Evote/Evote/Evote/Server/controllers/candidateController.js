import ElectionModel from '../models/election.model.js'
import CandidateModel from '../models/candidate.model.js'
import VoterModel from '../models/voter.model.js'
import HttpError from '../models/error.model.js'
import { v4 as uuid } from 'uuid'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const addCandidate = async (req, res, next) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('Request user:', req.user);

        if(!req.user || !req.user.isAdmin) {
            return next(new HttpError('Unauthorized access', 403));
        }
        
        const { fullname, partyName, motto, electionId } = req.body;
        console.log('Parsed fields:', { fullname, partyName, motto, electionId });

        if(!fullname || !partyName || !motto || !electionId) {
            return next(new HttpError("Missing required fields.", 422));
        }

        // Check if election exists and is not ended
        const election = await ElectionModel.findById(electionId);
        console.log('Found election:', election);

        if (!election) {
            return next(new HttpError('Election not found.', 404));
        }
        
        if (new Date(election.endTime) < new Date()) {
            return next(new HttpError('Cannot add candidates to ended election.', 422));
        }

        let imagePath = '/uploads/photos/default.png';
        // Handle image upload if provided
        if(req.files && req.files.image) {
            const image = req.files.image;
            if (image.size > 5 * 1024 * 1024) {
                return next(new HttpError('Image size should be less than 5MB.', 400));
            }

            const uploadDir = path.join(__dirname, '..', 'uploads', 'photos');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `${uuid()}.${image.mimetype.split('/')[1]}`;
            const filePath = path.join(uploadDir, fileName);

            await image.mv(filePath);
            imagePath = `/uploads/photos/${fileName}`;
        }

        const newCandidate = new CandidateModel({
            fullname,
            partyName,
            motto,
            image: imagePath,
            election: electionId
        });

        // Save the candidate
        await newCandidate.save();
        
        // Update the election's candidates array
        election.candidates.push(newCandidate._id);
        await election.save();
        
        res.status(201).json({
            message: "Candidate added successfully",
            candidate: {
                _id: newCandidate._id,
                fullname: newCandidate.fullname,
                partyName: newCandidate.partyName,
                motto: newCandidate.motto,
                image: newCandidate.image,
                election: newCandidate.election
            }
        });
    } catch (error) {
        console.error('Error in addCandidate:', error);
        if (error.name === 'ValidationError') {
            return next(new HttpError('Invalid candidate data: ' + error.message, 422));
        }
        return next(new HttpError(error.message || 'Failed to add candidate', 500));
    }
};

const getCandidates = async (req, res, next) => {
    try {
        const { electionId } = req.params;
        const candidates = await CandidateModel.find({ election: electionId }); // Exclude encrypted votes from response
        
        res.status(200).json(candidates);
    } catch (error) {
        return next(new HttpError('Failed to fetch candidates', 500));
    }
};

const getCandidate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const candidate = await CandidateModel.findById(id);
        
        if (!candidate) {
            return next(new HttpError('Candidate not found', 404));
        }
        res.status(200).json(candidate);
    } catch (error) {
        return next(new HttpError('Failed to fetch candidate', 500));
    }
};

const removeCandidate = async (req, res, next) => {
    try {
        if(!req.user.isAdmin) {
            return next(new HttpError('Unauthorized access', 403))
        }

        const { id } = req.params
        const candidate = await CandidateModel.findById(id).populate('election')
        
        if(!candidate) {
            return next(new HttpError("Candidate not found.", 404))
        }

        // Check if election has ended
        if (new Date(candidate.election.endTime) < new Date()) {
            return next(new HttpError('Cannot remove candidates from ended election.', 422))
        }

        // Delete candidate image
        if (candidate.image && candidate.image !== '/uploads/photos/default.png') {
            const imagePath = path.join(__dirname, '..', candidate.image)
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
            }
        }

        // Remove candidate from election's candidates array
        const election = candidate.election
        election.candidates = election.candidates.filter(c => c.toString() !== candidate._id.toString())
        await election.save()
        
        // Delete the candidate
        await CandidateModel.findByIdAndDelete(id)
        
        res.status(200).json({ message: "Candidate removed successfully" })
    } catch (error) {
        console.error('Error in removeCandidate:', error)
        return next(new HttpError(error.message || 'Failed to remove candidate', 500))
    }
}

const voteCandidate = async (req, res, next) => {
    try {
        const { encryptedValue } = req.body;
        const { id } = req.params;
        const voterId = req.user._id;

        // Validate encrypted vote data
        if (!encryptedValue || 
            typeof encryptedValue.c1 !== 'number' || 
            typeof encryptedValue.c2 !== 'number' ||
            isNaN(encryptedValue.c1) || 
            isNaN(encryptedValue.c2)) {
            return res.status(400).json({ 
                message: 'Invalid encrypted vote format - both c1 and c2 must be valid numbers' 
            });
        }

        // Check if user is an admin
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: 'Administrators cannot vote' });
        }

        // Find the candidate
        const candidate = await CandidateModel.findById(id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Find the election
        const election = await ElectionModel.findById(candidate.election);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Check if election is active
        if (!election.isActive) {
            return res.status(400).json({ message: 'Election is not active' });
        }

        // Check if election has ended
        if (new Date(election.endTime) < new Date()) {
            return res.status(400).json({ message: 'Election has ended' });
        }

        // Check if voter has already voted in this election
        const hasVoted = await VoterModel.findOne({
            _id: voterId,
            votedElections: election._id
        });

        if (hasVoted) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }

        // Constants for encryption
        const p = 1009; // Prime number

        // Update election's combined votes using homomorphic multiplication
        const newC1 = (election.combinedVotes.c1 * encryptedValue.c1) % p;
        const newC2 = (election.combinedVotes.c2 * encryptedValue.c2) % p;

        // Update the election's combined votes
        election.combinedVotes = {
            c1: newC1,
            c2: newC2
        };

        // Add voter to the election's list
        election.voters.push(voterId);

        // Add voter to the candidate's list
        candidate.voters.push(voterId);

        // Update voter's record
        await VoterModel.findByIdAndUpdate(voterId, {
            $push: { votedElections: election._id }
        });

        await Promise.all([election.save(), candidate.save()]);
        res.status(200).json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Error casting vote:', error);
        return next(new HttpError('Error casting vote: ' + error.message, 500));
    }
};

const getCandidatesWithEncryptedVotes = async (req, res) => {
    try {
        const { electionId } = req.params;
        
        const candidates = await CandidateModel.find({ election: electionId })
            .select('fullname partyName motto image combinedVotes voters');

        res.status(200).json(candidates);
    } catch (error) {
        console.error('Error getting candidates with votes:', error);
        res.status(500).json({ message: 'Failed to get candidates', error: error.message });
    }
};

export { 
    addCandidate,
    getCandidate, 
    removeCandidate,
    voteCandidate,
    getCandidatesWithEncryptedVotes
};
