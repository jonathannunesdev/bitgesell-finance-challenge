import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box
} from '@mui/material';
import { Inventory } from '@mui/icons-material';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#273746',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h6: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Inventory sx={{ mr: 1 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link 
                  to="/" 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  Bitgesell Finance
                </Link>
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
            <Routes>
              <Route path="/" element={<Items />} />
              <Route path="/items/:id" element={<ItemDetail />} />
            </Routes>
          </Container>
        </Box>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;