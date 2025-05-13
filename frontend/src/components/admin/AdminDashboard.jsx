import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, AppBar, Toolbar, CircularProgress, Alert, Card, CardContent, Grid, Tooltip, TextField, InputAdornment, MenuItem, Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#E74C3C', '#2ECC71'];

const AdminDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const theme = useTheme();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const jwt = localStorage.getItem('adminJwt');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      setError('Erreur lors de la récupération des utilisateurs : ' + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleCloseDialog = () => {
    setShowUserDetails(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminJwt');
    onLogout();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Search and filter logic
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (zoneFilter) {
      filtered = filtered.filter(u => (u.zone || '').toLowerCase() === zoneFilter.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(u =>
        (u.phone && u.phone.toLowerCase().includes(s)) ||
        (u.nomClient && u.nomClient.toLowerCase().includes(s)) ||
        (u.zone && u.zone.toLowerCase().includes(s)) ||
        (u.immeuble && u.immeuble.toLowerCase().includes(s)) ||
        (u.numContact && u.numContact.toLowerCase().includes(s))
      );
    }
    return filtered;
  }, [users, search, zoneFilter]);

  // Pie chart data for location sharing
  const locationPieData = useMemo(() => [
    { name: 'Partage de localisation', value: users.filter(u => u.locationShared).length },
    { name: 'Non partagé', value: users.filter(u => !u.locationShared).length }
  ], [users]);

  // Bar chart data for users per zone
  const zoneBarData = useMemo(() => {
    const zoneMap = {};
    users.forEach(u => {
      const zone = u.zone || 'Unknown';
      zoneMap[zone] = (zoneMap[zone] || 0) + 1;
    });
    return Object.entries(zoneMap).map(([zone, count]) => ({ zone, count }));
  }, [users]);

  // Unique zones for filter dropdown
  const uniqueZones = useMemo(() => {
    const set = new Set();
    users.forEach(u => { if (u.zone) set.add(u.zone); });
    return Array.from(set);
  }, [users]);

  const countStats = () => {
    const totalUsers = users.length;
    const usersWithLocation = users.filter(user => user.locationShared).length;
    return { totalUsers, usersWithLocation };
  };

  const stats = countStats();

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredUsers.length) return;
    // Define CSV headers
    const headers = [
      'Téléphone', 'Nom du client', 'Numéro de contact', 'Zone', 'Immeuble', 'Bloc Immeuble', 'Appartement', 'Localisation partagée', 'Latitude', 'Longitude', 'Horodatage'
    ];
    // Map users to CSV rows
    const rows = filteredUsers.map(u => [
      u.phone || '',
      u.nomClient || '',
      u.numContact || '',
      u.zone || '',
      u.immeuble || '',
      u.blocImmeuble || '',
      u.appartement || '',
      u.locationShared ? 'Oui' : 'Non',
      u.location?.latitude || '',
      u.location?.longitude || '',
      u.location?.timestamp ? new Date(u.location.timestamp).toLocaleString() : ''
    ]);
    // Build CSV content
    const csv = [headers, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ borderRadius: '0px' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tableau de bord Gestion
          </Typography>
          <IconButton color="inherit" onClick={fetchUsers}>
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleExportCSV} title="Exporter CSV">
            <DownloadIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Utilisateurs totaux
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.totalUsers}
                </Typography>
                <PersonIcon color="primary" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Utilisateurs avec localisation
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.usersWithLocation}
                </Typography>
                <LocationOnIcon color="secondary" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Partage de localisation
                </Typography>
                <Box sx={{ width: '100%', height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        label={({ name }) => name === 'Partage de localisation' ? 'Partagé' : 'Non partagé'}
                      >
                        {locationPieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend formatter={v => v === 'Partage de localisation' ? 'Partagé' : 'Non partagé'} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Utilisateurs par zone</Typography>
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneBarData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="zone" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Recherche & Filtre</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Recherche"
                  placeholder="Téléphone, Nom, Zone, Immeuble, Contact..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                <TextField
                  label="Filtrer par zone"
                  select
                  value={zoneFilter}
                  onChange={e => setZoneFilter(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">Toutes les zones</MenuItem>
                  {uniqueZones.map(zone => (
                    <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                  ))}
                </TextField>
                <Button variant="outlined" onClick={() => { setSearch(''); setZoneFilter(''); }}>Réinitialiser</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
          <Typography variant="h5" sx={{ p: 2 }}>
            Liste des utilisateurs
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>Téléphone</TableCell>
                    <TableCell>Nom du client</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell>Immeuble</TableCell>
                    <TableCell>Localisation</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow hover key={user._id}>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.nomClient || 'N/A'}</TableCell>
                      <TableCell>{user.zone || 'N/A'}</TableCell>
                      <TableCell>{user.immeuble || 'N/A'}</TableCell>
                      <TableCell>
                        {user.locationShared ? (
                          <Chip
                            icon={<LocationOnIcon />}
                            label="Partagée"
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Non partagée"
                            color="default"
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir les détails">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewUserDetails(user)}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onClose={handleCloseDialog} maxWidth="md">
        <DialogTitle>Détails de l'utilisateur</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ minWidth: 400 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Téléphone :</Typography>
                  <Typography variant="body1" gutterBottom>{selectedUser.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Nom du client :</Typography>
                  <Typography variant="body1" gutterBottom>{selectedUser.nomClient || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Numéro de contact :</Typography>
                  <Typography variant="body1" gutterBottom>{selectedUser.numContact || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Zone :</Typography>
                  <Typography variant="body1" gutterBottom>{selectedUser.zone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Immeuble :</Typography>
                  <Typography variant="body1" gutterBottom>{selectedUser.immeuble || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Bloc Immeuble :</Typography>
                  <Typography variant="body1" gutterBottom>{selectedUser.blocImmeuble || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Appartement :</Typography>
                  <Typography variant="body1" gutterBottom>{selectedUser.appartement || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Localisation :</Typography>
                  {selectedUser.locationShared ? (
                    <Box>
                      <Typography variant="body2">Latitude : {selectedUser.location?.latitude || 'N/A'}</Typography>
                      <Typography variant="body2">Longitude : {selectedUser.location?.longitude || 'N/A'}</Typography>
                      <Typography variant="body2">Horodatage : {selectedUser.location?.timestamp ? formatDate(selectedUser.location.timestamp) : 'N/A'}</Typography>
                      {selectedUser.location?.latitude && selectedUser.location?.longitude && (
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<LocationOnIcon />}
                          sx={{ mt: 1 }}
                          href={`https://www.google.com/maps?q=${selectedUser.location.latitude},${selectedUser.location.longitude}`}
                          target="_blank"
                        >
                          Voir sur Google Maps
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">Localisation non partagée</Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
