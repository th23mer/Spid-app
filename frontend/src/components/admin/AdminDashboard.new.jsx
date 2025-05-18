import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, AppBar, Toolbar, 
  CircularProgress, Alert, Card, CardContent, Grid, Tooltip, TextField, InputAdornment, MenuItem, 
  Stack, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuIcon from '@mui/icons-material/Menu';
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import UserManagement from './UserManagement';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#E74C3C', '#2ECC71'];
const STATUS_COLORS = {
  'Vente confirmée': 'success',
  'Client non intéressé': 'error',
  'Client n\'est pas disponible': 'warning'
};

const AdminDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [activeView, setActiveView] = useState(0); // 0: Prospections, 1: Users, 2: Analytics
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch users
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

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const jwt = localStorage.getItem('adminJwt');
      const response = await fetch('http://localhost:5000/api/admin/metrics', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMetrics();
  }, []);

  // Handle user details view
  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setShowUserDetails(false);
  };

  // Handle logout
  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'default';
  };

  // Handle navigation change
  const handleNavChange = (newValue) => {
    setActiveView(newValue);
    if (isMobile) {
      setDrawerOpen(false); // Close drawer after selection on mobile
    }
  };
  
  // Toggle drawer
  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // CSV Export
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Téléphone', 'Nom', 'Prénom', 'Zone', 'Immeuble', 'Bloc', 'Appartement', 'Nom Client', 'Contact', 'Résultat', 'Type Client'];
    const rows = filteredUsers.map(user => [
      user.phone,
      user.nom || '',
      user.prenom || '',
      user.zone || '',
      user.immeuble || '',
      user.blocImmeuble || '',
      user.appartement || '',
      user.nomClient || '',
      user.numContact || '',
      user.resultatProspection || '',
      user.typeClient || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `prospections_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Search and filter logic
  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (zoneFilter) {
      filtered = filtered.filter(u => (u.zone || '').toLowerCase() === zoneFilter.toLowerCase());
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(u => 
        (u.phone || '').toLowerCase().includes(searchLower) ||
        (u.nom || '').toLowerCase().includes(searchLower) ||
        (u.prenom || '').toLowerCase().includes(searchLower) ||
        (u.zone || '').toLowerCase().includes(searchLower) ||
        (u.immeuble || '').toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [users, search, zoneFilter]);

  // Unique zones for filter dropdown
  const uniqueZones = useMemo(() => {
    const set = new Set();
    users.forEach(u => { if (u.zone) set.add(u.zone); });
    return Array.from(set);
  }, [users]);

  // Render sales performance metrics dashboard
  const renderSalesMetrics = () => {
    if (!metrics) return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Performance des Ventes
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Vendeurs
                </Typography>
                <Typography variant="h4" component="div">
                  {metrics.totalUsers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Vendeurs enregistrés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Prospections
                </Typography>
                <Typography variant="h4" component="div">
                  {metrics.totalProspections}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total des prospections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2, bgcolor: 'success.light' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Ventes confirmées
                </Typography>
                <Typography variant="h4" component="div">
                  {metrics.resultsDistribution['Vente confirmée'] || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {metrics.totalProspections > 0 ? 
                    `${((metrics.resultsDistribution['Vente confirmée'] || 0) / metrics.totalProspections * 100).toFixed(1)}% de conversion` : 
                    'Aucune prospection'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2, bgcolor: 'info.light' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Répartition B2B/B2C
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Box>
                    <Typography variant="h5" component="div">
                      {metrics.salesByType.b2b}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      B2B
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h5" component="div">
                      {metrics.salesByType.b2c}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      B2C
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Performers */}
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ mr: 1 }} />
          Top Vendeurs
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Meilleurs Vendeurs</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Vendeur</TableCell>
                        <TableCell align="right">Prospections</TableCell>
                        <TableCell align="right">Ventes</TableCell>
                        <TableCell align="right">Taux</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.topPerformers.map((performer) => (
                        <TableRow key={performer.phone}>
                          <TableCell component="th" scope="row">
                            {performer.name}
                          </TableCell>
                          <TableCell align="right">{performer.totalProspections}</TableCell>
                          <TableCell align="right">{performer.confirmedSales}</TableCell>
                          <TableCell align="right">{performer.conversionRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>Résultats des Prospections</Typography>
                <Box sx={{ height: 250, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.resultsDistributionArray}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {metrics.resultsDistributionArray.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip formatter={(value, name) => [`${value} prospections`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Zone Performance */}
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon sx={{ mr: 1 }} />
          Performance par Zone
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.salesByZoneArray}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zone" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar name="Total Prospections" dataKey="total" fill="#8884d8" />
                      <Bar name="Ventes Confirmées" dataKey="confirmed" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Sidebar content
  const sidebarContent = (
    <Box sx={{ width: isMobile ? 250 : 240 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          Dashboard Admin
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem 
          button 
          selected={activeView === 0}
          onClick={() => handleNavChange(0)}
        >
          <ListItemIcon>
            <DashboardIcon color={activeView === 0 ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Prospections" />
        </ListItem>
        <ListItem 
          button 
          selected={activeView === 1}
          onClick={() => handleNavChange(1)}
        >
          <ListItemIcon>
            <PersonIcon color={activeView === 1 ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Utilisateurs" />
        </ListItem>
        <ListItem 
          button 
          selected={activeView === 2}
          onClick={() => handleNavChange(2)}
        >
          <ListItemIcon>
            <AssessmentIcon color={activeView === 2 ? "primary" : "inherit"} />
          </ListItemIcon>
          <ListItemText primary="Analyses" />
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button 
          fullWidth
          variant="outlined" 
          color="primary" 
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Permanent sidebar for desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
      
      {/* Temporary drawer for mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
      
      {/* Main content area */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {activeView === 0 ? 'Prospections' : activeView === 1 ? 'Utilisateurs' : 'Analyses'}
            </Typography>
            {isMobile && (
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
          {/* Loading indicator */}
          {loading && activeView === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* View content */}
          {activeView === 0 && !loading && !error && (
            <Box>
              {/* Prospections View */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" component="h2">
                  Liste des Prospections
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<RefreshIcon />} 
                    onClick={fetchUsers}
                    size={isMobile ? "small" : "medium"}
                  >
                    {isMobile ? "" : "Actualiser"}
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<GetAppIcon />} 
                    onClick={handleExportCSV}
                    size={isMobile ? "small" : "medium"}
                  >
                    {isMobile ? "CSV" : "Exporter CSV"}
                  </Button>
                </Box>
              </Box>
              
              {/* Search and filter */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rechercher"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Filtrer par zone"
                    variant="outlined"
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    size={isMobile ? "small" : "medium"}
                  >
                    <MenuItem value="">Toutes les zones</MenuItem>
                    {uniqueZones.map((zone) => (
                      <MenuItem key={zone} value={zone}>
                        {zone}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
              
              {/* Users table */}
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Téléphone</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Zone</TableCell>
                      <TableCell>Résultat</TableCell>
                      {!isMobile && <TableCell>Date</TableCell>}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isMobile ? 5 : 6} align="center">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.phone}>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{user.nom} {user.prenom}</TableCell>
                          <TableCell>{user.zone || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.resultatProspection || 'Non défini'} 
                              color={getStatusColor(user.resultatProspection)}
                              size="small"
                            />
                          </TableCell>
                          {!isMobile && <TableCell>{formatDate(user.createdAt)}</TableCell>}
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewUserDetails(user)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {activeView === 1 && (
            <UserManagement 
              users={users} 
              onRefresh={fetchUsers} 
            />
          )}
          
          {activeView === 2 && renderSalesMetrics()}
        </Box>

        {/* User Details Dialog */}
        <Dialog open={showUserDetails} onClose={handleCloseDialog} maxWidth="md">
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ minWidth: 400 }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Téléphone :</Typography>
                    <Typography variant="body1" gutterBottom>{selectedUser.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Nom :</Typography>
                    <Typography variant="body1" gutterBottom>{selectedUser.nom || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Prénom :</Typography>
                    <Typography variant="body1" gutterBottom>{selectedUser.prenom || 'N/A'}</Typography>
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
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Résultat de prospection :</Typography>
                    <Typography variant="body1" gutterBottom>{selectedUser.resultatProspection || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Type de client :</Typography>
                    <Typography variant="body1" gutterBottom>{selectedUser.typeClient || 'N/A'}</Typography>
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
    </Box>
  );
};

export default AdminDashboard;
