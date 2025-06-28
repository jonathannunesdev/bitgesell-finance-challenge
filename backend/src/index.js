const express = require('express');
const path = require('path');
const morgan = require('morgan');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound } = require('./middleware/errorHandler');
const { logger, errorLogger } = require('./middleware/logger');

const app = express();
const port = process.env.PORT || 3001;

// More permissive CORS configuration for development
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware - use both Morgan and custom logger
app.use(morgan('dev')); // Morgan for basic HTTP logging
app.use(logger); // Custom logger for detailed request/response logging

// Serve static files from frontend public folder
app.use('/imgs', express.static(path.join(__dirname, '../../frontend/public/imgs')));

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

// Error logging middleware
app.use(errorLogger);

// Global error handler middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // If the error has a status, use it, otherwise use 500
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

app.listen(port, () => console.log(`[${new Date().toISOString()}] Backend running on http://localhost:${port}`));