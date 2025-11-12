import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import {
  Container, Typography, Box, Paper, Grid, CircularProgress,
  List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Button,
  TextField, Alert, Divider, Avatar, Tabs, Tab // Import Tabs
} from '@mui/material';
import {
  Send as SendIcon, Delete as DeleteIcon, UploadFile as UploadFileIcon,
  Description as DescriptionIcon, Logout as LogoutIcon, QueryStats as QueryStatsIcon,
  Chat as ChatIcon, Folder as FolderIcon
} from '@mui/icons-material';

// --- STYLED SUB-COMPONENTS ---

// --- ChatBubble Component ---
const ChatBubble = ({ message }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
      mb: 2,
    }}
  >
    <Avatar 
      sx={{ 
        bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
        mr: message.type === 'ai' ? 1 : 0,
        ml: message.type ==='user' ? 1 : 0,
        order: message.type === 'user' ? 2 : 1,
      }}
    >
      {message.type === 'user' ? 'U' : 'AI'}
    </Avatar>
    <Paper
      elevation={3}
      sx={{
        p: 1.5,
        backgroundColor: message.type === 'user' ? 'primary.main' : 'background.paper',
        color: message.type === 'user' ? '#fff' : 'text.primary',
        maxWidth: '80%',
        borderRadius: message.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        order: message.type === 'user' ? 1 : 2,
      }}
    >
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{message.content}</Typography>
      
      {/* --- SOURCES (if any) --- */}
      {message.type === 'ai' && message.sources && message.sources.length > 0 && (
        <Box sx={{ mt: 2, borderTop: '1px solid #30363d', pt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Sources:</Typography>
          {message.sources.map((source, i) => (
            <Box key={i} sx={{ p: 1.5, mt: 1, border: '1px solid #30363d', borderRadius: '8px', backgroundColor: 'background.default' }}>
              <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                "...{source.content.substring(0, 150)}..." (Page: {source.page || 'N/A'})
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  </Box>
);

// --- Dropzone Component ---
const UploadDropzone = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('Drag & drop PDF here, or click');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    setMessage(`Processing ${file.name}...`);
    try {
      await axios.post('/api/upload', formData);
      setMessage(`Success: ${file.name} is ready!`);
      onUploadSuccess();
    } catch (err) {
      setMessage(`Error: Upload failed`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage('Drag & drop PDF here, or click'), 3000);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  return (
    <Box
      {...getRootProps()} 
      sx={{ 
        border: '2px dashed', 
        borderColor: isDragActive ? 'primary.main' : '#30363d', 
        backgroundColor: isDragActive ? '#1c2128' : 'background.paper',
        textAlign: 'center', p: 3, cursor: 'pointer',
        transition: 'all 0.2s ease-in-out', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 120, mb: 2
      }}
    >
      <input {...getInputProps()} />
      <UploadFileIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
      {isUploading ? (
        <Box>
          <CircularProgress size={24} sx={{ mb: 1 }} />
          <Typography variant="body2" color="textSecondary">{message}</Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">{message}</Typography>
      )}
    </Box>
  );
};

// --- Document List Component ---
const DocumentList = ({ documents, isLoading, onDelete }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
      Knowledge Base
    </Typography>
    {isLoading && (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>
    )}
    {!isLoading && documents.length === 0 && (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        Your knowledge base is empty. Upload a document to begin.
      </Typography>
    )}
    <List dense>
      {documents.map((doc) => (
        <ListItem
          key={doc._id}
          secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => onDelete(doc._id)} sx={{color: 'text.secondary'}}>
              <DeleteIcon />
            </IconButton>
          }
          sx={{ borderBottom: '1px solid #30363d', py: 1 }}
        >
          <DescriptionIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
          <ListItemText
            primary={doc.originalName}
            primaryTypographyProps={{ fontWeight: 500, color: 'text.primary' }}
            secondary={`Uploaded: ${new Date(doc.createdAt).toLocaleDateString()}`}
          />
        </ListItem>
      ))}
    </List>
  </Paper>
);

// --- Chat Window Component ---
const ChatWindow = ({ history, isLoading, onAsk, question, setQuestion, docCount }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* CHAT HISTORY (Scrollable) */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        {history.length === 0 ? (
          <Box sx={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <ChatIcon sx={{fontSize: 60, color: 'text.secondary'}} />
            <Typography variant="h5" color="text.secondary" sx={{mt: 2}}>
              Chat with your documents
            </Typography>
            <Typography color="text.secondary">
              Upload a file in the "Documents" tab to get started.
            </Typography>
          </Box>
        ) : (
          history.map((msg, index) => <ChatBubble key={index} message={msg} />)
        )}
        {isLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
        <div ref={chatEndRef} />
      </Box>
      
      {/* CHAT INPUT (Fixed at bottom) */}
      <Box sx={{ p: 2, borderTop: '1px solid #30363d', bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Ask a question about your documents..."
          value={question}
          disabled={docCount === 0}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAsk()}
          InputProps={{
            endAdornment: (
              <IconButton onClick={onAsk} disabled={isLoading || docCount === 0} color="primary">
                <SendIcon />
              </IconButton>
            )
          }}
        />
      </Box>
    </Paper>
  );
};


// --- MAIN PAGE COMPONENT ---
function MainPage() {
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState(0); // 0 for Chat, 1 for Docs

  // State for Document List
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(true);
  
  // State for Chat
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // --- DOCUMENT LOGIC ---
  const fetchDocuments = useCallback(async () => {
    setDocLoading(true);
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents.');
    } finally {
      setDocLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (fileId) => {
    try {
      setDocuments(docs => docs.filter(doc => doc._id !== fileId));
      await axios.delete(`/api/documents/${fileId}`);
    } catch (err) {
      console.error('Failed to delete file.');
      fetchDocuments();
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments();
    setCurrentTab(0); // Switch to chat tab after upload
  };

  // --- CHAT LOGIC ---
  const handleAsk = async () => {
    if (!question.trim() || chatLoading) return;

    const newQuestion = { type: 'user', content: question };
    setChatHistory(prev => [...prev, newQuestion]);
    setQuestion('');
    setChatLoading(true);

    try {
      const res = await axios.post('/api/query', { question });
      const newAnswer = { type: 'ai', content: res.data.answer, sources: res.data.sources };
      setChatHistory(prev => [...prev, newAnswer]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get answer';
      const newAnswer = { type: 'ai', content: `Error: ${errorMsg}` };
      setChatHistory(prev => [...prev, newAnswer]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* --- TOP APP BAR --- */}
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #30363d', bgcolor: 'background.paper' }}>
        <Toolbar>
          <QueryStatsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            AI Personal LMS
          </Typography>
          <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
      
      {/* --- TAB NAVIGATION --- */}
      <Box sx={{ borderBottom: 1, borderColor: '#30363d', bgcolor: 'background.paper' }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} centered>
          <Tab label="Chat" icon={<ChatIcon />} iconPosition="start" />
          <Tab label="Documents" icon={<FolderIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* --- MAIN CONTENT (Changes based on tab) --- */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3, overflowY: 'auto' }}>
        
        {/* CHAT TAB */}
        {currentTab === 0 && (
          <Box sx={{ height: 'calc(100vh - 190px)' }}> {/* Full height minus headers */}
            <ChatWindow 
              history={chatHistory}
              isLoading={chatLoading}
              onAsk={handleAsk}
              question={question}
              setQuestion={setQuestion}
              docCount={documents.length}
            />
          </Box>
        )}

        {/* DOCUMENTS TAB */}
        {currentTab === 1 && (
          <Box>
            <UploadDropzone onUploadSuccess={handleUploadSuccess} />
            <DocumentList documents={documents} isLoading={docLoading} onDelete={handleDelete} />
          </Box>
        )}
        
      </Container>
    </Box>
  );
}

export default MainPage;