import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    partyName: {
        type: String,
        required: true
    },
    motto: String,
    image: String,
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    // Keep track of voters
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voter'
    }]
});

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;