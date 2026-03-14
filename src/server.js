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
