// Extra logger middleware stub for candidate to enhance
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Started`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT'].includes(req.method) && req.body) {
    const logBody = { ...req.body };
    // Remove sensitive fields from logging
    delete logBody.password;
    delete logBody.token;
    if (Object.keys(logBody).length > 0) {
      console.log(`[${new Date().toISOString()}] Request Body:`, JSON.stringify(logBody, null, 2));
    }
  }
  
  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    console.log(`[${new Date().toISOString()}] Query Params:`, JSON.stringify(req.query, null, 2));
  }
  
  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusText = res.statusMessage || '';
    
    // Color coding for different status codes
    let statusColor = '\x1b[32m'; // Green for 2xx
    if (status >= 400 && status < 500) {
      statusColor = '\x1b[33m'; // Yellow for 4xx
    } else if (status >= 500) {
      statusColor = '\x1b[31m'; // Red for 5xx
    }
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusColor}${status} ${statusText}\x1b[0m - ${duration}ms`);
    
    // Log response body for errors
    if (status >= 400 && chunk) {
      try {
        const responseBody = JSON.parse(chunk.toString());
        console.log(`[${new Date().toISOString()}] Error Response:`, JSON.stringify(responseBody, null, 2));
      } catch (e) {
        console.log(`[${new Date().toISOString()}] Error Response:`, chunk.toString());
      }
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error logger middleware
const errorLogger = (error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR in ${req.method} ${req.originalUrl}:`);
  console.error(`[${new Date().toISOString()}] Error Message:`, error.message);
  console.error(`[${new Date().toISOString()}] Error Stack:`, error.stack);
  
  if (error.status) {
    console.error(`[${new Date().toISOString()}] HTTP Status:`, error.status);
  }
  
  next(error);
};

module.exports = { logger, errorLogger };