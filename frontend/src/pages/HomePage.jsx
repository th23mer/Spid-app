import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery, Dialog, DialogContent, Typography, Stack, Button, Paper, Avatar, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from 'axios';
import ProfileStep from './user/ProfileStep';
import AuthContainer from './user/auth/AuthContainer';

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [form, setForm] = useState({ zone: '', immeuble: '', blocImmeuble: '', appartement: '', nomClient: '', numContact: '', resultatProspection: '', typeClient: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleAuthSuccess = (authToken) => {
    setToken(authToken);
    setIsAuthenticated(true);
    fetchUserData(authToken);
  };
  
  const fetchUserData = async (authToken) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile', {
        headers: { 
          Authorization: `Bearer ${authToken || token}` 
        }
      });
      setUserData(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken('');
    setUserData(null);
  };

  const handleProfile = async () => {
    setShowSuccess(true);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 0,
        position: 'relative'
      }}
    >
      {/* Admin button (top-right corner) - only show on auth page */}
      {!isAuthenticated && (
        <Link to="/admin" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AdminPanelSettingsIcon />}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
            }}
          >
            Admin
          </Button>
        </Link>
      )}
      
      {/* User header - only show when authenticated */}
      {isAuthenticated && userData && (
        <Paper 
          elevation={3}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            py: 1.5,
            px: 3,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '0 0 20px 20px',
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(240, 245, 255, 0.95))',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 2,
                  width: 45,
                  height: 45,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                {userData.nom ? userData.nom.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: 'primary.dark'
                  }}
                >
                  {userData.nom} {userData.prenom}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon 
                    fontSize="small" 
                    sx={{ 
                      mr: 0.5, 
                      color: 'primary.light', 
                      fontSize: 16 
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    {userData.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              color="error" 
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
                }
              }}
            >
              Déconnexion
            </Button>
          </Box>
        </Paper>
      )}

      <Box sx={{ 
        width: '100%', 
        maxWidth: isMobile ? '90%' : isTablet ? '450px' : '520px',
        px: isMobile ? 3 : 0,
        pt: isAuthenticated ? (isMobile ? 12 : 16) : (isMobile ? 6 : 10),
        pb: 6,
        position: 'relative',
        zIndex: 1
      }}>
        {!isAuthenticated ? (
          <AuthContainer onAuthSuccess={handleAuthSuccess} />
        ) : (
          <ProfileStep form={form} onChange={handleChange} onSuccess={handleProfile} token={token} />
        )}
      </Box>
      
      {/* Success Dialog */}
      <Dialog 
        open={showSuccess} 
        onClose={() => setShowSuccess(false)}
        PaperProps={{
          sx: { 
            borderRadius: '20px', 
            p: 3, 
            maxWidth: 400,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogContent>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 80, mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'success.main' }}>Félicitations!</Typography>
            <Typography>
              Vos informations ont été enregistrées avec succès.
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HomePage;
