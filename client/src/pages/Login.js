import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Google,
  Facebook,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.primary.light, 0.1)})`,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: 'rgba(16, 20, 34, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to continue to E-Vote
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? null : <LoginIcon />}
                sx={{
                  mb: 3,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 242, 254, 0.3)',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Or continue with
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                  <IconButton
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <Google />
                  </IconButton>
                  <IconButton
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <Facebook />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    href="/register"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login; 