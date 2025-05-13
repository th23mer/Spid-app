import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Stack, InputAdornment, Grid, Alert, Fade } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function OtpStep({ phone, otp, onChangeOtp, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Create individual handlers for each digit
  const handleOtpChange = (event, position) => {
    const { value } = event.target;
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }
    
    // Create new OTP with the updated position
    const newOtp = otp.split('');
    newOtp[position] = value.substring(0, 1); // Take only first char
    const updatedOtp = newOtp.join('');
    
    // Auto-focus next input
    if (value && position < 5) {
      const nextInput = document.getElementById(`otp-${position + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Send to parent component
    const e = { target: { value: updatedOtp } };
    onChangeOtp(e);
    
    // Clear errors when typing
    if (error) setError('');
  };
  
  // Handle backspace and arrow keys
  const handleKeyDown = (e, position) => {
    if (e.key === 'Backspace' && !e.target.value && position > 0) {
      // Focus previous input when backspace on empty field
      const prevInput = document.getElementById(`otp-${position - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowLeft' && position > 0) {
      const prevInput = document.getElementById(`otp-${position - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && position < 5) {
      const nextInput = document.getElementById(`otp-${position + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  // Handle paste for entire OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    
    if (pasteData) {
      const newOtp = pasteData.split('').concat(Array(6 - pasteData.length).fill(''));
      const event = { target: { value: newOtp.join('') } };
      onChangeOtp(event);
      
      // Focus the appropriate input
      if (pasteData.length < 6) {
        const nextInput = document.getElementById(`otp-${pasteData.length}`);
        if (nextInput) nextInput.focus();
      }
    }
  };
  
  // Verify OTP with API
  const handleVerifyOtp = async () => {
    setError('');
    
    // Validation
    if (otp.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/verify-otp', { phone, code: otp });
      setLoading(false);
      onSuccess(res.data.token);
    } catch (e) {
      setLoading(false);
      setError(e.response?.data?.message || 'Code OTP invalide ou expiré');
    }
  };
  
  return (
    <Fade in={true} timeout={800}>
      <Box>
        <Typography 
          variant="h4" 
          align="center"
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            background: 'linear-gradient(90deg,rgb(105, 11, 11),rgb(219, 16, 50))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Vérification
        </Typography>
        
        <Typography 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: '280px', mx: 'auto' }}
        >
          Entrez le code à 6 chiffres envoyé au {phone && phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}
        </Typography>
        
        {error && (
          <Fade in={true}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          </Fade>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={1} justifyContent="center">
            {Array(6).fill(0).map((_, index) => (
              <Grid item key={index} xs={2}>
                <TextField
                  id={`otp-${index}`}
                  value={otp[index] || ''}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  inputProps={{
                    maxLength: 1,
                    style: { 
                      textAlign: 'center', 
                      fontSize: '1.5rem', 
                      fontWeight: '600',
                      padding: '12px 0' 
                    }
                  }}
                  variant="outlined"
                  error={!!error}
                  autoComplete="one-time-code"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ py: 1.5, borderRadius: '10px' }} 
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || loading}
          startIcon={loading ? null : <CheckCircleOutlineIcon />}
        >
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </Button>
        
        <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary', opacity: 0.8 }}>
          Vous n'avez pas reçu de code? Le code expire après 5 minutes
        </Typography>
      </Box>
    </Fade>
  );
}
