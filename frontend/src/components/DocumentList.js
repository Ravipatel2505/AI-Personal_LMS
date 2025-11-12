import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Typography, List, ListItem, ListItemText, IconButton, Paper, 
  CircularProgress, Box, Alert 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

export default function DocumentList({ onFileChange }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      setError('Failed to fetch documents.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch documents on component load
  useEffect(() => {
    fetchDocuments();
  }, []);

  // We pass this function to the FileUpload component
  // so it can tell us to refresh the list after an upload.
  useEffect(() => {
    onFileChange(fetchDocuments);
  }, [onFileChange, fetchDocuments]);

  const handleDelete = async (fileId) => {
    try {
      // Optimistic UI update: remove from list immediately
      setDocuments(docs => docs.filter(doc => doc._id !== fileId));
      await axios.delete(`/api/documents/${fileId}`);
    } catch (err) {
      setError('Failed to delete file. Please refresh.');
      // (In a real app, you'd add the doc back to the list here)
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 4, backgroundColor: '#fafafa' }}>
      <Typography variant="h5" gutterBottom>My Documents</Typography>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!isLoading && documents.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          You haven't uploaded any documents yet.
        </Typography>
      )}
      <List>
        {documents.map((doc) => (
          <ListItem
            key={doc._id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(doc._id)}>
                <DeleteIcon />
              </IconButton>
            }
            sx={{ border: '1px solid #eee', mb: 1, backgroundColor: '#fff' }}
          >
            <ListItemText
              primary={doc.originalName}
              secondary={`Uploaded on: ${new Date(doc.createdAt).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}