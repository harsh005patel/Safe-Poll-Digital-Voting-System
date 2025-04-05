import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../api/config';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [recentElections, setRecentElections] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get the user ID from localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Fetch user profile using the correct endpoint
      const userResponse = await API.get(`/voters/${userId}`);
      if (userResponse?.data) {
        setUser(userResponse.data);
      }

      // Fetch recent elections
      const electionsResponse = await API.get('/elections');
      if (electionsResponse?.data) {
        const electionsArray = Array.isArray(electionsResponse.data) ? electionsResponse.data : [];
        setRecentElections(electionsArray.slice(0, 3));
      } else {
        setRecentElections([]);
      }

      // Since there's no voting history endpoint, we'll get the user's votes from the elections
      const userVotes = recentElections.filter(election => 
        election.voters && election.voters.includes(userId)
      ).map(election => ({
        _id: election._id,
        election: {
          title: election.title
        },
        createdAt: election.startTime,
        status: 'completed'
      }));
      setVotingHistory(userVotes.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      setRecentElections([]);
      setVotingHistory([]);
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
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {user?.name || 'Voter'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your voter ID: {user?.voterId || 'Not available'}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Elections Section */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Recent Elections
          </Typography>
          <Grid container spacing={3}>
            {recentElections.map((election) => (
              <Grid item xs={12} sm={6} md={4} key={election._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h3">
                      {election.title}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {new Date(election.startTime).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      {election.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/elections/${election._id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Voting History Section */}
        <Grid xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Voting History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Election</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votingHistory.map((vote) => (
                  <TableRow key={vote._id}>
                    <TableCell>{vote.election.title}</TableCell>
                    <TableCell>
                      {new Date(vote.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vote.status}
                        color={vote.status === 'completed' ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 