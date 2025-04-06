import express from 'express'
import { registerVoter, loginVoter, getVoter } from '../controllers/voterController.js'
import { addElection, getElections, getElection, removeElection, updateElection, getCandidatesOfElection, getElectionVoters } from '../controllers/electionController.js';
import { addCandidate, getCandidate, removeCandidate, voteCandidate, getCandidatesWithEncryptedVotes } from '../controllers/candidateController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// voter specific routes
router.post('/voters/register', registerVoter)
router.post('/voters/login', loginVoter)
router.get('/voters/:id', authMiddleware, getVoter)

// election specific routes
router.post('/elections', authMiddleware, addElection)
router.get('/elections', authMiddleware, getElections)
router.get('/elections/:id', authMiddleware, getElection)
router.delete('/elections/:id', authMiddleware, removeElection)
router.patch('/elections/:id', authMiddleware, updateElection)
router.get('/elections/:id/candidates', authMiddleware, getCandidatesOfElection)
router.get('/elections/:id/voters', authMiddleware, getElectionVoters)
router.get('/elections/:electionId/candidates/with-encrypted-votes', authMiddleware, getCandidatesWithEncryptedVotes)

// candidate specific routes
router.post('/candidates', authMiddleware, addCandidate)
router.get('/candidates/:id', authMiddleware, getCandidate)
router.delete('/candidates/:id', authMiddleware, removeCandidate)
router.patch('/candidates/:id/vote', authMiddleware, voteCandidate)

export default router
