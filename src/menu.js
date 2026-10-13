export const MENU_ITEMS = [
  // Dulces
  { id: 6, name: 'Melomakarona', category: 'Dulces', price: 2500, initialStock: 25 },
  { id: 7, name: 'Bizcochuelo', category: 'Dulces', price: 2000, initialStock: 15 },
  { id: 8, name: 'Torta', category: 'Dulces', price: 3000, initialStock: 12 },
  { id: 9, name: 'Pasta Frola', category: 'Dulces', price: 2500, initialStock: 18 },

  // Platos Principales
  { id: 10, name: 'Empanadas', category: 'Platos Principales', price: 1500, initialStock: 50 },
  { id: 11, name: 'Chipa', category: 'Platos Principales', price: 1000, initialStock: 40 },
  { id: 12, name: 'Foccaccia', category: 'Platos Principales', price: 2500, initialStock: 20 },
  { id: 13, name: 'Pizzetas', category: 'Platos Principales', price: 2000, initialStock: 30 },
  { id: 1, name: 'PICADA GRIEGA', category: 'Platos Principales', price: 14000, initialStock: 10 },

  // Bebidas
  { id: 14, name: 'Vino', category: 'Bebidas', price: 3500, initialStock: 24 },
  { id: 15, name: 'Cerveza', category: 'Bebidas', price: 2500, initialStock: 36 },
  { id: 16, name: 'Gaseosa', category: 'Bebidas', price: 1500, initialStock: 48 },
];

export const INITIAL_STOCK = MENU_ITEMS.reduce((acc, item) => {
  acc[item.id] = item.initialStock;
  return acc;
}, {});

