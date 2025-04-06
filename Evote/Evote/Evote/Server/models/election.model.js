import { Schema, model, Types } from 'mongoose';

const electionSchema = new Schema({
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    resultTime: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    // Store combined encrypted votes for all candidates
    combinedVotes: {
        c1: {
            type: Number,
            default: 1  // Start with 1 for multiplication
        },
        c2: {
            type: Number,
            default: 1  // Start with 1 for multiplication
        }
    },
    candidates: [{
        type: Types.ObjectId,
        ref: 'Candidate'
    }],
    voters: [{
        type: Types.ObjectId,
        ref: 'Voter'
    }]
});

// Pre-save middleware to update isActive based on current time
electionSchema.pre('save', function(next) {
    const now = new Date();
    this.isActive = now >= this.startTime && now <= this.endTime;
    next();
});

// Static method to update isActive for all elections
electionSchema.statics.updateActiveStatus = async function() {
    const now = new Date();
    await this.updateMany(
        {},
        [
            {
                $set: {
                    isActive: {
                        $and: [
                            { $lte: ["$startTime", "$$NOW"] },
                            { $gte: ["$endTime", "$$NOW"] }
                        ]
                    }
                }
            }
        ]
    );
};

// Pre-find middleware to ensure isActive is up to date
electionSchema.pre('find', function() {
    this.model.updateActiveStatus();
});

// Pre-findOne middleware to ensure isActive is up to date
electionSchema.pre('findOne', function() {
    this.model.updateActiveStatus();
});

const Election = model('Election', electionSchema);
export default Election;