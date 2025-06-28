const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;

// Mock data for tests
const mockDataItems = [
  {
    id: 1,
    name: 'Laptop Pro',
    category: 'Electronics',
    price: 2499,
    image: '/imgs/laptop.png'
  },
  {
    id: 2,
    name: 'Noise Cancelling Headphones',
    category: 'Electronics',
    price: 399,
    image: '/imgs/headphones.png'
  },
  {
    id: 3,
    name: 'Ultra‑Wide Monitor',
    category: 'Electronics',
    price: 999,
    image: '/imgs/monitor.png'
  },
  {
    id: 4,
    name: 'Ergonomic Chair',
    category: 'Furniture',
    price: 799,
    image: '/imgs/chair.png'
  },
  {
    id: 5,
    name: 'Standing Desk',
    category: 'Furniture',
    price: 1199,
    image: '/imgs/desk.png'
  }
];

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api/items', require('../routes/items'));

describe('Items Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body.items).toEqual(mockDataItems);
      expect(response.body.items).toHaveLength(5);
    });

    it('should return empty list when file does not exist', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.readFile.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body.items).toEqual([]);
    });

    it('should filter items by search query', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(response.body.items[0].name).toBe('Laptop Pro');
    });

    it('should search by name', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      const response = await request(app)
        .get('/api/items?q=monitor')
        .expect(200);

      expect(response.body.items[0].name).toBe('Ultra‑Wide Monitor');
    });

    it('should search by partial name', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      const response = await request(app)
        .get('/api/items?q=noise')
        .expect(200);

      expect(response.body.items[0].name).toBe('Noise Cancelling Headphones');
    });

    it('should limit number of results', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      const response = await request(app)
        .get('/api/items?limit=2')
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].id).toBe(1);
      expect(response.body.items[1].id).toBe(2);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('Permission denied'));

      await request(app)
        .get('/api/items')
        .expect(500);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return item by id', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body.name).toBe('Laptop Pro');
    });

    it('should return headphones by id', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      const response = await request(app)
        .get('/api/items/2')
        .expect(200);

      expect(response.body.name).toBe('Noise Cancelling Headphones');
    });

    it('should return 404 when item not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      await request(app)
        .get('/api/items/999')
        .expect(404);
    });

    it('should handle invalid id parameter', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));

      await request(app)
        .get('/api/items/abc')
        .expect(404);
    });
  });

  describe('POST /api/items', () => {
    it('should create new item', async () => {
      const newItem = {
        name: 'Gaming Mouse',
        category: 'Electronics',
        price: 89,
        description: 'High precision gaming mouse'
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));
      fs.writeFile.mockResolvedValue();

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body.name).toBe('Gaming Mouse');
      expect(response.body.category).toBe('Electronics');
      expect(response.body.price).toBe(89);
      // description is optional
    });

    it('should validate required fields', async () => {
      const invalidItem = {
        category: 'Electronics',
        price: 89
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toMatch(/required/);
    });

    it('should validate name is not empty', async () => {
      const invalidItem = {
        name: '',
        category: 'Electronics',
        price: 89
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toMatch(/required/);
    });

    it('should validate price is positive', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Electronics',
        price: -10
      };

      const response = await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.error).toMatch(/positive/);
    });

    it('should handle file write errors', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Electronics',
        price: 10
      };

      fs.readFile.mockResolvedValue(JSON.stringify(mockDataItems));
      fs.writeFile.mockRejectedValue(new Error('Disk full'));

      await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(500);
    });
  });
});