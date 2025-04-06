import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  const theme = useTheme();

  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com' },
    { icon: <Twitter />, url: 'https://twitter.com' },
    { icon: <Instagram />, url: 'https://instagram.com' },
    { icon: <LinkedIn />, url: 'https://linkedin.com' },
    { icon: <GitHub />, url: 'https://github.com' },
  ];

  const contactInfo = [
    { icon: <Email />, text: 'contact@evote.com' },
    { icon: <Phone />, text: '+1 (555) 123-4567' },
    { icon: <LocationOn />, text: '123 Election Street, Democracy City' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        background: 'rgba(16, 20, 34, 0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                E-Vote
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Secure, transparent, and efficient electronic voting platform for the modern world.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      component={Link}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'inherit',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          background: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {link.icon}
                    </IconButton>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                Quick Links
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Link
                    href="/about"
                    color="inherit"
                    sx={{
                      display: 'block',
                      mb: 1,
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/elections"
                    color="inherit"
                    sx={{
                      display: 'block',
                      mb: 1,
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Elections
                  </Link>
                  <Link
                    href="/candidates"
                    color="inherit"
                    sx={{
                      display: 'block',
                      mb: 1,
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Candidates
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Link
                    href="/faq"
                    color="inherit"
                    sx={{
                      display: 'block',
                      mb: 1,
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/privacy"
                    color="inherit"
                    sx={{
                      display: 'block',
                      mb: 1,
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    color="inherit"
                    sx={{
                      display: 'block',
                      mb: 1,
                      textDecoration: 'none',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Terms of Service
                  </Link>
                </Grid>
              </Grid>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                Contact Us
              </Typography>
              {contactInfo.map((info, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    color: 'text.secondary',
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      mr: 1,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {info.icon}
                  </IconButton>
                  <Typography variant="body2">{info.text}</Typography>
                </Box>
              ))}
            </motion.div>
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} E-Vote. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 