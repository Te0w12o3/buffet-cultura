import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, update } from "firebase/database";
import { INITIAL_STOCK, MENU_ITEMS, stockKey, stockUnits } from './menu';

const firebaseConfig = {
  apiKey: "AIzaSyC_71Nilx99APcPBLDiDBxhvqEdv4okBcE",
  authDomain: "buffet-cultura.firebaseapp.com",
  databaseURL: "https://buffet-cultura-default-rtdb.firebaseio.com",
  projectId: "buffet-cultura",
  storageBucket: "buffet-cultura.firebasestorage.app",
  messagingSenderId: "114139875375",
  appId: "1:114139875375:web:9663e7d6953f6dd9d19eda"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [nextOrderNumber, setNextOrderNumber] = useState(1);

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.entries(data).map(([id, order]) => {
          let items = [];
          if (Array.isArray(order.items)) {
            items = order.items;
          } else if (order.items && typeof order.items === 'object') {
            items = Object.values(order.items);
          }
          const normalizedItems = items.map(item => {
            if (!item) return item;
            let focacciaFlavors = item.focacciaFlavors;
            if (focacciaFlavors && !Array.isArray(focacciaFlavors) && typeof focacciaFlavors === 'object') {
              focacciaFlavors = Object.values(focacciaFlavors);
            }
            return {
              ...item,
              focacciaFlavors
            };
          });

          return {
            id,
            ...order,
            items: normalizedItems
          };
        });
        // Sort by timestamp if needed, but array order usually fine
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
    }, (error) => {
      console.error("Firebase Read Error:", error);
    });

    const counterRef = ref(db, 'orderConfig/nextOrderNumber');
    const unsubscribeCounter = onValue(counterRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null && val !== undefined) {
        setNextOrderNumber(Number(val) || 1);
      } else {
        setNextOrderNumber(1);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeCounter();
    };
  }, []);

  const addOrder = (orderData) => {
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    const orderNum = orderData.orderNumber ?? nextOrderNumber;
    
    set(newOrderRef, {
      ...orderData,
      orderNumber: orderNum,
      status: 'preparacion',
      createdAt: new Date().toISOString()
    }).catch(error => {
      console.error("Firebase Write Error:", error);
      alert("Error al guardar en base de datos. Revisa la consola o los permisos de Firebase.");
    });

    const counterRef = ref(db, 'orderConfig/nextOrderNumber');
    set(counterRef, orderNum + 1).catch(err => {
      console.error("Firebase Update Counter Error:", err);
    });
  };

  const markAsReady = (id) => {
    const orderRef = ref(db, `orders/${id}`);
    update(orderRef, { status: 'listo' });
  };
  
  const markAsDelivered = (id) => {
    const orderRef = ref(db, `orders/${id}`);
    update(orderRef, { status: 'entregado' });
  };

  const resetOrdersAndCounter = (newStart = 1) => {
    const counterRef = ref(db, 'orderConfig/nextOrderNumber');
    set(counterRef, Number(newStart) || 1).catch(err => console.error("Firebase Reset Counter Error:", err));
  };

  const setStartingNumber = (num) => {
    const counterRef = ref(db, 'orderConfig/nextOrderNumber');
    set(counterRef, Number(num) || 1).catch(err => console.error("Firebase Set Start Number Error:", err));
  };

  return { 
    orders, 
    addOrder, 
    markAsReady, 
    markAsDelivered, 
    resetOrdersAndCounter, 
    setStartingNumber, 
    nextOrderNumber,
    startNumber: nextOrderNumber
  };
}

export function useMenuItems() {
  const [customItems, setCustomItems] = useState([]);

  useEffect(() => {
    const customRef = ref(db, 'customMenuItems');
    const unsubscribe = onValue(customRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]) => ({
          ...val,
          id: val.id || key
        }));
        setCustomItems(list);
      } else {
        setCustomItems([]);
      }
    }, (error) => {
      console.error("Firebase Custom Menu Items Read Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const addMenuItem = ({ name, price, stock: itemStock, category = 'Platos Principales' }) => {
    const newId = 'custom_' + Date.now();
    const newItem = {
      id: newId,
      name: name.trim(),
      price: Number(price) || 0,
      category: category || 'Platos Principales',
      initialStock: Number(itemStock) || 0,
      isCustom: true
    };

    set(ref(db, `customMenuItems/${newId}`), newItem).catch(err => {
      console.error("Firebase Add Custom Item Error:", err);
    });

    set(ref(db, `stock/${newId}`), Number(itemStock) || 0).catch(err => {
      console.error("Firebase Set Custom Stock Error:", err);
    });

    return newItem;
  };

  const removeMenuItem = (id) => {
    set(ref(db, `customMenuItems/${id}`), null).catch(err => {
      console.error("Firebase Remove Custom Item Error:", err);
    });
    set(ref(db, `stock/${id}`), null).catch(err => {
      console.error("Firebase Remove Stock Error:", err);
    });
  };

  const menuItems = [...MENU_ITEMS, ...customItems];

  return { menuItems, customItems, addMenuItem, removeMenuItem };
}

export function useStock() {
  const [stock, setStock] = useState(INITIAL_STOCK);

  useEffect(() => {
    const stockRef = ref(db, 'stock');

    const unsubscribe = onValue(stockRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStock({ ...INITIAL_STOCK, ...data });
      } else {
        // Inicializar stock en Firebase si no existe
        set(stockRef, INITIAL_STOCK).catch(err => {
          console.warn("No se pudo inicializar stock en Firebase:", err);
        });
        setStock(INITIAL_STOCK);
      }
    }, (error) => {
      console.error("Firebase Stock Read Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const reduceStock = (items) => {
    const counts = {};
    const itemsList = Array.isArray(items) 
      ? items 
      : (items && typeof items === 'object' ? Object.values(items) : []);

    itemsList.forEach(item => {
      if (!item) return;
      const rawFlavors = item.focacciaFlavors;
      const flavorsList = Array.isArray(rawFlavors) 
        ? rawFlavors 
        : (rawFlavors && typeof rawFlavors === 'object' ? Object.values(rawFlavors) : []);

      if (flavorsList.length > 0) {
        flavorsList.forEach(flavor => {
          const flavorId = typeof flavor === 'object' && flavor ? flavor.id : flavor;
          if (flavorId) {
            counts[flavorId] = (counts[flavorId] || 0) + 1;
          }
          counts[12] = (counts[12] || 0) + 1;
        });
      } else {
        const key = stockKey(item);
        counts[key] = (counts[key] || 0) + stockUnits(item);
      }
    });

    const stockRef = ref(db, 'stock');
    setStock(prev => {
      const updated = { ...prev };
      const updates = {};
      Object.entries(counts).forEach(([id, qty]) => {
        const current = updated[id] ?? INITIAL_STOCK[id] ?? 0;
        const newQty = Math.max(0, current - qty);
        updated[id] = newQty;
        updates[id] = newQty;
      });

      update(stockRef, updates).catch(err => {
        console.error("Firebase Stock Update Error:", err);
      });

      return updated;
    });
  };

  const updateItemStock = (id, newQty) => {
    const parsed = Math.max(0, parseInt(newQty, 10) || 0);
    const itemRef = ref(db, `stock/${id}`);
    setStock(prev => ({ ...prev, [id]: parsed }));
    set(itemRef, parsed).catch(err => {
      console.error("Firebase Stock Update Item Error:", err);
    });
  };

  const resetStock = (currentCustomItems = []) => {
    const stockRef = ref(db, 'stock');
    const resetValues = { ...INITIAL_STOCK };
    if (Array.isArray(currentCustomItems)) {
      currentCustomItems.forEach(item => {
        if (item.id && item.initialStock !== undefined) {
          resetValues[item.id] = item.initialStock;
        }
      });
    }
    setStock(resetValues);
    set(stockRef, resetValues).catch(err => {
      console.error("Firebase Reset Stock Error:", err);
    });
  };

  return { stock, reduceStock, updateItemStock, resetStock };
}
