export const MENU_ITEMS = [
  // Platos Dulces
  { id: 17, name: 'Kurabiedes', category: 'Dulces', price: 1000, initialStock: 20 },
  { id: 6, name: 'Melomakáruna', category: 'Dulces', price: 1000, initialStock: 25 },
  { id: 8, name: 'Torta', category: 'Dulces', price: 2000, initialStock: 12 },
  { id: 9, name: 'Pastafrola', category: 'Dulces', price: 2000, initialStock: 18 },

  // Platos Salados
  { id: 13, name: 'Pizetas', category: 'Platos Principales', price: 2000, initialStock: 30 },
  { id: 18, name: 'Emp Carne', category: 'Platos Principales', price: 2500, initialStock: 108 },
  { id: 19, name: 'Emp J&Q', category: 'Platos Principales', price: 2500, initialStock: 36 },
  { id: 1, name: 'Bandeja Griega', category: 'Platos Principales', price: 7000, initialStock: 50 },
  { id: 12, name: 'Focaccia x1', category: 'Platos Principales', price: 4000, initialStock: 20 },
  { id: 24, name: 'Focaccia x2', category: 'Platos Principales', price: 6000, stockKey: 12, stockUnits: 2 },
  { id: 11, name: 'Chipa x6', category: 'Platos Principales', price: 4000, initialStock: 40 },
  { id: 25, name: 'Chipa x12', category: 'Platos Principales', price: 7500, stockKey: 11, stockUnits: 2 },

  // Bebidas
  // Vino: stock compartido medido en vasos (32 botellas x 3 vasos); la botella descuenta 3 vasos.
  { id: 14, name: 'Vino Vaso', category: 'Bebidas', price: 3000, initialStock: 32 * 3 },
  { id: 22, name: 'Vino Botella', category: 'Bebidas', price: 8000, stockKey: 14, stockUnits: 3 },
  { id: 15, name: 'Cerveza', category: 'Bebidas', price: 3000, initialStock: 120 },
  { id: 20, name: 'Coca Cola', category: 'Bebidas', price: 2500, initialStock: 24 },
  { id: 21, name: 'Seven Up', category: 'Bebidas', price: 2500, initialStock: 24 },
  { id: 23, name: 'Café', category: 'Bebidas', price: 1000, initialStock: 100 },

  // Promociones Especiales (al final de todo)
  { id: 26, name: 'Promo 2 Bandejas Griegas', category: 'Promociones', price: 10000, stockKey: 1, stockUnits: 2, isPromo: true },
];

export const stockKey = (item) => item.stockKey ?? item.id;
export const stockUnits = (item) => item.stockUnits ?? 1;

export const INITIAL_STOCK = MENU_ITEMS.reduce((acc, item) => {
  if (item.initialStock !== undefined) acc[item.id] = item.initialStock;
  return acc;
}, {});
