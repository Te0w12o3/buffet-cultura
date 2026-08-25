import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, update } from "firebase/database";

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

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase returns an object with keys, convert to array
        const ordersArray = Object.entries(data).map(([id, order]) => ({
          id,
          ...order
        }));
        // Sort by timestamp if needed, but array order usually fine
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addOrder = (orderData) => {
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    
    set(newOrderRef, {
      ...orderData,
      status: 'preparacion',
      createdAt: new Date().toISOString()
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

  return { orders, addOrder, markAsReady, markAsDelivered };
}
