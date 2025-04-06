const mongoose = require('mongoose');

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
  // Store combined encrypted votes
  combinedVotes: {
    c1: {
      type: Number,
      default: 1 // Start with 1 for multiplication
    },
    c2: {
      type: Number,
      default: 1 // Start with 1 for multiplication
    }
  },
  // Keep track of voters without storing individual votes
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Candidate', candidateSchema); 