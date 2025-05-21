import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Grid, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';

const UserManagement = ({ users: propUsers, onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    nom: '',
    prenom: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch all users
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
    } catch (error) {
      setError('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If users are provided as props, use them
    if (propUsers && propUsers.length > 0) {
      setUsers(propUsers);
      setLoading(false);
    } else {
      // Otherwise fetch users directly
      fetchUsers();
    }
  }, [propUsers]);

  // Handle dialog open for add/edit/delete
  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    
    if (mode === 'add') {
      setFormData({
        phone: '',
        nom: '',
        prenom: ''
      });
    } else if (mode === 'edit' && user) {
      setFormData({
        phone: user.phone,
        nom: user.nom || '',
        prenom: user.prenom || ''
      });
    }
    
    setOpenDialog(true);
    setFormErrors({});
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormErrors({});
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      errors.phone = 'Phone number must contain only digits';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const jwt = localStorage.getItem('adminJwt');
    
    try {
      let response;
      
      if (dialogMode === 'add') {
        // Create new user
        response = await fetch('http://localhost:5000/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify(formData)
        });
      } else if (dialogMode === 'edit') {
        // Update existing user
        response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.phone}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to submit user data');
      }
      
      // Refresh user list
      if (onRefresh) {
        onRefresh(); // Use the callback from parent component
      } else {
        fetchUsers(); // Fallback to local fetch
      }
      handleCloseDialog();
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    const jwt = localStorage.getItem('adminJwt');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.phone}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete operation failed');
      }
      
      // Refresh the user list
      if (onRefresh) {
        onRefresh(); // Use the callback from parent component
      } else {
        fetchUsers(); // Fallback to local fetch
      }
      handleCloseDialog();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        {/* <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestion des utilisateurs
        </Typography> */}
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenDialog('add')}
            sx={{ mr: 1 }}
          >
            ajouter un utilisateur
          </Button>
          <IconButton onClick={fetchUsers} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && !users.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénom</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.phone} hover>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.nom || 'N/A'}</TableCell>
                    <TableCell>{user.prenom || 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog('edit', user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDialog('delete', user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog && (dialogMode === 'add' || dialogMode === 'edit')} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
                error={Boolean(formErrors.phone)}
                helperText={formErrors.phone}
                disabled={dialogMode === 'edit'} // Can't change phone number for existing user
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nom"
                label="Nom"
                value={formData.nom}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="prenom"
                label="Prénom"
                value={formData.prenom}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog && dialogMode === 'delete'} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user with phone number <strong>{selectedUser?.phone}</strong>?
            This will also delete all associated prospection data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
