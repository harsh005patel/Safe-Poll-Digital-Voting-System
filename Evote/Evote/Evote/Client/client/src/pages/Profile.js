import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  useTheme,
  alpha,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  HowToVote as VoteIcon,
  Campaign as CampaignIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Profile = () => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotingHistory = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch('/api/user/voting-history');
        const data = await response.json();
        setVotingHistory(data);
      } catch (error) {
        console.error('Error fetching voting history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotingHistory();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
  };

  const handleSave = async () => {
    try {
      // Replace with your actual API call
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Typography variant="h5" component="h1" gutterBottom>
                  {user?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role || 'Voter'}
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <PhoneIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Phone"
                    secondary={user?.phone || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <LocationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Address"
                    secondary={user?.address || 'Not provided'}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label="Profile Information" />
                  <Tab label="Voting History" />
                  <Tab label="Activity" />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Profile Information</Typography>
                    {!isEditing ? (
                      <Button
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <Box>
                        <Button
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          sx={{ mr: 1 }}
                        >
                          Save
                        </Button>
                        <Button
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          color="error"
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                        multiline
                        rows={3}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <List>
                  {votingHistory.map((vote) => (
                    <ListItem
                      key={vote._id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <VoteIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={vote.electionTitle}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Voted for: {vote.candidateName}
                            </Typography>
                            <br />
                            {new Date(vote.voteDate).toLocaleDateString()}
                          </>
                        }
                      />
                      <Chip
                        label={vote.status}
                        color={vote.status === 'confirmed' ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <List>
                  {votingHistory.map((activity) => (
                    <ListItem
                      key={activity._id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <CampaignIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Participated in ${activity.electionTitle}`}
                        secondary={new Date(activity.voteDate).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Profile; 