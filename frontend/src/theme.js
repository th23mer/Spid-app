import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c'
    },
    secondary: {
      main: '#f43f5e',
      light: '#fb7185',
      dark: '#be123c'
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true
      },
      styleOverrides: {
        root: {
          marginBottom: '20px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#fff',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#fafafa'
            },
            '&.Mui-focused': {
              backgroundColor: '#fff'
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '12px 24px',
          textTransform: 'none',
          fontWeight: 600
        },
        contained: {
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.20)'
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '10px'
        }
      }
    }
  }
});

export default theme;
