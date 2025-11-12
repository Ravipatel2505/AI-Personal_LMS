import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, Box, TextField, Button, Typography, Paper, 
  Avatar, GlobalStyles, Link 
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon, QueryStats as QueryStatsIcon } from '@mui/icons-material';

// Global styles for the auth pages (gradient background)
const AuthGlobalStyles = () => (
  <GlobalStyles
    styles={(theme) => ({
      body: {
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main} 200%)`,
        backgroundAttachment: 'fixed',
      },
    })}
  />
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <AuthGlobalStyles />
      <Paper 
        elevation={12}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
          Log In
        </Typography>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Welcome back to your AI LMS.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </Button>
          <Link component={RouterLink} to="/register" variant="body2" sx={{color: 'text.secondary'}}>
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}