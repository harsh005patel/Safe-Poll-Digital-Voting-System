import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  TextField,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SettingSection = ({ title, icon, children }) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
};

const Settings = () => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
    },
    preferences: {
      language: 'en',
      theme: 'dark',
    },
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSettingChange = (category, setting) => (event) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: event.target.checked,
      },
    });
  };

  const handlePasswordChange = (field) => (event) => {
    setPassword({
      ...password,
      [field]: event.target.value,
    });
  };

  const handleSaveSettings = async () => {
    try {
      // Replace with your actual API call
      await updateUser({ settings });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError('Failed to save settings. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      setError('New passwords do not match');
      return;
    }

    try {
      // Replace with your actual API call
      await updateUser({ password: password.new });
      setPassword({ current: '', new: '', confirm: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError('Failed to change password. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        {showSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <SettingSection title="Notifications" icon={<NotificationsIcon />}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.email}
                      onChange={handleSettingChange('notifications', 'email')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.push}
                      onChange={handleSettingChange('notifications', 'push')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary="Receive notifications via SMS"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.sms}
                      onChange={handleSettingChange('notifications', 'sms')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </SettingSection>

            <SettingSection title="Security" icon={<SecurityIcon />}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.security.twoFactor}
                      onChange={handleSettingChange('security', 'twoFactor')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Login Alerts"
                    secondary="Get notified about new sign-ins"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.security.loginAlerts}
                      onChange={handleSettingChange('security', 'loginAlerts')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      value={password.current}
                      onChange={handlePasswordChange('current')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={password.new}
                      onChange={handlePasswordChange('new')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      value={password.confirm}
                      onChange={handlePasswordChange('confirm')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<LockIcon />}
                      onClick={handleChangePassword}
                    >
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </SettingSection>

            <SettingSection title="Preferences" icon={<PaletteIcon />}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Language"
                    secondary="Select your preferred language"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      select
                      value={settings.preferences.language}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          preferences: {
                            ...settings.preferences,
                            language: e.target.value,
                          },
                        })
                      }
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </TextField>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Theme"
                    secondary="Choose your preferred theme"
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      select
                      value={settings.preferences.theme}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          preferences: {
                            ...settings.preferences,
                            theme: e.target.value,
                          },
                        })
                      }
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </TextField>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </SettingSection>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={user?.phone || 'Not provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Type"
                    secondary={user?.role || 'Voter'}
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                fullWidth
              >
                Delete Account
              </Button>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Changes
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Settings; 