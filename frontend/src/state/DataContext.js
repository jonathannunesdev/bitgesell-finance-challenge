import React, { createContext, useCallback, useContext, useState } from 'react';
import config from '../utils/config';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(config.API_URL + '/api/items');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      setAllItems(json);
      setFilteredItems(json);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = useCallback(async (itemData, imageFile = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create FormData to send data and image
      const formData = new FormData();
      formData.append('name', itemData.name);
      formData.append('category', itemData.category);
      formData.append('price', itemData.price.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const res = await fetch(config.API_URL + '/api/items', {
        method: 'POST',
        body: formData, // Don't set Content-Type, let the browser set it automatically
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const newItem = await res.json();
      
      // Update the items list with the new item
      setAllItems(prev => [...prev, newItem]);
      setFilteredItems(prev => [...prev, newItem]);
      
      return newItem;
    } catch (error) {
      // Only set error if it's a real network or server error
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('Network error: Unable to connect to server');
      } else {
        setError(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchItems = useCallback((query) => {
    if (!query.trim()) {
      setFilteredItems(allItems);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = allItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      (item.category && item.category.toLowerCase().includes(searchTerm))
    );
    setFilteredItems(filtered);
  }, [allItems]);

  return (
    <DataContext.Provider value={{ 
      items: filteredItems,
      allItems,
      fetchItems, 
      addItem,
      searchItems,
      isLoading, 
      error 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

