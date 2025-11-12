import { createTheme } from '@mui/material/styles';

// A professional, modern, "industry" theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6a11cb', // A vibrant, tech-purple
    },
    secondary: {
      main: '#2575fc', // A complementary gradient blue
    },
    background: {
      default: '#0d1117', // GitHub's dark background
      paper: '#161b22',   // GitHub's dark paper
    },
    text: {
      primary: '#e6edf3', // Brighter text
      secondary: '#7d8590',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #30363d',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #30363d',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;