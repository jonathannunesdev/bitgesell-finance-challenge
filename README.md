# Bitgesell Finance - Item Management System

A full-stack web application for managing items with image upload capabilities, built with React frontend and Node.js backend.

## Features

- **Item Management**: Add, view, and search items with categories and prices
- **Image Upload**: Upload images for items with automatic file handling
- **Search & Filter**: Real-time search functionality across item names and categories
- **Responsive Design**: Modern UI built with Material-UI components
- **Pagination**: Efficient item display with pagination support
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

### Frontend
- **React** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Zod** - Data validation
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js          # Main server file
│   │   ├── routes/
│   │   │   ├── items.js      # Item management routes
│   │   │   └── stats.js      # Statistics routes
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── logger.js
│   │   └── utils/
│   │       └── stats.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── App.js        # Main app component
│   │   │   ├── Items.js      # Items list page
│   │   │   └── ItemDetail.js # Item detail page
│   │   ├── state/
│   │   │   └── DataContext.js # Global state management
│   │   ├── utils/
│   │   │   └── config.js     # Configuration
│   │   └── index.js
│   └── package.json
└── data/
    └── items.json            # Data storage
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

**Important:**
Before running the frontend, create a `.env` file inside the `frontend` folder with the following content:

```
REACT_APP_API_URL=http://localhost:3001
```

This is required for the frontend to connect to the backend API. The `.env` file is not included in the repository (it's in .gitignore).

## API Endpoints

### Items
- `GET /api/items` - Get all items (supports query parameters: `q` for search, `limit` for pagination)
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create new item (multipart/form-data with image upload)

### Stats
- `GET /api/stats` - Get application statistics

## Key Features Implemented

1. **Error Handling**: Comprehensive error handling with proper HTTP status codes
2. **File Upload**: Secure image upload with validation and unique naming
3. **Data Validation**: Input validation using Zod schema
4. **CORS Configuration**: Proper CORS setup for development
5. **Search Functionality**: Real-time search across multiple fields
6. **Responsive UI**: Mobile-friendly design with Material-UI
7. **State Management**: Efficient state management using React Context

## Recent Improvements

- Fixed "Failed to fetch" error during item addition
- Improved error handling and user feedback
- Enhanced CORS configuration
- Added comprehensive input validation
- Translated all comments to English
- Optimized file upload handling

## Development

The project includes:
- Hot reloading for development
- Proper error logging
- Development-friendly CORS settings
- Comprehensive API documentation

## License

This project is part of a technical assessment for Bitgesell Finance.