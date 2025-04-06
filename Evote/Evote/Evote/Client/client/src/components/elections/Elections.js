import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  CardMedia,
  Chip,
  Stack,
  useTheme,
  alpha,
  Divider,
  Paper,
  Avatar,
  Badge
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api/config';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CampaignIcon from '@mui/icons-material/Campaign';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const GlowCard = styled(Card)(({ theme }) => ({
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
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
    '&::after': {
      opacity: 1
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1
  },
  transition: 'all 0.3s ease'
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  fontWeight: 'bold',
  padding: '8px 16px',
  borderRadius: '20px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  },
  transition: 'all 0.3s ease'
}));

const StatusBadge = styled(Badge)(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    right: 10,
    top: 10,
    padding: '0 8px',
    borderRadius: '12px',
    backgroundColor: 
      status === 'active' ? theme.palette.success.main :
      status === 'upcoming' ? theme.palette.warning.main :
      theme.palette.error.main,
    color: theme.palette.getContrastText(
      status === 'active' ? theme.palette.success.main :
      status === 'upcoming' ? theme.palette.warning.main :
      theme.palette.error.main
    ),
    fontWeight: 'bold',
    fontSize: '0.7rem',
    boxShadow: theme.shadows[2]
  }
}));

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First test the server connection
      try {
        await API.get('/test');
        console.log('Server connection test successful');
      } catch (testError) {
        console.error('Server connection test failed:', testError);
        throw new Error('Server connection failed - please check if the server is running');
      }
      
      // Then fetch elections
      console.log('Fetching elections...');
      const response = await API.get('/elections');
      console.log('Elections fetched:', response.data);
      setElections(response.data);
    } catch (error) {
      console.error('Error fetching elections:', error);
      setError(error.message || 'Failed to fetch elections');
      toast.error(error.message || 'Failed to fetch elections');
      if (error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
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

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          fontWeight="800"
          sx={{ 
            mb: 6,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}
        >
          Active Elections
        </Typography>
      </motion.div>
      
      {elections.length > 0 ? (
        <Grid container spacing={4}>
          {elections.map((election) => {
            const now = new Date();
            const startTime = new Date(election.startTime);
            const endTime = new Date(election.endTime);
            const isActive = now >= startTime && now <= endTime;
            const hasEnded = now > endTime;
            const status = hasEnded ? 'ended' : isActive ? 'active' : 'upcoming';
            
            return (
              <Grid item xs={12} sm={6} md={4} key={election._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <GlowCard>
                    <StatusBadge
                      badgeContent={status.toUpperCase()}
                      status={status}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={election.thumbnail || '/default-election.jpg'}
                        alt={election.title}
                        sx={{
                          objectFit: 'cover',
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                      />
                    </StatusBadge>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                        {election.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {election.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={`Start: ${new Date(election.startTime).toLocaleDateString()}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={`End: ${new Date(election.endTime).toLocaleDateString()}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <GradientButton
                        fullWidth
                        onClick={() => navigate(`/elections/${election._id}/vote`)}
                        startIcon={isActive ? <HowToVoteIcon /> : <VisibilityIcon />}
                      >
                        {isActive ? 'Vote Now' : 'View Details'}
                      </GradientButton>
                    </CardActions>
                  </GlowCard>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.light, 0.1)})`,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No elections available at the moment.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Elections;