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
    const data = await readData();
    const { limit, q } = req.query;
    let results = data;

    if (q) {
      // Improved search with checks name, description and tags
      const searchTerm = q.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        (item.price && item.price.toString().includes(searchTerm))
      );
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST /api/items
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    // Check if required fields are present
    if (!req.body.name || !req.body.category || !req.body.price) {
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
      return res.status(400).json({ 
        error: 'Price must be a positive number' 
      });
    }

    // validate input using Zod
    const validationResult = ItemSchema.safeParse(itemData);
    
    if (!validationResult.success) {
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
    res.status(201).json(validatedItem);
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    next(error);
  }
});

module.exports = router;