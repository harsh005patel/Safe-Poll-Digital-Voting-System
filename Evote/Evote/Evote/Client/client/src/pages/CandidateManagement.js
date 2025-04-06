import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Button, Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { AddIcon } from '../icons/AddIcon';
import { API } from '../services/API';
import { toast } from 'react-hot-toast';
import { CircularProgress } from '@mui/material';

const CandidateManagement = ({ electionId }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (electionId) {
      fetchCandidates();
    }
  }, [electionId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get(`/elections/${electionId}/candidates`);
      if (response && response.data) {
        setCandidates(Array.isArray(response.data) ? response.data : []);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to fetch candidates');
      toast.error(error.response?.data?.message || 'Failed to fetch candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (candidateData) => {
    try {
      const form = new FormData();
      Object.keys(candidateData).forEach(key => {
        form.append(key, candidateData[key]);
      });
      if (candidateData.photo) {
        form.append('photo', candidateData.photo);
      }

      await API.post(`/elections/${electionId}/candidates`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Candidate added successfully');
      fetchCandidates();
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      await API.delete(`/elections/${electionId}/candidates/${candidateId}`);
      toast.success('Candidate deleted successfully');
      fetchCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error(error.response?.data?.message || 'Failed to delete candidate');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Manage Candidates
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add, edit, or remove candidates for this election
          </Typography>
        </Grid>

        <Grid xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
            startIcon={<AddIcon />}
          >
            Add Candidate
          </Button>
        </Grid>

        <Grid xs={12}>
          <Grid container spacing={3}>
            {Array.isArray(candidates) && candidates.map((candidate) => (
              <Grid xs={12} sm={6} md={4} key={candidate._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={candidate.photo || 'https://via.placeholder.com/200'}
                    alt={candidate.name}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h2">
                      {candidate.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {candidate.party}
                    </Typography>
                    <Typography variant="body2">
                      {candidate.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCandidate(candidate._id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          {(!Array.isArray(candidates) || candidates.length === 0) && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No candidates found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Add candidates to get started
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CandidateManagement; 