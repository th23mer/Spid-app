import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Grid, InputAdornment, Alert, Fade, FormControlLabel, Checkbox, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

export default function ProfileStep({ form, onChange, onSuccess, token }) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [locationShared, setLocationShared] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [errors, setErrors] = useState({
    // Prospection fields
    zone: '',
    immeuble: '',
    blocImmeuble: '',
    appartement: '',
    nomClient: '',
    numContact: '',
    resultatProspection: '',
    typeClient: ''
  });

  // Validation rules
  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // User fields validation
    // Nom validation (optional)
    // Prenom validation (optional)

    // Prospection fields validation
    // Zone validation (required)
    if (!form.zone?.trim()) {
      newErrors.zone = 'La zone est requise';
      isValid = false;
    }

    // Immeuble validation (required)
    if (!form.immeuble?.trim()) {
      newErrors.immeuble = "L'immeuble est requis";
      isValid = false;
    }

    // Nom Client validation (required)
    if (!form.nomClient?.trim()) {
      newErrors.nomClient = 'Le nom du client est requis';
      isValid = false;
    }

    // Numéro Contact validation (numeric, required)
    if (!form.numContact?.trim()) {
      newErrors.numContact = 'Le numéro de contact est requis';
      isValid = false;
    } else if (!/^\d+$/.test(form.numContact) || form.numContact.length < 8) {
      newErrors.numContact = 'Veuillez saisir un numéro de téléphone valide';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle field change
  const handleChange = (field, value) => {
    onChange(field, value);
    // Clear error when field is being edited
    if (errors[field]) {
      setErrors({...errors, [field]: ''});
    }
    if (apiError) {
      setApiError('');
    }
  };

  // Handle location sharing checkbox change
  const handleLocationChange = (event) => {
    const checked = event.target.checked;
    setLocationShared(checked);
    
    if (checked) {
      getLocation();
    } else {
      setLocationData(null);
    }
  };
  
  // Get current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas prise en charge par votre navigateur');
      return;
    }
    
    setLocationLoading(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date()
        });
        setLocationLoading(false);
        setLocationShared(true);
      },
      (error) => {
        let errorMessage = 'Erreur lors de la récupération de la position';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vous avez refusé la demande de géolocalisation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Les informations de localisation ne sont pas disponibles';
            break;
          case error.TIMEOUT:
            errorMessage = 'La demande de localisation a expiré';
            break;
        }
        setLocationError(errorMessage);
        setLocationShared(false);
        setLocationLoading(false);
      }
    );
  };
  
  // Handle form submission with validation
  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    setApiError('');
    
    try {
      // Prepare the data to send - now split between User and Prospection models
      const profileData = { 
        // User data
        nom: form.nom,
        prenom: form.prenom,
        
        // Prospection data
        zone: form.zone,
        immeuble: form.immeuble,
        blocImmeuble: form.blocImmeuble,
        appartement: form.appartement,
        nomClient: form.nomClient,
        numContact: form.numContact,
        resultatProspection: form.resultatProspection
      };
      
      // Add location data if shared
      if (locationShared && locationData) {
        profileData.location = locationData;
      }
      
      // Send profile data to backend
      const response = await axios.post(
        'http://localhost:5000/api/profile',
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setLoading(false);
      onSuccess(response.data.user);
    } catch (error) {
      setLoading(false);
      setApiError(error.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde du profil');
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
          Profil Client
        </Typography>
        
        <Typography 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 4 }}
        >
          Veuillez remplir les informations du client
        </Typography>
        
        {apiError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {apiError}
          </Alert>
        )}
        
        <Grid container spacing={2.5}>

          
          {/* Prospection Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 1 }}>
              Information de Prospection
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Zone"
              value={form.zone}
              onChange={e => handleChange('zone', e.target.value)}
              error={Boolean(errors.zone)}
              helperText={errors.zone}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Immeuble"
              value={form.immeuble}
              onChange={e => handleChange('immeuble', e.target.value)}
              error={Boolean(errors.immeuble)}
              helperText={errors.immeuble}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ApartmentOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Bloc Immeuble"
              value={form.blocImmeuble}
              onChange={e => handleChange('blocImmeuble', e.target.value)}
              error={Boolean(errors.blocImmeuble)}
              helperText={errors.blocImmeuble}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Appartement"
              value={form.appartement}
              onChange={e => handleChange('appartement', e.target.value)}
              error={Boolean(errors.appartement)}
              helperText={errors.appartement}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Nom du client"
              value={form.nomClient}
              onChange={e => handleChange('nomClient', e.target.value)}
              error={Boolean(errors.nomClient)}
              helperText={errors.nomClient}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBoxOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Numéro de contact"
              value={form.numContact}
              onChange={e => handleChange('numContact', e.target.value)}
              error={Boolean(errors.numContact)}
              helperText={errors.numContact}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              select
              label="Résultat de la prospection"
              value={form.resultatProspection || ''}
              onChange={e => handleChange('resultatProspection', e.target.value)}
              error={Boolean(errors.resultatProspection)}
              helperText={errors.resultatProspection}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssessmentOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="Client n'est pas disponible">Client n'est pas disponible</MenuItem>
              <MenuItem value="Client non intéressé">Client non intéressé</MenuItem>
              <MenuItem value="Vente confirmée">Vente confirmée</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              select
              label="Type client"
              value={form.typeClient || ''}
              onChange={e => handleChange('typeClient', e.target.value)}
              error={Boolean(errors.typeClient)}
              helperText={errors.typeClient}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ApartmentOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="B2B">B2B</MenuItem>
              <MenuItem value="B2C">B2C</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mt: 2, mb: 1, border: '1px solid rgba(0,0,0,0.12)', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.5)' }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={locationShared}
                    onChange={handleLocationChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MyLocationIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>Partager ma position géographique</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
              
              {locationError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {locationError}
                </Alert>
              )}
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 4 }}>
                En cochant cette case, vous acceptez de partager votre position géographique actuelle.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          sx={{ mt: 4, py: 1.5, borderRadius: '10px' }} 
          onClick={handleSubmit}
          disabled={loading || (locationShared && locationLoading)}
          startIcon={<SaveOutlinedIcon />}
        >
          {loading ? 'Sauvegarde en cours...' : 'Enregistrer le profil'}
        </Button>
        
        <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary', opacity: 0.8 }}>
          Toutes les informations sont sécurisées
        </Typography>
      </Box>
    </Fade>
  );  
}
