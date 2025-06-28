const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { z } = require('zod');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../../frontend/public/imgs');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique name for the file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check if it's an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Zod schema for item validation
const ItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  image: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Function to read data - adjusted to not block the server
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Function to write data - also made it async to avoid blocking
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching items with params:`, req.query);
    
    const data = await readData();
    const { limit, q, page } = req.query;
    let results = data;

    if (q) {
      // Improved search with checks name, description and tags
      const searchTerm = q.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        (item.price && item.price.toString().includes(searchTerm))
      );
      console.log(`[${new Date().toISOString()}] Search for "${q}" returned ${results.length} results`);
    }

    let total = results.length;
    let pageNum = parseInt(page) || 1;
    let limitNum = parseInt(limit) || results.length;
    let start = (pageNum - 1) * limitNum;
    let end = start + limitNum;
    let paginated = results.slice(start, end);

    console.log(`[${new Date().toISOString()}] Returning ${paginated.length} items (page ${pageNum}/${Math.ceil(total / limitNum)})`);

    res.json({
      items: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching items:`, error.message);
    next(error);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    console.log(`[${new Date().toISOString()}] Fetching item with ID: ${itemId}`);
    
    const data = await readData();
    const item = data.find(i => i.id === itemId);
    if (!item) {
      console.log(`[${new Date().toISOString()}] Item with ID ${itemId} not found`);
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    
    console.log(`[${new Date().toISOString()}] Successfully fetched item: ${item.name}`);
    res.json(item);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching item ${req.params.id}:`, error.message);
    next(error);
  }
});

// POST /api/items
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating new item:`, {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      hasImage: !!req.file
    });

    // Check if required fields are present
    if (!req.body.name || !req.body.category || !req.body.price) {
      console.log(`[${new Date().toISOString()}] Validation failed: Missing required fields`);
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, and price are required' 
      });
    }

    // Prepare item data
    const itemData = {
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      image: req.file ? `/imgs/${req.file.filename}` : '/imgs/default.png'
    };

    // Validate if price is a valid number
    if (isNaN(itemData.price) || itemData.price <= 0) {
      console.log(`[${new Date().toISOString()}] Validation failed: Invalid price ${req.body.price}`);
      return res.status(400).json({ 
        error: 'Price must be a positive number' 
      });
    }

    // validate input using Zod
    const validationResult = ItemSchema.safeParse(itemData);
    
    if (!validationResult.success) {
      console.log(`[${new Date().toISOString()}] Zod validation failed:`, validationResult.error.errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      });
    }
    
    const validatedItem = validationResult.data;
    const data = await readData();
    
    validatedItem.id = Date.now();
    data.push(validatedItem);
    
    await writeData(data);
    
    console.log(`[${new Date().toISOString()}] Successfully created item: ${validatedItem.name} (ID: ${validatedItem.id})`);
    res.status(201).json(validatedItem);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating item:`, error.message);
    next(error);
  }
});

module.exports = router;