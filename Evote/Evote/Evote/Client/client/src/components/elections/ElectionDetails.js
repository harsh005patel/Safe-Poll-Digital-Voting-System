import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Stack,
  useTheme,
  alpha,
  Divider,
  CardMedia,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api/config';
import { motion } from 'framer-motion';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PartyIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';

const ElectionDetails = () => {
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchElectionDetails();
  }, [id]);

  const fetchElectionDetails = async () => {
    try {
      setLoading(true);
      const [electionResponse, candidatesResponse] = await Promise.all([
        API.get(`/elections/${id}`),
        API.get(`/elections/${id}/candidates`),
      ]);
      
      const electionData = electionResponse.data;
      setElection(electionData);
      setCandidates(candidatesResponse.data);

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
      if (user && user.votedElections) {
        setHasVoted(user.votedElections.includes(id));
      }
    } catch (error) {
      console.error('Error fetching election details:', error);
      toast.error('Failed to fetch election details');
      navigate('/elections');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (candidate) => {
    if (user.isAdmin) {
      toast.error('Administrators are not allowed to vote');
      return;
    }
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidate(null);
  };

  const handleVote = async () => {
    try {
      setVoting(true);
      await API.patch(`/candidates/${selectedCandidate._id}/vote`);
      
      // Update local storage to mark this election as voted
      const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
      votedElections.push(id);
      localStorage.setItem('votedElections', JSON.stringify(votedElections));
      
      // Update state to reflect the vote
      setHasVoted(true);
      setOpenDialog(false);
      toast.success('Vote cast successfully!');
      fetchElectionDetails(); // Refresh the data
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error(error.response?.data?.message || 'Failed to cast vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.primary.light, 0.1)})`
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <CircularProgress 
            size={80} 
            thickness={4} 
            sx={{ 
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 0 8px ${alpha(theme.palette.primary.main, 0.5)})`
            }} 
          />
        </motion.div>
      </Box>
    );
  }

  if (!election) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Election not found
        </Alert>
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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Back to Elections">
            <IconButton 
              onClick={() => navigate('/elections')}
              sx={{ 
                mr: 2,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Election Details
          </Typography>
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
            position: 'relative',
            overflow: 'hidden',
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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
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
                  mb: 3
                }}
              >
                {election.title}
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<AccessTimeIcon />} 
                  label={`Start: ${new Date(election.startTime).toLocaleString()}`} 
                  color="info" 
                  variant="outlined" 
                  sx={{ borderRadius: 2 }}
                />
                <Chip 
                  icon={<AccessTimeIcon />} 
                  label={`End: ${new Date(election.endTime).toLocaleString()}`} 
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
            </Box>
            
            <Box sx={{ 
              width: { xs: '100%', md: '300px' },
              height: { xs: '200px', md: 'auto' },
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <CardMedia
                component="img"
                image={election.thumbnail || '/default-election.jpg'}
                alt={election.title}
                sx={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Box>
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
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                        mr: 1
                      }}
                    >
                      {candidate.fullname.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {candidate.fullname}
                      </Typography>
                      <Chip 
                        icon={<CampaignIcon />} 
                        label={candidate.partyName} 
                        color="primary" 
                        size="small" 
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      fontStyle: 'italic',
                      borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      pl: 2,
                      py: 1
                    }}
                  >
                    "{candidate.motto}"
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleVoteClick(candidate)}
                    disabled={!isActive || hasVoted}
                    startIcon={<HowToVoteIcon />}
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                      fontWeight: 'bold',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                      }
                    }}
                  >
                    {hasVoted ? 'Already Voted' : isActive ? 'Vote' : 'Voting Closed'}
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
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVote} 
            variant="contained" 
            color="primary"
            disabled={voting}
            startIcon={voting ? <CircularProgress size={20} color="inherit" /> : <HowToVoteIcon />}
            sx={{ 
              borderRadius: 2,
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            {voting ? 'Casting Vote...' : 'Confirm Vote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ElectionDetails; 