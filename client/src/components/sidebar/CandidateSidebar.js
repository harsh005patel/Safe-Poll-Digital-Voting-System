import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/config';
import { toast } from 'react-toastify';

const CandidateCard = ({ candidate }) => {
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CandidateSidebar = ({ electionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, [electionId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/elections/${electionId}/candidates`);
      setCandidates(response.data);
    } catch (error) {
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Candidates
      </Typography>
      <AnimatePresence>
        {candidates.map((candidate) => (
          <Box key={candidate._id} sx={{ mb: 2 }}>
            <CandidateCard candidate={candidate} />
          </Box>
        ))}
      </AnimatePresence>
      {candidates.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center">
          No candidates found
        </Typography>
      )}
    </Box>
  );
};

export default CandidateSidebar; 