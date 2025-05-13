import React, { useState } from 'react';
import axios from 'axios';
import { Box, Stack, useTheme, useMediaQuery, TextField, Button, Typography, Alert, Dialog, DialogContent } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PhoneStep from './components/PhoneStep';
import OtpStep from './components/OtpStep';
import ProfileStep from './components/ProfileStep';
import Admin from './components/admin/Admin';

function MainApp() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [form, setForm] = useState({ zone: '', immeuble: '', blocImmeuble: '', appartement: '', nomClient: '', numContact: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleRequestOtp = async () => {
    setStep(1);
  };

  const handleVerifyOtp = async (token) => {
    setToken(token);
    setStep(2);
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
      {/* Admin button (top-right corner) */}
      {step === 0 && (
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

      <Box sx={{ 
        width: '100%', 
        maxWidth: isMobile ? '90%' : isTablet ? '450px' : '520px',
        px: isMobile ? 3 : 0,
        pt: isMobile ? 6 : 10,
        pb: 6,
        position: 'relative',
        zIndex: 1
      }}>
        {step === 0 && <PhoneStep phone={phone} onChangePhone={e => setPhone(e.target.value)} onSuccess={handleRequestOtp} />}
        {step === 1 && <OtpStep phone={phone} otp={otp} onChangeOtp={e => setOtp(e.target.value)} onSuccess={handleVerifyOtp} />}
        {step === 2 && <ProfileStep form={form} onChange={handleChange} onSuccess={handleProfile} token={token} />}
      </Box>
      
      {/* Progress Indicator - Subtle dots at bottom */}
      <Box sx={{
        position: 'absolute',
        bottom: isMobile ? 30 : 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
        zIndex: 1
      }}>
        {[0, 1, 2].map((s) => (
          <Box
            key={s}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: step === s ? 'primary.main' : 'rgba(148, 163, 184, 0.5)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
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
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
