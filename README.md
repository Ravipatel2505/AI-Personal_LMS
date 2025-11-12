# AI-LMS (Learning Management System with AI Integration)

A full-stack, containerized Learning Management System that integrates AI-powered document analysis and intelligent query processing. Built with Docker, React, Node.js, Python, and modern cloud technologies.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features](#features)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AI-LMS is an intelligent learning management system designed for the modern educational landscape. It combines:

- **Document Management**: Upload, process, and manage learning materials
- **AI-Powered Analysis**: Intelligent document indexing and semantic search using LLMs
- **Real-time Communication**: WebSocket-ready architecture with Redis
- **Vector Database**: Semantic search capabilities with Qdrant
- **User Authentication**: Secure JWT-based authentication
- **Responsive UI**: Modern React-based frontend with Material-UI

## 🏗️ Architecture

The system follows a microservices architecture with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                      Port: 3000                              │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
┌───────────────────────────────┐  ┌────────────────────────────┐
│    API Gateway (Node.js)      │  │   AI Worker (Python)       │
│    Express.js                 │  │   Flask                    │
│    Port: 5000                 │  │   Port: 8000               │
└───────────────────────────────┘  └────────────────────────────┘
      │          │          │              │
      ▼          ▼          ▼              ▼
   ┌──────┐  ┌────────┐  ┌───────┐   ┌──────────┐
   │MongoDB│ │ Redis  │  │Qdrant │   │ Groq LLM │
   │ DB    │ │ Queue  │  │Vector │   │ (Cloud)  │
   └──────┘  └────────┘  └───────┘   └──────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React** 18.2
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Dropzone** - File upload handling
- **Emotion** - CSS-in-JS styling

### Backend (API Gateway)
- **Node.js** with Express.js
- **MongoDB** - Primary database
- **Mongoose** - ODM for MongoDB
- **Redis** - Message queue & caching
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload middleware

### AI Worker
- **Python 3.x**
- **Flask** - Lightweight web framework
- **LangChain** - LLM orchestration
- **Groq API** - LLM provider (Llama 3.3 70B)
- **Qdrant** - Vector database for semantic search
- **Sentence Transformers** - Embedding generation
- **PyPDF** - PDF processing

### Infrastructure
- **Docker** & **Docker Compose** - Containerization & orchestration
- **MongoDB** - NoSQL database
- **Redis** - In-memory data store
- **Qdrant** - Vector similarity search

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 1.29 or higher)
- **Git** (for cloning the repository)
- **GROQ API Key** (obtain from [console.groq.com](https://console.groq.com))

> **Windows Users**: If using Windows, ensure Docker Desktop is installed with WSL 2 backend enabled.

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ravipatel2505/ai-lms.git
cd ai-lms
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory or update the `docker-compose.yml` with your configuration:

```bash
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=mongodb://mongo:27017/lms
REDIS_HOST=redis
AI_SERVICE_URL=http://ai_worker:8000
QDRANT_HOST=qdrant
```

### 3. Build and Start Services

```bash
docker-compose up --build
```

This command will:
- Build images for all services
- Create and start containers
- Initialize databases
- Set up networking between services

### 4. Verify Services Are Running

```bash
docker-compose ps
```

Expected output:
```
NAME                COMMAND                  SERVICE         STATUS      PORTS
ai-lms-frontend     npm start                frontend        Up          0.0.0.0:3000->3000/tcp
ai-lms-api_gateway  node app.js              api_gateway     Up          0.0.0.0:5000->5000/tcp
ai-lms-ai_worker    python app.py            ai_worker       Up          0.0.0.0:8000->8000/tcp
ai-lms-mongo        mongod                   mongo           Up          0.0.0.0:27017->27017/tcp
ai-lms-redis        redis-server             redis           Up          0.0.0.0:6379->6379/tcp
ai-lms-qdrant       /qdrant                  qdrant          Up          0.0.0.0:6333->6333/tcp, ...
```

## ⚙️ Configuration

### Environment Variables

Create or modify environment variables in `docker-compose.yml`:

| Variable | Service | Description | Example |
|----------|---------|-------------|---------|
| `GROQ_API_KEY` | ai_worker | API key for Groq LLM service | `gsk_xxx...` |
| `MONGO_URI` | api_gateway, ai_worker | MongoDB connection string | `mongodb://mongo:27017/lms` |
| `REDIS_HOST` | api_gateway, ai_worker | Redis hostname | `redis` |
| `AI_SERVICE_URL` | api_gateway | AI Worker service URL | `http://ai_worker:8000` |
| `QDRANT_HOST` | ai_worker | Qdrant vector DB hostname | `qdrant` |

### Getting a GROQ API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your configuration

## 🎬 Running the Application

### Start All Services

```bash
docker-compose up -d
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Worker**: http://localhost:8000
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017
- **Qdrant Dashboard**: http://localhost:6333

### View Logs

```bash
# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f api_gateway
docker-compose logs -f ai_worker
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Stop Services and Remove Volumes

```bash
docker-compose down -v
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response: { "token": "jwt_token_here" }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { "token": "jwt_token_here" }
```

### Document Endpoints

#### Upload Document
```
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

File: [PDF or document file]

Response: { 
  "fileId": "xxx", 
  "status": "PENDING",
  "message": "File uploaded successfully"
}
```

#### Query Documents
```
POST /api/query
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "query": "What is the main topic of the document?"
}

Response: {
  "answer": "...",
  "sources": ["document_id_1", "document_id_2"]
}
```

### AI Worker Endpoints

#### Test Connection
```
GET /test

Response: { "message": "Hello from the Python AI Worker!" }
```

#### Query AI
```
POST /query
Content-Type: application/json

{
  "query": "Your question here"
}

Response: { "answer": "..." }
```

## 📁 Project Structure

```
ai-lms/
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # React Context (Auth, etc.)
│   │   ├── pages/            # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── backend-api/              # Node.js/Express API
│   ├── middleware/           # Express middleware
│   │   └── auth.js          # JWT verification
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   └── File.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   └── documents.js
│   ├── app.js               # Express app entry
│   ├── Dockerfile
│   └── package.json
│
├── ai-worker/                # Python Flask service
│   ├── app.py               # Flask app & routes
│   ├── worker.py            # Background tasks
│   ├── Dockerfile
│   ├── requirements.txt
│   └── uploads/             # Shared volume for uploads
│
├── docker-compose.yml        # Docker orchestration
└── README.md                # This file
```

## ✨ Features

- ✅ **User Authentication**: JWT-based secure authentication
- ✅ **Document Upload**: Support for PDF and document files
- ✅ **AI-Powered Analysis**: Semantic search using vector embeddings
- ✅ **Real-time Processing**: Redis-based message queue for async tasks
- ✅ **Vector Database**: Qdrant for efficient semantic search
- ✅ **Responsive UI**: Mobile-friendly Material-UI interface
- ✅ **Microservices Architecture**: Scalable, independent services
- ✅ **Containerized Deployment**: Docker & Docker Compose ready
- ✅ **Modern LLM Integration**: Groq API with Llama 3.3 70B
- ✅ **File Management**: Organized document storage and metadata

## 🔐 Environment Variables

### Core Configuration

```env
# AI Service
GROQ_API_KEY=your_groq_api_key_here

# Databases
MONGO_URI=mongodb://mongo:27017/lms
REDIS_HOST=redis
QDRANT_HOST=qdrant

# Services
AI_SERVICE_URL=http://ai_worker:8000
JWT_SECRET=your_jwt_secret_key
```

## 🆘 Troubleshooting

### Port Already in Use

If you get "port already in use" error, modify the port mapping in `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "3001:3000"  # Change 3000 to an available port
```

### MongoDB Connection Failed

Ensure MongoDB service is running:

```bash
docker-compose logs mongo
```

If MongoDB won't start, check disk space:

```bash
docker system prune  # Clean up unused Docker resources
```

### AI Worker Not Responding

1. Verify GROQ_API_KEY is set correctly
2. Check AI worker logs:
   ```bash
   docker-compose logs ai_worker
   ```
3. Ensure Qdrant is running:
   ```bash
   docker-compose logs qdrant
   ```

### Frontend Can't Connect to Backend

1. Verify API_GATEWAY is running on port 5000
2. Check network connectivity:
   ```bash
   docker-compose exec frontend curl http://api_gateway:5000/health
   ```
3. Review CORS settings in `backend-api/app.js`

### Qdrant Vector Database Issues

```bash
# Restart Qdrant
docker-compose restart qdrant

# View Qdrant logs
docker-compose logs qdrant
```

## 📝 Common Commands

```bash
# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild images
docker-compose up --build

# View service logs
docker-compose logs -f [service_name]

# Execute command in container
docker-compose exec [service_name] [command]

# Remove all data
docker-compose down -v

# Check service status
docker-compose ps
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or feedback:
- Open an issue on [GitHub Issues](https://github.com/Ravipatel2505/ai-lms/issues)
- Contact the maintainer: [Ravipatel2505](https://github.com/Ravipatel2505)

## 🎓 Academic Context

This project was developed as part of the **SIT 3rd Semester Full Stack Development** curriculum. It demonstrates:

- Microservices architecture
- Containerization with Docker
- Full-stack development (React, Node.js, Python)
- AI/LLM integration
- Database design (SQL, NoSQL, Vector DB)
- Authentication & Security
- REST API design

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Status**: Active Development
