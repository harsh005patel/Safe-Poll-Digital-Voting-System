import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Campaign as CampaignIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CampaignCard = ({ campaign }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
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
          image={campaign.image || 'https://source.unsplash.com/random/800x600?election'}
          alt={campaign.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {campaign.title}
            </Typography>
            <Chip
              label={campaign.status}
              color={campaign.status === 'active' ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            {campaign.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {campaign.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {campaign.candidateName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/campaigns/${campaign._id}`)}
            >
              View Details
            </Button>
            <Box>
              <IconButton onClick={handleLike}>
                {isLiked ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Campaigns = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch('/api/campaigns');
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.candidateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Campaigns
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore election campaigns and candidate initiatives
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search campaigns..."
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
            <Tab label="All Campaigns" />
            <Tab label="Active" />
            <Tab label="Upcoming" />
            <Tab label="Ended" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {filteredCampaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign._id}>
              <CampaignCard campaign={campaign} />
            </Grid>
          ))}
        </Grid>

        {filteredCampaigns.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CampaignIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No campaigns found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default Campaigns; 