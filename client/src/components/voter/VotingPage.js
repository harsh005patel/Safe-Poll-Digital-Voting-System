import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  CardActionArea,
  Avatar,
  Stack,
  useTheme,
  alpha,
  CardActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/config';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PartyIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import voteEncryptionService from '../../services/voteEncryption';

const VotingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const fetchElectionAndCandidates = async () => {
    try {
      setLoading(true);
      setError('');

      const [electionRes, candidatesRes] = await Promise.all([
        API.get(`/elections/${id}`),
        API.get(`/elections/${id}/candidates`)
      ]);
      
      if (!electionRes?.data) {
        throw new Error('Failed to fetch election data');
      }

      const electionData = electionRes.data;
      setElection(electionData);
      
      if (Array.isArray(candidatesRes?.data)) {
        setCandidates(candidatesRes.data);
      } else {
        console.warn('Candidates data is not an array:', candidatesRes);
        setCandidates([]);
      }

      // Check if election is active
      const now = new Date();
      const startTime = new Date(electionData.startTime);
      const endTime = new Date(electionData.endTime);

      if (now < startTime) {
        setError(`This election hasn't started yet. It will start on ${startTime.toLocaleString()}`);
      } else if (now > endTime) {
        setError('This election has ended.');
      }

      // Check if user has already voted
      if (user?.votedElections) {
        setHasVoted(user.votedElections.includes(id));
      }
    } catch (error) {
      console.error('Error fetching election data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch election data');
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch election data');
      if (error.response?.status === 404) {
        navigate('/elections');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError('No election ID provided. Please select an election to vote.');
      setLoading(false);
      return;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      setError('Invalid election ID format.');
      setLoading(false);
      return;
    }

    fetchElectionAndCandidates();
  }, [id]);

  const handleVoteClick = (candidate) => {
    if (!user) {
      toast.error('Please log in to vote');
      navigate('/login');
      return;
    }

    if (user.isAdmin) {
      toast.error('Administrators are not allowed to vote');
      return;
    }

    if (!election) {
      toast.error('Election data not available');
      return;
    }

    const now = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);

    if (now < startTime) {
      toast.error(`This election hasn't started yet. It will start on ${startTime.toLocaleString()}`);
      return;
    }

    if (now > endTime) {
      toast.error('This election has ended');
      return;
    }

    if (hasVoted) {
      toast.error('You have already voted in this election');
      return;
    }

    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidate(null);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate first');
      return;
    }

    const now = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);
    const isActive = now >= startTime && now <= endTime;

    if (!isActive) {
      toast.error('This election is not currently active');
      return;
    }

    try {
      setVoting(true);

      try {
        // voteValue = 1 for candidate 1
        // voteValue = -1 for candidate 2
        const voteValue = candidates[0]._id === selectedCandidate._id ? 1 : -1;
        
        // Encrypt the vote
        const encryptedVoteResult = await voteEncryptionService.encryptVote(voteValue === 1 ? 'yes' : 'no');
        
        // Validate encrypted vote data
        if (!encryptedVoteResult || 
            typeof encryptedVoteResult.c1 !== 'number' || 
            typeof encryptedVoteResult.c2 !== 'number' ||
            isNaN(encryptedVoteResult.c1) || 
            isNaN(encryptedVoteResult.c2)) {
          throw new Error('Invalid encrypted vote data received');
        }
        
        // Send vote with encrypted data
        const response = await API.patch(
          `/candidates/${selectedCandidate._id}/vote`,
          {
            encryptedValue: {
              c1: encryptedVoteResult.c1,
              c2: encryptedVoteResult.c2
            }
          }
        );
        
        if (!response?.data) {
          throw new Error('Failed to cast vote');
        }

        // Update local storage to mark this election as voted
        const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
        if (!votedElections.includes(id)) {
          votedElections.push(id);
          localStorage.setItem('votedElections', JSON.stringify(votedElections));
        }
        
        setHasVoted(true);
        setOpenDialog(false);
        toast.success('Vote cast successfully!');
        
        // Refresh the data
        fetchElectionAndCandidates();
      } catch (encryptionError) {
        console.error('Error encrypting vote:', encryptionError);
        throw new Error('Failed to encrypt vote: ' + encryptionError.message);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to cast vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading election data...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No election ID provided. Please select an election to vote.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/elections')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Elections
        </Button>
      </Container>
    );
  }

  if (!election) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Election not found or you don't have permission to view it.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/elections')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Elections
        </Button>
      </Container>
    );
  }

  if (candidates.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No candidates have been added to this election yet.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/elections')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Elections
        </Button>
      </Container>
    );
  }

  const now = new Date();
  const startTime = new Date(election.startTime);
  const endTime = new Date(election.endTime);
  const isActive = now >= startTime && now <= endTime;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold" 
            color="primary"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 3
            }}
          >
            {election.title}
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
            <Chip 
              icon={<AccessTimeIcon />} 
              label={`Start: ${startTime.toLocaleString()}`} 
              color="info" 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            />
            <Chip 
              icon={<AccessTimeIcon />} 
              label={`End: ${endTime.toLocaleString()}`} 
              color="info" 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            />
            <Chip 
              icon={<PartyIcon />} 
              label={`${candidates.length} Candidates`} 
              color="secondary" 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            />
          </Stack>
          
          <Typography 
            variant="body1" 
            paragraph 
            sx={{ 
              mb: 3, 
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.8
            }}
          >
            {election.description}
          </Typography>
          
          {error && (
            <Alert 
              icon={<ErrorOutlineIcon />} 
              severity="info" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: 28
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          {hasVoted && (
            <Alert 
              icon={<CheckCircleIcon />} 
              severity="success" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: 28
                }
              }}
            >
              You have already voted in this election.
            </Alert>
          )}
        </Paper>
      </motion.div>

      <Typography 
        variant="h5" 
        gutterBottom 
        fontWeight="bold" 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          color: theme.palette.primary.main
        }}
      >
        {isActive ? 'Cast Your Vote' : 'Candidates'}
      </Typography>

      <Grid container spacing={4}>
        {candidates.map((candidate, index) => (
          <Grid item xs={12} sm={6} md={4} key={candidate._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    zIndex: 1
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={candidate.image || '/default-candidate.jpg'}
                  alt={candidate.fullname}
                  sx={{
                    objectFit: 'cover',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {candidate.fullname}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {candidate.partyName}
                  </Typography>
                  {candidate.motto && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      "{candidate.motto}"
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleVoteClick(candidate)}
                    disabled={!isActive || hasVoted || voting}
                    startIcon={voting ? <CircularProgress size={20} /> : <HowToVoteIcon />}
                  >
                    {hasVoted ? 'Already Voted' : isActive ? 'Vote' : 'View Details'}
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 500,
            boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, textAlign: 'center', fontWeight: 'bold' }}>
          Confirm Your Vote
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 60,
                height: 60,
                mr: 2
              }}
            >
              {selectedCandidate?.fullname.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedCandidate?.fullname}
              </Typography>
              <Typography variant="subtitle1" color="primary" fontWeight="bold">
                {selectedCandidate?.partyName}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Are you sure you want to vote for this candidate?
          </Typography>
          
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              Note: This action cannot be undone. Once you cast your vote, you cannot change it.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={voting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmVote}
            disabled={voting}
            startIcon={voting ? <CircularProgress size={20} /> : null}
          >
            {voting ? 'Casting Vote...' : 'Confirm Vote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VotingPage; 