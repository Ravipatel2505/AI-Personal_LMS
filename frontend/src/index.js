import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Theme and CssBaseline
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline applies the dark background and font */}
    <CssBaseline />
    <App />
  </ThemeProvider>
);