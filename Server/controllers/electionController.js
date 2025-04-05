import ElectionModel from '../models/election.model.js'
import CandidateModel from '../models/candidate.model.js'
import HttpError from '../models/error.model.js'
import { v4 as uuid } from 'uuid'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const addElection = async (req, res, next) => {
  try {
    if(!req.user.isAdmin) {
      return next(new HttpError('Unauthorized access', 403))
    }

    const { title, description, startDate, endDate } = req.body

    if (!title || !description || !startDate || !endDate) {
      return next(new HttpError('Missing required fields.', 422))
    }

    let thumbnailPath = '/uploads/thumbnails/default.png';
    if (req.files && req.files.thumbnail) {
      const thumbnail = req.files.thumbnail;
      
      if (thumbnail.size > 5 * 1024 * 1024) {
        return next(new HttpError('Thumbnail size should be less than 5MB', 400));
      }

      const uploadDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${uuid()}.${thumbnail.mimetype.split('/')[1]}`;
      const filePath = path.join(uploadDir, fileName);

      await thumbnail.mv(filePath);
      thumbnailPath = `/uploads/thumbnails/${fileName}`;
    }

    const newElection = await ElectionModel.create({
      title,
      description,
      thumbnail: thumbnailPath,
      startTime: new Date(startDate),
      endTime: new Date(endDate),
      resultTime: new Date(endDate), // Set result time same as end time for now
      candidates: [],
      voters: []
    });

    res.status(201).json(newElection);
  } catch (error) {
    return next(new HttpError(error.message || 'Failed to create election', 500));
  }
};

const getElections = async (req, res, next) => {
  try {
    console.log('Fetching elections...');
    console.log('User:', req.user);
    
    const elections = await ElectionModel.find().sort({ startTime: -1 });
    console.log('Found elections:', elections.length);
    
    res.status(200).json(elections);
  } catch (error) {
    console.error('Error in getElections:', error);
    return next(new HttpError('Failed to fetch elections: ' + error.message, 500));
  }
};

const getElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const election = await ElectionModel.findById(id);
    if (!election) {
      return next(new HttpError('Election not found', 404));
    }
    res.status(200).json(election);
  } catch (error) {
    return next(new HttpError('Failed to fetch election', 500));
  }
};

const removeElection = async (req, res, next) => {
  try {
    if(!req.user.isAdmin) {
      return next(new HttpError('Unauthorized access', 403));
    }
    
    const { id } = req.params;
    const election = await ElectionModel.findById(id);
    if (!election) {
      return next(new HttpError('Election not found', 404));
    }

    // Delete thumbnail if exists
    if (election.thumbnail) {
      const thumbnailPath = path.join(__dirname, '..', election.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await ElectionModel.findByIdAndDelete(id);
    
    // delete the candidates from the election
    await CandidateModel.deleteMany({election: id});
    res.status(200).json({ message: 'Election deleted successfully' });
  } catch (error) {
    return next(new HttpError('Failed to delete election', 500));
  }
};

const updateElection = async (req, res, next) => {
  try {
    if(!req.user.isAdmin) {
      return next(new HttpError('Unauthorized access', 403));
    }

    const { id } = req.params;
    const { title, description, startDate, endDate, location } = req.body;

    if (!title || !description || !startDate || !endDate) {
      return next(new HttpError('Missing required fields.', 422));
    }

    let thumbnailPath;
    if (req.files && req.files.thumbnail) {
      const thumbnail = req.files.thumbnail;
      
      if (thumbnail.size > 5 * 1024 * 1024) {
        return next(new HttpError('Thumbnail size should be less than 5MB', 400));
      }

      const uploadDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${uuid()}.${thumbnail.mimetype.split('/')[1]}`;
      const filePath = path.join(uploadDir, fileName);

      await thumbnail.mv(filePath);
      thumbnailPath = `/uploads/thumbnails/${fileName}`;

      // Delete old thumbnail if exists
      const oldElection = await ElectionModel.findById(id);
      if (oldElection && oldElection.thumbnail) {
        const oldThumbnailPath = path.join(__dirname, '..', oldElection.thumbnail);
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
    }

    const updatedElection = await ElectionModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        location,
        ...(thumbnailPath && { thumbnail: thumbnailPath }),
        startTime: new Date(startDate),
        endTime: new Date(endDate),
        resultTime: new Date(endDate) // Set result time same as end time for now
      },
      { new: true }
    );

    if (!updatedElection) {
      return next(new HttpError('Election not found', 404));
    }

    res.status(200).json(updatedElection);
  } catch (error) {
    return next(new HttpError('Failed to update election', 500));
  }
};

const getCandidatesOfElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidates = await CandidateModel.find({ election: id });
    res.status(200).json(candidates);
  } catch (error) {
    return next(new HttpError('Failed to fetch candidates', 500));
  }
};

const getElectionVoters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const election = await ElectionModel.findById(id).populate('voters');
    if (!election) {
      return next(new HttpError('Election not found', 404));
    }
    res.status(200).json(election.voters);
  } catch (error) {
    return next(new HttpError('Failed to fetch voters', 500));
  }
};

export {
  addElection,
  getElections,
  getElection,
  removeElection,
  updateElection,
  getCandidatesOfElection,
  getElectionVoters
};
