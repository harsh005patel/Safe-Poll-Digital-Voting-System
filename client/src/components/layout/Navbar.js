import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            E-Vote
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/elections"
                  sx={{ mx: 1 }}
                >
                  Elections
                </Button>
                {user.isAdmin && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    sx={{ mx: 1 }}
                  >
                    Admin Panel
                  </Button>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
                    {user.fullName?.charAt(0)}
                  </Avatar>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    {user.fullName}
                  </Typography>
                </Box>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ mx: 1 }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                  sx={{ mx: 1 }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                  sx={{ mx: 1 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 