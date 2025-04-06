import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
  alpha,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import voteEncryptionService from '../../services/voteEncryption';
import { getElection, getCandidatesWithEncryptedVotes } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import API from '../../api/config'
import axios from 'axios';

const ElectionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [winner, setWinner] = useState(null);

  const fetchElectionResults = async () => {
    try {
      setLoading(true);

      const [electionRes, candidatesRes] = await Promise.all([
        API.get(`/elections/${id}`),
        API.get(`/elections/${id}/candidates`)
      ]);
      
      if (!electionRes?.data) {
        throw new Error('Failed to fetch election data');
      }

      const electionData = electionRes.data;
      setElection(electionData);
      
      if (Array.isArray(candidatesRes?.data) && candidatesRes.data.length > 0) {
        console.log('Processing election results...');
        
        // Only process combined votes if there are actual votes
        if (electionData.combinedVotes && electionData.voters && electionData.voters.length > 0) {
          const totalVotes = electionData.voters.length;
          const tallyResult = await voteEncryptionService.getTallyResults({
            ...electionData.combinedVotes,
            totalVotes
          });
          console.log('Election tally result:', tallyResult);
          
          // Update candidates with the tally result
          const processedCandidates = candidatesRes.data.map(candidate => {
            const isFirstCandidate = candidate._id === candidatesRes.data[0]._id;
            return {
              ...candidate,
              result: tallyResult.result,
              voteCount: isFirstCandidate ? Math.abs(tallyResult.d) : 0
            };
          });

          // Sort candidates based on their results
          const sortedCandidates = processedCandidates.sort((a, b) => {
            if (a.result === "Yes" && b.result === "No") return -1;
            if (a.result === "No" && b.result === "Yes") return 1;
            if (a.result === "Equal Votes" && b.result !== "Equal Votes") return 1;
            if (a.result !== "Equal Votes" && b.result === "Equal Votes") return -1;
            return 0;
          });

          console.log('Sorted candidates:', sortedCandidates);
          setCandidates(sortedCandidates);
          
          // Set winner based on results
          if (sortedCandidates.length > 0) {
            setWinner(sortedCandidates[0]);
          }
        } else {
          console.warn('No votes have been cast yet');
          setCandidates(candidatesRes.data.map(candidate => ({
            ...candidate,
            result: "No votes",
            voteCount: 0
          })));
        }
      } else {
        console.warn('No candidates data available');
        setCandidates([]);
      }

      // Check if user has already voted
      if (user?.votedElections) {
        setHasVoted(user.votedElections.includes(id));
      }
    } catch (error) {
      console.error('Error fetching election results:', error);
      setError('Failed to fetch election results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchElectionResults();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading election results...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No election ID provided.
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

  // Check if election has ended
  const now = new Date();
  const endTime = new Date(election.endTime);
  const resultTime = new Date(election.resultTime);
  const hasEnded = now > endTime;
  const resultsAvailable = now > resultTime;

  if (!hasEnded) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          This election is still ongoing. Results will be available after the election ends.
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

  if (!resultsAvailable) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          The election has ended, but results are not yet available. They will be published soon.
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

  // Show results immediately
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
            {election.title} - Results
          </Typography>
          
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            <Chip 
              icon={<AccessTimeIcon />} 
              label={`Ended: ${endTime.toLocaleString()}`} 
              color="info" 
              variant="outlined" 
              sx={{ borderRadius: 2 }}
            />
          </Stack>
          
          {candidates.length > 0 ? (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {candidates[0].result === "Yes" ? (
                <Box>
                  <Typography variant="h5" color="success.main" gutterBottom>
                    Winner
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={candidates[0].image} 
                      alt={candidates[0].fullname}
                      sx={{ width: 120, height: 120, border: `4px solid ${theme.palette.success.main}` }}
                    />
                    <Box>
                      <Typography variant="h4" component="div" fontWeight="bold">
                        {candidates[0].fullname}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {candidates[0].partyName}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {candidates[0].motto}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : candidates[0].result === "No" ? (
                <Box>
                  <Typography variant="h5" color="success.main" gutterBottom>
                    Winner
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={candidates[1].image} 
                      alt={candidates[1].fullname}
                      sx={{ width: 120, height: 120, border: `4px solid ${theme.palette.success.main}` }}
                    />
                    <Box>
                      <Typography variant="h4" component="div" fontWeight="bold">
                        {candidates[1].fullname}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {candidates[1].partyName}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {candidates[1].motto}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" color="info.main" gutterBottom>
                    Election Results
                  </Typography>
                  <Grid container spacing={3} justifyContent="center">
                    {candidates.map((candidate, index) => (
                      <Grid item xs={12} sm={6} key={candidate._id}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Avatar 
                            src={candidate.image} 
                            alt={candidate.fullname}
                            sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                          />
                          <Typography variant="h6" component="div">
                            {candidate.fullname}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {candidate.partyName}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          ) : (
            <Alert severity="info">
              <Typography variant="body1">
                No candidates available for this election.
              </Typography>
            </Alert>
          )}
        </Paper>
      </motion.div>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => navigate('/elections')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Elections
        </Button>
      </Box>
    </Container>
  );
};

export default ElectionResults; 