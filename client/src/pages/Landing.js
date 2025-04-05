import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  HowToVote,
  Security,
  Speed,
  Analytics,
  People,
  Campaign,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const features = [
  {
    icon: <Security />,
    title: 'Secure Voting',
    description: 'Advanced encryption and blockchain technology ensure your vote is secure and tamper-proof.',
  },
  {
    icon: <Speed />,
    title: 'Fast & Easy',
    description: 'Cast your vote in seconds with our intuitive and user-friendly interface.',
  },
  {
    icon: <Analytics />,
    title: 'Real-time Results',
    description: 'Get instant access to election results and analytics as votes are cast.',
  },
  {
    icon: <People />,
    title: 'Inclusive',
    description: 'Accessible to all voters, regardless of location or physical abilities.',
  },
  {
    icon: <Campaign />,
    title: 'Campaign Management',
    description: 'Comprehensive tools for candidates to manage their campaigns effectively.',
  },
  {
    icon: <HowToVote />,
    title: 'Multiple Elections',
    description: 'Support for various types of elections and voting methods.',
  },
];

const Landing = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.primary.light, 0.1)})`,
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Modern Voting for a Digital World
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Secure, transparent, and efficient electronic voting platform for the modern world.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0, 242, 254, 0.3)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/about')}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="/hero-image.png"
                  alt="E-Vote Platform"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: 600,
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Features
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Everything you need for modern electronic voting
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(16, 20, 34, 0.8)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0, 242, 254, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          margin: '0 auto',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.1) 30%, rgba(79, 172, 254, 0.1) 90%)',
                          borderRadius: '50%',
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" gutterBottom>
                Ready to Get Started?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Join thousands of voters who trust E-Vote for secure electronic voting.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  py: 2,
                  px: 6,
                  background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 242, 254, 0.3)',
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Landing; 