export const MENU_ITEMS = [
  // Dulces
  { id: 6, name: 'Melomakarona', category: 'Dulces', price: 1000, initialStock: 25 },
  { id: 7, name: 'Bizcochuelo', category: 'Dulces', price: 2000, initialStock: 15 },
  { id: 8, name: 'Torta', category: 'Dulces', price: 2000, initialStock: 12 },
  { id: 9, name: 'Pasta Frola', category: 'Dulces', price: 2000, initialStock: 18 },
  { id: 17, name: 'Kourabiede', category: 'Dulces', price: 1000, initialStock: 20 },

  // Platos Principales
  { id: 18, name: 'Emp Carne', category: 'Platos Principales', price: 2500, initialStock: 108 },
  { id: 19, name: 'Emp J&Q', category: 'Platos Principales', price: 2500, initialStock: 36 },
  { id: 11, name: 'Chipa', category: 'Platos Principales', price: 1000, initialStock: 40 },
  { id: 12, name: 'Foccaccia', category: 'Platos Principales', price: 2500, initialStock: 20 },
  { id: 13, name: 'Pizzetas', category: 'Platos Principales', price: 2000, initialStock: 30 },
  { id: 1, name: 'PICADA GRIEGA', category: 'Platos Principales', price: 7000, initialStock: 50 },

  // Bebidas
  // Vino: stock compartido medido en vasos (36 botellas x 3 vasos); la botella descuenta 3 vasos.
  { id: 14, name: 'Vino Vaso', category: 'Bebidas', price: 3000, initialStock: 36 * 3 },
  { id: 22, name: 'Vino Botella', category: 'Bebidas', price: 8000, stockKey: 14, stockUnits: 3 },
  { id: 15, name: 'Cerveza', category: 'Bebidas', price: 3000, initialStock: 120 },
  { id: 20, name: 'Coca Cola', category: 'Bebidas', price: 2500, initialStock: 24 },
  { id: 21, name: 'Seven Up', category: 'Bebidas', price: 2500, initialStock: 24 },
  { id: 23, name: 'Café', category: 'Bebidas', price: 1000, initialStock: 100 },
];

export const stockKey = (item) => item.stockKey ?? item.id;
export const stockUnits = (item) => item.stockUnits ?? 1;

export const INITIAL_STOCK = MENU_ITEMS.reduce((acc, item) => {
  if (item.initialStock !== undefined) acc[item.id] = item.initialStock;
  return acc;
}, {});
