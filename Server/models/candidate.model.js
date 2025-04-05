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
    motto: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '/uploads/photos/default.png'
    },
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    encryptedVotes: [{
        voter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voter',
            required: true
        },
        encryptedValue: {
            c1: {
                type: Number,
                required: true
            },
            c2: {
                type: Number,
                required: true
            }
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add a method to explicitly include vote data
candidateSchema.methods.withVoteData = function() {
    return this.model('Candidate').findById(this._id).select('+encryptedVoteData +voteMetadata');
};

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;