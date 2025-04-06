import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  useTheme,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Close as CloseIcon,
  HowToVote as VoteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/config';
import { toast } from 'react-toastify';

const CandidateCard = ({ candidate, onViewDetails }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleShare = (platform) => {
    const text = `Check out ${candidate.name} running for ${candidate.party} in the upcoming election!`;
    const url = window.location.href;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)`,
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: 'relative', height: '200px' }}>
          <CardMedia
            component="img"
            height="200"
            image={candidate.image || 'https://source.unsplash.com/random/800x600?person'}
            alt={candidate.name}
            sx={{
              transition: 'transform 0.3s ease-in-out',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 2,
            }}
          >
            <Avatar
              src={candidate.partyLogo}
              alt={candidate.party}
              sx={{
                width: 60,
                height: 60,
                border: `3px solid ${theme.palette.background.paper}`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
            />
          </Box>
        </Box>
        <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {candidate.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {candidate.party}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {candidate.biography}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={candidate.status || 'Active'}
              color={candidate.status === 'Active' ? 'success' : 'default'}
              size="small"
              sx={{
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(5px)',
              }}
            />
            <Box>
              <IconButton
                size="small"
                onClick={() => handleShare('facebook')}
                sx={{ color: '#1877f2' }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleShare('twitter')}
                sx={{ color: '#1da1f2' }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleShare('linkedin')}
                sx={{ color: '#0a66c2' }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => onViewDetails(candidate)}
          >
            View Profile
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CandidateDetailsDialog = ({ candidate, open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!candidate) return null;

  const handleVote = () => {
    navigate(`/elections/${candidate.electionId}/vote`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Candidate Profile</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Box sx={{ position: 'relative', height: '300px', borderRadius: '16px', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="300"
                image={candidate.image || 'https://source.unsplash.com/random/800x600?person'}
                alt={candidate.name}
                sx={{ objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 2,
                }}
              >
                <Avatar
                  src={candidate.partyLogo}
                  alt={candidate.party}
                  sx={{
                    width: 80,
                    height: 80,
                    border: `3px solid ${theme.palette.background.paper}`,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {candidate.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {candidate.party}
            </Typography>
            <Chip
              label={candidate.status || 'Active'}
              color={candidate.status === 'Active' ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />
            <Typography variant="body1" paragraph>
              {candidate.biography}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {candidate.electionDate ? new Date(candidate.electionDate).toLocaleDateString() : 'Upcoming Election'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {candidate.location || 'All Locations'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {candidate.voteCount || 0} Votes
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<VoteIcon />}
                onClick={handleVote}
              >
                Vote Now
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
              >
                Share
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Candidates = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchCandidates(selectedElection);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const response = await API.get('/elections');
      if (response && response.data) {
        setElections(response.data);
        // Select the first active election by default
        const activeElection = response.data.find(election => 
          new Date(election.startTime) <= new Date() && 
          new Date(election.endTime) >= new Date()
        );
        if (activeElection) {
          setSelectedElection(activeElection._id);
        } else if (response.data.length > 0) {
          setSelectedElection(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error(error.message || 'Failed to fetch elections');
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      setLoading(true);
      const response = await API.get(`/elections/${electionId}/candidates`);
      if (response && response.data) {
        setCandidates(response.data);
      } else {
        toast.error('No candidates data received');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error(error.message || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidate(null);
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = 
      candidate.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.motto && candidate.motto.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 0) return matchesSearch; // All Candidates
    if (activeTab === 1) return matchesSearch && candidate.partyName === 'Party A';
    if (activeTab === 2) return matchesSearch && candidate.partyName === 'Party B';
    if (activeTab === 3) return matchesSearch && candidate.partyName === 'Party C';
    return matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!selectedElection) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="text.secondary">
          Please select an election to view candidates
        </Typography>
      </Box>
    );
  }

  if (candidates.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="text.secondary">
          No candidates found for this election
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Candidates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and learn about all candidates participating in the elections
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <TextField
                  select
                  label="Select Election"
                  value={selectedElection || ''}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {elections.map((election) => (
                    <MenuItem key={election._id} value={election._id}>
                      {election.title}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                >
                  Filter
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="All Candidates" />
            <Tab label="Party A" />
            <Tab label="Party B" />
            <Tab label="Party C" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredCandidates.map((candidate) => (
            <Grid xs={12} sm={6} md={4} key={candidate._id}>
              <CandidateCard 
                candidate={candidate} 
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>

        {filteredCandidates.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No candidates found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}

        <CandidateDetailsDialog
          candidate={selectedCandidate}
          open={openDialog}
          onClose={handleCloseDialog}
        />
      </motion.div>
    </Container>
  );
};

export default Candidates; 