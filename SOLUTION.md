# SOLUTION.md

## Context

This project was provided with intentional bugs and suboptimal code to simulate real-world legacy/refactor scenarios. Below, I explain the main issues found, how I fixed them, and the reasoning behind each decision. My goal was always to keep the code clean, robust, and easy to maintain, while respecting the original intent of the challenge.

---

## Backend (Node.js)

### Blocking I/O and Data Handling
**Original:**
```js
const raw = fs.readFileSync(DATA_PATH);
```
- The backend used synchronous file operations (`fs.readFileSync` and `fs.writeFileSync`), which block the event loop and can make the server unresponsive under load.

**What I did:**
- Replaced all sync file operations with async/await using `fs.promises.readFile` and `fs.promises.writeFile`.
- This makes the server non-blocking and scalable, which is essential for any Node.js API.

### Validation and Data Integrity
**Original:**
```js
// TODO: Validate payload (intentional omission)
```
- There was no validation for POST requests, so any payload could be saved, risking data integrity.

**What I did:**
- Added validation using Zod, ensuring all required fields are present and valid before saving.
- This prevents bad data from entering the system and gives clear feedback to the user.

### Search and Filtering
**Original:**
```js
results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
```
- The search was a simple substring match only on the name field.

**What I did:**
- Improved search to also check category and price, making it more useful and user-friendly.
- Added server-side pagination and support for `q`, `page`, and `limit` params.

### Performance: /api/stats
**Original:**
- The `/api/stats` endpoint recalculated stats on every request, reading the file and processing all items each time.

**What I did:**
- Implemented in-memory caching for stats, recalculating only every 2 minutes. This reduces file reads and CPU usage, making the endpoint much more efficient.

### Enhanced Logging and Monitoring
**What I added:**
- Comprehensive request/response logging middleware with color-coded status codes
- Detailed error logging with stack traces
- Request timing information for performance monitoring
- Integration with all routes for better debugging and monitoring

### Build Process and Dependencies
**What I implemented:**
- Added comprehensive build scripts: clean, lint, test, and copy-files
- Removed unused dependencies (axios, request) to reduce bundle size
- Proper build pipeline that runs tests and prepares production-ready code
- Build process validates code quality before deployment

---

## Frontend (React)

### Memory Leak Prevention
**Original:**
```js
useEffect(() => {
  fetchItems().catch(console.error);
  return () => { active = false; };
}, [fetchItems]);
```
- The original code could call setState after the component unmounted, causing memory leaks or React warnings.

**What I did:**
- Refactored data fetching to use hooks and state in a way that never updates state after unmount.
- Implemented proper cleanup in useEffect hooks to prevent memory leaks.
- Used React best practices with async/await and proper state management.

### Pagination & Search
**Original:**
- The list was not paginated and search was client-side only.

**What I did:**
- Implemented server-side pagination and search, with a clean UI for per-page selection and search.
- Search only triggers on user action (button or Enter), not on every keystroke, to avoid unnecessary requests.
- When searching, all results are shown; when not searching, pagination is active.

### Virtualization for Performance
**What I implemented:**
- Added react-window for efficient rendering of large lists
- Virtualized list rendering to handle thousands of items without performance degradation
- Maintained smooth scrolling and responsive UI even with large datasets

### UI/UX Polish
- Used Material-UI for a modern, accessible interface.
- Added loading indicators, error feedback, and a clear (X) button in the search input for better usability.
- The logo is clickable and returns to the home page.
- Responsive design that works on desktop, tablet, and mobile devices.

### Code Quality and Cleanup
- Removed all unnecessary comments and kept only those that help understanding.
- Translated Portuguese comments to English for consistency.
- Removed unused imports and variables to reduce bundle size.
- All code is in English and follows idiomatic React/Node.js patterns.
- Error handling is robust both on the backend and frontend.

### Dependency Optimization
**What I cleaned up:**
- Removed unused dependencies (react-window-infinite-loader)
- Kept necessary dependencies for Material-UI and virtualization
- Optimized bundle size while maintaining functionality

---

## Testing
- Unit tests for backend routes were provided and improved to match the new API responses and error messages.
- Tests use mocks for file operations to ensure they are fast and reliable.
- All 16 tests pass successfully, covering core functionality.
- To run: `cd backend && npm test`

## Build and Deployment
- Backend build process includes linting, testing, and file copying
- Frontend build creates optimized production bundle
- Both builds are ready for deployment to production environments
- Build scripts ensure code quality before deployment

## Visual Enhancements
- For a more appealing and professional look, I used AI-generated images as illustrative product photos. This helps the UI feel more realistic and visually engaging, even in a demo or test environment.

---

## Final Verification

All specified objectives have been successfully implemented:

✅ **Backend Refactoring**: Converted to async I/O operations throughout
✅ **Caching**: Implemented in-memory caching for stats endpoint
✅ **Unit Tests**: 16 passing tests covering all core functionality
✅ **Memory Leak Fixes**: Proper cleanup in React components
✅ **Pagination & Search**: Server-side implementation with clean UI
✅ **Virtualization**: React-window for efficient large list rendering
✅ **UI/UX Polish**: Modern Material-UI interface with loading states
✅ **Idiomatic Code**: Clean, maintainable code following best practices
✅ **Error Handling**: Comprehensive error handling on both frontend and backend
✅ **Edge Cases**: Proper handling of invalid data, network errors, and edge scenarios
✅ **Passing Tests**: All tests pass successfully

The project is now production-ready with clean, maintainable code that follows modern development practices.

---
