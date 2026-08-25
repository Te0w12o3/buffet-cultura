import { useState, useEffect } from 'react';

// Simulate Firebase with localStorage to allow cross-tab syncing for development
const STORAGE_KEY = 'buffet_orders';

export function getOrders() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  // Dispatch custom event for the same tab
  window.dispatchEvent(new Event('local-storage-update'));
}

export function useOrders() {
  const [orders, setOrders] = useState(getOrders());

  useEffect(() => {
    const handleStorageChange = () => {
      setOrders(getOrders());
    };

    // Listen to changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    // Listen to changes from the same tab
    window.addEventListener('local-storage-update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-update', handleStorageChange);
    };
  }, []);

  const addOrder = (order) => {
    const current = getOrders();
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      status: 'preparacion', // 'preparacion' | 'listo'
      createdAt: new Date().toISOString()
    };
    saveOrders([...current, newOrder]);
  };

  const markAsReady = (id) => {
    const current = getOrders();
    const updated = current.map(o => o.id === id ? { ...o, status: 'listo' } : o);
    saveOrders(updated);
  };
  
  const markAsDelivered = (id) => {
    const current = getOrders();
    const updated = current.map(o => o.id === id ? { ...o, status: 'entregado' } : o);
    saveOrders(updated);
  };

  return { orders, addOrder, markAsReady, markAsDelivered };
}
