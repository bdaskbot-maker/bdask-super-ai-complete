const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const agentRoutes = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

const agentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 agent requests per minute
  message: {
    success: false,
    error: 'Agent request limit exceeded. Please wait a moment.'
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(limiter);

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✓ MongoDB connected');
    } else {
      console.log('⚠ MongoDB URI not set, running without database persistence');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Continuing without database persistence...');
  }
};

// Routes
app.use('/api/agent', agentLimiter, agentRoutes);

// Root endpoint - API info and simple test interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BDAsk Super AI API</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          min-height: 100vh;
          color: #fff;
          padding: 2rem;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { 
          font-size: 2.5rem; 
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle { color: #8892b0; margin-bottom: 2rem; }
        .status { 
          background: #0f3460;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid #1a4a70;
        }
        .status-item { 
          display: flex; 
          justify-content: space-between; 
          padding: 0.5rem 0;
          border-bottom: 1px solid #1a4a70;
        }
        .status-item:last-child { border-bottom: none; }
        .badge { 
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
        }
        .badge-success { background: #00ff8820; color: #00ff88; }
        .badge-warning { background: #ffaa0020; color: #ffaa00; }
        .endpoints { margin-bottom: 2rem; }
        .endpoint {
          background: #0f3460;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          border: 1px solid #1a4a70;
        }
        .method {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-right: 0.5rem;
        }
        .method-post { background: #00ff8840; color: #00ff88; }
        .method-get { background: #00d4ff40; color: #00d4ff; }
        .path { font-family: monospace; color: #e6f1ff; }
        .desc { color: #8892b0; font-size: 0.875rem; margin-top: 0.5rem; }
        .chat-box {
          background: #0f3460;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #1a4a70;
        }
        textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #1a4a70;
          border-radius: 8px;
          background: #16213e;
          color: #fff;
          font-size: 1rem;
          resize: vertical;
          min-height: 100px;
          margin-bottom: 1rem;
        }
        textarea:focus { outline: none; border-color: #00d4ff; }
        button {
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          color: #1a1a2e;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover { opacity: 0.9; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        #response {
          margin-top: 1rem;
          padding: 1rem;
          background: #16213e;
          border-radius: 8px;
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 0.875rem;
          max-height: 300px;
          overflow-y: auto;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>BDAsk Super AI</h1>
        <p class="subtitle">Bangladesh's most advanced AI assistant with coding capabilities</p>
        
        <div class="status">
          <div class="status-item">
            <span>Status</span>
            <span class="badge badge-success">Online</span>
          </div>
          <div class="status-item">
            <span>Version</span>
            <span>1.0.0</span>
          </div>
          <div class="status-item">
            <span>Model</span>
            <span>${process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'}</span>
          </div>
          <div class="status-item">
            <span>API Key</span>
            <span class="badge ${process.env.GEMINI_API_KEY ? 'badge-success' : 'badge-warning'}">${process.env.GEMINI_API_KEY ? 'Configured' : 'Not Set'}</span>
          </div>
        </div>

        <h2 style="margin-bottom: 1rem;">API Endpoints</h2>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-post">POST</span>
            <span class="path">/api/agent/chat</span>
            <p class="desc">Send a message to the AI agent (JSON body: { "message": "..." })</p>
          </div>
          <div class="endpoint">
            <span class="method method-post">POST</span>
            <span class="path">/api/agent/chat/stream</span>
            <p class="desc">Stream responses from the AI agent (Server-Sent Events)</p>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="path">/api/agent/health</span>
            <p class="desc">Check agent service health status</p>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="path">/health</span>
            <p class="desc">Check server health status</p>
          </div>
        </div>

        <h2 style="margin-bottom: 1rem;">Test the API</h2>
        <div class="chat-box">
          <textarea id="message" placeholder="Enter your message here... (supports Bengali)"></textarea>
          <button id="send" onclick="sendMessage()">Send Message</button>
          <div id="response"></div>
        </div>
      </div>

      <script>
        async function sendMessage() {
          const message = document.getElementById('message').value;
          const responseDiv = document.getElementById('response');
          const button = document.getElementById('send');
          
          if (!message.trim()) return;
          
          button.disabled = true;
          button.textContent = 'Sending...';
          responseDiv.style.display = 'block';
          responseDiv.textContent = 'Processing...';
          
          try {
            const res = await fetch('/api/agent/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message })
            });
            const data = await res.json();
            responseDiv.textContent = JSON.stringify(data, null, 2);
          } catch (err) {
            responseDiv.textContent = 'Error: ' + err.message;
          } finally {
            button.disabled = false;
            button.textContent = 'Send Message';
          }
        }
        
        document.getElementById('message').addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && e.ctrlKey) sendMessage();
        });
      </script>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'bdask-super-ai-backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 BDAsk Super AI Server running on port ${PORT}`);
    console.log(`📁 Workspace: ${process.env.WORKSPACE_ROOT || process.cwd()}`);
    console.log(`🤖 Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer().catch(console.error);

module.exports = app;
