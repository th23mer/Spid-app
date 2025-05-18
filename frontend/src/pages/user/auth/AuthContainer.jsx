import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, Dialog, DialogContent, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneStep from './PhoneStep';
import OtpStep from './OtpStep';

const AuthContainer = ({ onAuthSuccess }) => {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleRequestOtp = async () => {
    setStep(1);
  };

  const handleVerifyOtp = async (token) => {
    setToken(token);
    // Notify parent component about successful authentication
    onAuthSuccess(token);
    // Show success dialog
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
        {[0, 1].map((s) => (
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
            <Typography variant="h5" sx={{ color: 'success.main' }}>Authentification réussie!</Typography>
            <Typography>
              Vous êtes maintenant connecté à l'application de prospection.
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AuthContainer;
