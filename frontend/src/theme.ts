import { createTheme, alpha } from '@mui/material/styles';

// Define custom colors
const primaryColor = '#3f51b5';
const secondaryColor = '#f50057';
const successColor = '#4caf50';
const warningColor = '#ff9800';
const errorColor = '#f44336';
const infoColor = '#2196f3';
const backgroundDark = '#121212';
const backgroundLight = '#f5f5f5';
const textPrimary = '#ffffff';
const textSecondary = 'rgba(255, 255, 255, 0.7)';

// Create the theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryColor,
      light: alpha(primaryColor, 0.8),
      dark: alpha(primaryColor, 1.2),
      contrastText: textPrimary,
    },
    secondary: {
      main: secondaryColor,
      light: alpha(secondaryColor, 0.8),
      dark: alpha(secondaryColor, 1.2),
      contrastText: textPrimary,
    },
    success: {
      main: successColor,
      light: alpha(successColor, 0.8),
      dark: alpha(successColor, 1.2),
      contrastText: textPrimary,
    },
    warning: {
      main: warningColor,
      light: alpha(warningColor, 0.8),
      dark: alpha(warningColor, 1.2),
      contrastText: textPrimary,
    },
    error: {
      main: errorColor,
      light: alpha(errorColor, 0.8),
      dark: alpha(errorColor, 1.2),
      contrastText: textPrimary,
    },
    info: {
      main: infoColor,
      light: alpha(infoColor, 0.8),
      dark: alpha(infoColor, 1.2),
      contrastText: textPrimary,
    },
    background: {
      default: backgroundDark,
      paper: alpha(backgroundDark, 0.8),
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${primaryColor}, ${alpha(primaryColor, 0.8)})`,
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          background: `linear-gradient(135deg, ${alpha(backgroundDark, 0.9)}, ${alpha(backgroundDark, 0.7)})`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(primaryColor, 0.2)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${alpha(primaryColor, 0.2)}`,
        },
        head: {
          fontWeight: 600,
          backgroundColor: alpha(primaryColor, 0.1),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: alpha(primaryColor, 0.1),
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme; 