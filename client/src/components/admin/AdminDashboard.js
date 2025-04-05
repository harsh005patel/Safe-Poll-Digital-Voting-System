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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../../api/config';
import PeopleIcon from '@mui/icons-material/People';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchElections = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/elections');
      setElections(response.data || []);
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error(error.message || 'Failed to fetch elections');
      if (error.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  const handleOpenDialog = (election = null) => {
    if (election) {
      setEditingElection(election);
      setFormData({
        title: election.title,
        description: election.description,
        startDate: new Date(election.startTime).toISOString().split('T')[0],
        endDate: new Date(election.endTime).toISOString().split('T')[0],
        location: election.location || '',
      });
      setImagePreview(election.thumbnail);
    } else {
      setEditingElection(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
      });
      setImagePreview(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingElection(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
    });
    setThumbnail(null);
    setImagePreview(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('startDate', new Date(formData.startDate).toISOString());
      form.append('endDate', new Date(formData.endDate).toISOString());
      form.append('location', formData.location);
      if (thumbnail) {
        form.append('thumbnail', thumbnail);
      }

      if (editingElection) {
        await API.patch(`/elections/${editingElection._id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Election updated successfully');
      } else {
        await API.post('/elections', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Election created successfully');
      }
      handleCloseDialog();
      fetchElections();
    } catch (error) {
      console.error('Error:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save election');
      if (error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        await API.delete(`/elections/${id}`);
        toast.success('Election deleted successfully');
        fetchElections();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete election');
        if (error.response?.status === 403) {
          navigate('/login');
        }
      }
    }
  };

  const handleEdit = (election) => {
    handleOpenDialog(election);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Election Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Election
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {elections && elections.length > 0 ? (
              elections.map((election) => (
                <TableRow key={election._id}>
                  <TableCell>{election.title}</TableCell>
                  <TableCell>{election.description}</TableCell>
                  <TableCell>
                    {new Date(election.startTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(election.endTime).toLocaleString()}
                  </TableCell>
                  <TableCell>{election.location || 'All Locations'}</TableCell>
                  <TableCell align="right">
                    <Button
                      startIcon={<PeopleIcon />}
                      onClick={() => navigate(`/admin/elections/${election._id}/candidates`)}
                      sx={{ mr: 1 }}
                    >
                      Manage Candidates
                    </Button>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(election)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleDelete(election._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No elections found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingElection ? 'Edit Election' : 'Add New Election'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="datetime-local"
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="datetime-local"
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Leave empty for all locations"
            />
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 2 }}
            >
              Upload Thumbnail
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={imagePreview}
                  alt="Thumbnail preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingElection ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 