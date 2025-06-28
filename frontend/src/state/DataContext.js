import React, { createContext, useCallback, useContext, useState } from 'react';
import config from '../utils/config';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagesCache, setPagesCache] = useState({});
  const [totalItems, setTotalItems] = useState(0);

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
      
      const formData = new FormData();
      formData.append('name', itemData.name);
      formData.append('category', itemData.category);
      formData.append('price', itemData.price.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const res = await fetch(config.API_URL + '/api/items', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const newItem = await res.json();
      
      setAllItems(prev => [...prev, newItem]);
      setFilteredItems(prev => [...prev, newItem]);
      setTotalItems(prev => prev + 1);
      setPagesCache({});
      
      return newItem;
    } catch (error) {
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

  const fetchItemsPage = useCallback(async (page = 1, limit = 10, query = "") => {
    if (query && query.trim() !== "") {
      try {
        setIsLoading(true);
        setError(null);
        let url = `${config.API_URL}/api/items?q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.items || []);
        setFilteredItems(items);
        setTotalItems(items.length);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    const cacheKey = `${page}-${limit}-${query}`;
    if (pagesCache[cacheKey]) {
      setFilteredItems(pagesCache[cacheKey]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      let url = `${config.API_URL}/api/items?page=${page}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setFilteredItems(json.items);
      setTotalItems(json.total);
      setPagesCache(prev => ({ ...prev, [cacheKey]: json.items }));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [pagesCache]);

  const clearPagesCache = useCallback(() => {
    setPagesCache({});
  }, []);

  return (
    <DataContext.Provider value={{ 
      items: filteredItems,
      allItems,
      fetchItems, 
      addItem,
      searchItems,
      fetchItemsPage,
      isLoading, 
      error,
      totalItems,
      clearPagesCache
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

