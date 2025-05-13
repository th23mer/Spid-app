import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, InputAdornment, Alert, Fade } from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function PhoneStep({ phone, onChangePhone, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Mask phone number as user types
  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 10);
    onChangePhone({ target: { value: input } });
    if (error) setError('');
  };
  
  // Handle OTP request with validation and API call
  const handleRequestOtp = async () => {
    setError('');
    
    // Validate phone number
    if (!phone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone');
      return;
    }
    
    if (phone.length < 8) {
      setError('Le numéro de téléphone doit contenir au moins 8 chiffres');
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/auth/request-otp', { phone });
      setLoading(false);
      onSuccess();
    } catch (e) {
      setLoading(false);
      setError(e.response?.data?.message || "Échec de l'envoi du code OTP");
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 1.5, 
            fontWeight: 700,
            background: 'linear-gradient(90deg,rgb(105, 11, 11),rgb(219, 16, 50))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Bienvenue
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 20, color: 'text.secondary', fontWeight: 500 }}>
          Connectez-vous à l'application de prospection
        </Typography>

        {error && (
          <Fade in={true}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px'
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Numéro de téléphone"
            value={phone}
            onChange={handlePhoneChange}
            variant="outlined"
            fullWidth
            placeholder="XXXXXXXX"
            error={!!error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneAndroidIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth
          size="large"
          disableElevation
          disabled={loading}
          onClick={handleRequestOtp}
          endIcon={loading ? null : <KeyboardArrowRightIcon />}
          sx={{ 
            py: 1.5,
            borderRadius: '10px'
          }}
        >
          {loading ? 'Envoi en cours...' : 'Connexion'}
        </Button>
        
        <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary', opacity: 0.8 }}>
          Votre numéro est utilisé uniquement pour l'authentification
        </Typography>
      </Box>
    </Fade>
  );
}
