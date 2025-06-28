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

---

## Frontend (React)

### Memory Leak
**Original:**
```js
useEffect(() => {
  fetchItems().catch(console.error);
  return () => { active = false; };
}, [fetchItems]);
```
- The original code could call setState after the component unmounted, causing memory leaks or React warnings.

**What I did:**
- Refactored data fetching to use hooks and state in a way that never updates state after unmount. This is now handled by React best practices and the use of async/await.

### Pagination & Search
**Original:**
- The list was not paginated and search was client-side only.

**What I did:**
- Implemented server-side pagination and search, with a clean UI for per-page selection and search.
- Search only triggers on user action (button or Enter), not on every keystroke, to avoid unnecessary requests.
- When searching, all results are shown; when not searching, pagination is active.

### UI/UX Polish
- Used Material-UI for a modern, accessible interface.
- Added loading indicators, error feedback, and a clear (X) button in the search input for better usability.
- The logo is clickable and returns to the home page.

### Code Quality
- Removed all unnecessary comments and kept only those that help understanding.
- All code is in English and follows idiomatic React/Node.js patterns.
- Error handling is robust both on the backend and frontend.

---

## Testing
- Unit tests for backend routes were provided and improved to match the new API responses and error messages.
- Tests use mocks for file operations to ensure they are fast and reliable.
- To run: `cd backend && npm test`

## Visual Enhancements
- For a more appealing and professional look, I used AI-generated images as illustrative product photos. This helps the UI feel more realistic and visually engaging, even in a demo or test environment.

---
