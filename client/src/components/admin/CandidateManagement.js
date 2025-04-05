import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/config';

const CandidateManagement = () => {
  const { electionId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [election, setElection] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    partyName: '',
    motto: '',
  });
  const [partyLogo, setPartyLogo] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchElectionAndCandidates = React.useCallback(async () => {
    try {
      setLoading(true);
      const [electionResponse, candidatesResponse] = await Promise.all([
        API.get(`/elections/${electionId}`),
        API.get(`/elections/${electionId}/candidates`)
      ]);

      setElection(electionResponse?.data || null);
      
      // Ensure candidates is always an array
      if (candidatesResponse?.data && Array.isArray(candidatesResponse.data)) {
        setCandidates(candidatesResponse.data);
      } else {
        console.warn('Candidates data is not an array:', candidatesResponse);
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to fetch election data');
      setCandidates([]);
      if (error.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [electionId, navigate]);

  useEffect(() => {
    fetchElectionAndCandidates();
  }, [fetchElectionAndCandidates]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormData({
      fullname: '',
      partyName: '',
      motto: '',
    });
    setPartyLogo(null);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      fullname: '',
      partyName: '',
      motto: '',
    });
    setPartyLogo(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.fullname || !formData.partyName || !formData.motto) {
        setError('Name, party name, and motto are required');
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append('fullname', formData.fullname);
      form.append('partyName', formData.partyName);
      form.append('motto', formData.motto);
      form.append('electionId', electionId);

      if (partyLogo) {
        form.append('image', partyLogo);
      }

      const response = await API.post('/candidates', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response) {
        toast.success('Candidate added successfully');
        handleCloseDialog();
        fetchElectionAndCandidates();
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to add candidate');
      toast.error(error.message || 'Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setPartyLogo(file);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Invalid candidate ID');
      return;
    }

    if (window.confirm('Are you sure you want to remove this candidate? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await API.delete(`/candidates/${id}`);
        
        if (response && response.data) {
          toast.success('Candidate removed successfully');
          // Update the candidates list by filtering out the deleted candidate
          setCandidates(prevCandidates => prevCandidates.filter(candidate => candidate._id !== id));
        } else {
          throw new Error('Failed to remove candidate');
        }
      } catch (error) {
        console.error('Error removing candidate:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to remove candidate';
        toast.error(errorMessage);
        
        if (error.response?.status === 403) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          toast.error('Candidate not found');
          // Refresh the list to ensure UI is in sync with backend
          fetchElectionAndCandidates();
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (!election) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Manage Candidates - {election.title}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            startIcon={<AddIcon />}
          >
            Add Candidate
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Party</TableCell>
                <TableCell>Motto</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate._id}>
                  <TableCell>
                    <Avatar
                      src={candidate.partyLogo}
                      alt={candidate.fullname}
                      sx={{ width: 50, height: 50 }}
                    />
                  </TableCell>
                  <TableCell>{candidate.fullname}</TableCell>
                  <TableCell>{candidate.partyName}</TableCell>
                  <TableCell>{candidate.motto}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(candidate._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Party Name"
                name="partyName"
                value={formData.partyName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Motto"
                name="motto"
                value={formData.motto}
                onChange={handleChange}
                margin="normal"
                required
              />
              <Button
                component="label"
                variant="outlined"
                sx={{ mt: 2 }}
                fullWidth
              >
                Upload Party Logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {partyLogo && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {partyLogo.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Candidate'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default CandidateManagement; 