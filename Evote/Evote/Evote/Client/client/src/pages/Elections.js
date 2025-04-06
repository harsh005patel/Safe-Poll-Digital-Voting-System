import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  HowToVote as VoteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/config';
import { toast } from 'react-toastify';

const ElectionCard = ({ election, isAdmin }) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleVote = () => {
    if (!election?._id) {
      toast.error('Invalid election ID');
      return;
    }
    navigate(`/elections/${election._id}/vote`);
  };

  const handleViewResults = () => {
    if (!election?._id) {
      toast.error('Invalid election ID');
      return;
    }
    navigate(`/elections/${election._id}/results`);
  };

  const handleEdit = () => {
    navigate(`/admin/elections/${election._id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this election?')) {
      try {
        await API.delete(`/elections/${election._id}`);
        toast.success('Election deleted successfully');
        window.location.reload();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete election');
      }
    }
  };

  const getElectionStatus = () => {
    const now = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);
    const resultTime = new Date(election.resultTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) {
      if (now > resultTime) return 'results';
      return 'ended';
    }
    return 'active';
  };

  const status = getElectionStatus();

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardMedia
            component="img"
            height="200"
            image={election.thumbnail || 'https://source.unsplash.com/random/800x600?election'}
            alt={election.title}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {election.title}
              </Typography>
              <Chip
                label={status}
                color={
                  status === 'active' ? 'success' : 
                  status === 'upcoming' ? 'info' : 
                  status === 'results' ? 'primary' : 'default'
                }
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              {election.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {election.location || 'All Locations'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {election.candidates?.length || 0} Candidates
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {isAdmin ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/admin/elections/${election._id}/candidates`)}
                  >
                    Manage Candidates
                  </Button>
                  <Box>
                    <IconButton onClick={handleEdit} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={handleDelete} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={
                      status === 'active' ? handleVote :
                      status === 'results' ? handleViewResults :
                      handleOpenDialog
                    }
                    disabled={status === 'ended'}
                  >
                    {status === 'active' ? 'Vote Now' : 
                     status === 'results' ? 'View Results' :
                     'View Details'}
                  </Button>
                  <Box>
                    <IconButton>
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Election Details</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                height="300"
                image={election.thumbnail || 'https://source.unsplash.com/random/800x600?election'}
                alt={election.title}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                {election.title}
              </Typography>
              <Chip
                label={status}
                color={status === 'active' ? 'success' : status === 'upcoming' ? 'info' : 'default'}
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" paragraph>
                {election.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {election.location || 'All Locations'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {election.candidates?.length || 0} Candidates
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/elections/${election._id}`)}
          >
            View Candidates
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Elections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
  });
  const [formErrors, setFormErrors] = useState({
    title: false,
    description: false,
    startTime: false,
    endTime: false,
  });
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/elections');
      if (response && response.data) {
        setElections(Array.isArray(response.data) ? response.data : []);
      } else {
        setElections([]);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      setError('Failed to fetch elections');
      toast.error(error.message || 'Failed to fetch elections');
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    return 'active';
  };

  const filteredElections = Array.isArray(elections) ? elections.filter((election) => {
    if (!election) return false;
    
    const matchesSearch = 
      election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (election.location && election.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const status = getElectionStatus(election);

    if (activeTab === 0) return matchesSearch; // All Elections
    if (activeTab === 1) return matchesSearch && status === 'active';
    if (activeTab === 2) return matchesSearch && status === 'upcoming';
    if (activeTab === 3) return matchesSearch && status === 'ended';
    return matchesSearch;
  }) : [];

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
    });
    setThumbnail(null);
  };

  const validateForm = () => {
    const errors = {
      title: !formData.title.trim(),
      description: !formData.description.trim(),
      startTime: !formData.startTime,
      endTime: !formData.endTime,
    };

    // Check if end time is after start time
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        errors.endTime = true;
      }
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const errors = {};
    if (!formData.title) errors.title = true;
    if (!formData.description) errors.description = true;
    if (!formData.startTime) errors.startTime = true;
    if (!formData.endTime) errors.endTime = true;
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('startDate', formData.startTime);
      form.append('endDate', formData.endTime);
      form.append('location', formData.location || '');
      form.append('createdBy', user._id);

      if (thumbnail) {
        form.append('thumbnail', thumbnail);
      }

      const response = await API.post('/elections', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response?.data) {
        toast.success('Election created successfully');
        setOpenDialog(false);
        fetchElections();
      }
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error(error.response?.data?.message || 'Failed to create election');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Elections
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.isAdmin ? 'Manage elections and candidates' : 'View and participate in active and upcoming elections'}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search elections..."
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
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {user?.isAdmin && (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleOpenDialog}
                      startIcon={<AddIcon />}
                      sx={{ mr: 2 }}
                    >
                      Create Election
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/admin')}
                      sx={{ mr: 2 }}
                    >
                      Manage Elections
                    </Button>
                  </>
                )}
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
            <Tab label="All Elections" />
            <Tab label="Active" />
            <Tab label="Upcoming" />
            <Tab label="Ended" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredElections.map((election) => (
            <Grid item xs={12} sm={6} md={4} key={election._id}>
              <ElectionCard election={election} isAdmin={user?.isAdmin} />
            </Grid>
          ))}
        </Grid>

        {filteredElections.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <VoteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No elections found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}

        {/* Create Election Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Election</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                margin="normal"
                required
                error={formErrors.title}
                helperText={formErrors.title ? 'Title is required' : ''}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                required
                error={formErrors.description}
                helperText={formErrors.description ? 'Description is required' : ''}
              />
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
                margin="normal"
                required
                error={formErrors.startTime}
                helperText={formErrors.startTime ? 'Start time is required' : ''}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                margin="normal"
                required
                error={formErrors.endTime}
                helperText={formErrors.endTime ? 'End time must be after start time' : ''}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                margin="normal"
              />
              <Button
                component="label"
                variant="outlined"
                sx={{ mt: 2 }}
                fullWidth
              >
                Upload Thumbnail
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                />
              </Button>
              {thumbnail && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {thumbnail.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Create Election
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default Elections; 