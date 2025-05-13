import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // POST API key to backend to get JWT
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });
      if (!response.ok) {
        throw new Error('Invalid API key');
      }
      const data = await response.json();
      // Store the JWT token
      localStorage.setItem('adminJwt', data.token);
      setLoading(false);
      onLogin();
    } catch (error) {
      localStorage.removeItem('adminJwt');
      setError("Échec de l'authentification. Veuillez vérifier votre clé API.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Stack direction="row" sx={{ width: '100%' }} alignItems="center" justifyContent="flex-start">
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Retour à l'application
          </Button>
        </Stack>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <LockOutlinedIcon sx={{ color: 'white' }} />
        </Box>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Connexion Admin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="apiKey"
            label="Clé API Gestionnaire"
            name="apiKey"
            autoComplete="off"
            autoFocus
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
