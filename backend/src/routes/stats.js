const express = require('express');
const fs = require('fs').promises; 
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Avoid recalculating stats on every request
let cachedStats = null;
let lastCheck = 0;
const CACHE_TIME = 2 * 60 * 1000; 

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const now = Date.now();
    
    // Use cached stats if still fresh
    if (cachedStats && (now - lastCheck) < CACHE_TIME) {
      console.log(`[${new Date().toISOString()}] Returning cached stats (cache age: ${Math.round((now - lastCheck) / 1000)}s)`);
      return res.json(cachedStats);
    }

    console.log(`[${new Date().toISOString()}] Calculating fresh stats...`);
    
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    
    const stats = {
      total: items.length,
      averagePrice: items.length > 0 
        ? Math.round((items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length) * 100) / 100
        : 0
    };

    cachedStats = stats;
    lastCheck = now;
    
    console.log(`[${new Date().toISOString()}] Stats calculated: ${stats.total} items, avg price: $${stats.averagePrice}`);
    res.json(stats);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`[${new Date().toISOString()}] No data file found, returning empty stats`);
      res.json({ total: 0, averagePrice: 0 });
    } else {
      console.error(`[${new Date().toISOString()}] Error calculating stats:`, error.message);
      next(error);
    }
  }
});

module.exports = router;
