import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  LinearProgress,
  Avatar,
  Stack,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  Campaign as CampaignIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon, color, onClick }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(color, 0.2)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.1)} 100%)`,
          },
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                mr: 2,
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              View Details
            </Typography>
            <ArrowForwardIcon sx={{ color: color }} />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ElectionCard = ({ election }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={() => navigate(`/elections/${election._id}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              {election.title}
            </Typography>
            <Chip
              label={election.status}
              color={election.status === 'active' ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {election.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {election.candidates?.length || 0} Candidates
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeElections: 0,
    totalVotes: 0,
    upcomingElections: 0,
    participationRate: 0,
  });
  const [recentElections, setRecentElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace with your actual API calls
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats(data.stats);
        setRecentElections(data.recentElections);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
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
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your voting activities
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Elections"
              value={stats.activeElections}
              icon={<VoteIcon />}
              color={theme.palette.primary.main}
              onClick={() => navigate('/elections')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Votes"
              value={stats.totalVotes}
              icon={<TrendingIcon />}
              color={theme.palette.success.main}
              onClick={() => navigate('/profile')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Upcoming Elections"
              value={stats.upcomingElections}
              icon={<CalendarIcon />}
              color={theme.palette.info.main}
              onClick={() => navigate('/elections')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Participation Rate"
              value={`${stats.participationRate}%`}
              icon={<CampaignIcon />}
              color={theme.palette.warning.main}
              onClick={() => navigate('/profile')}
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Recent Elections
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/elections')}
            >
              View All
            </Button>
          </Box>
          <Grid container spacing={3}>
            {recentElections.map((election) => (
              <Grid item xs={12} md={6} key={election._id}>
                <ElectionCard election={election} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<VoteIcon />}
                onClick={() => navigate('/elections')}
              >
                Vote Now
              </Button>
              <Button
                variant="outlined"
                startIcon={<CampaignIcon />}
                onClick={() => navigate('/campaigns')}
              >
                View Campaigns
              </Button>
              <Button
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() => navigate('/profile')}
              >
                Update Profile
              </Button>
            </Stack>
          </Box>
          <IconButton
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <NotificationIcon />
          </IconButton>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Dashboard; 