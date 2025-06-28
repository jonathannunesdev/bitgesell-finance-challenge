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
      return res.json(cachedStats);
    }

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
    
    res.json(stats);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ total: 0, averagePrice: 0 });
    } else {
      next(error);
    }
  }
});

module.exports = router;
