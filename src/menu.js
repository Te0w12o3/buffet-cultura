export const MENU_ITEMS = [
  // Platos Dulces
  { id: 17, name: 'Kurabiedes', category: 'Dulces', price: 1000, initialStock: 42 },
  { id: 6, name: 'Melomakáruna', category: 'Dulces', price: 1000, initialStock: 60 },
  { id: 8, name: 'Torta', category: 'Dulces', price: 2000, initialStock: 20 },
  { id: 9, name: 'Pastafrola Membrillo', category: 'Dulces', price: 2000, initialStock: 15 },
  { id: 27, name: 'Pastafrola Batata', category: 'Dulces', price: 2000, initialStock: 15 },

  // Platos Salados
  { id: 13, name: 'Pizetas', category: 'Platos Principales', price: 2000, initialStock: 84 },
  { id: 18, name: 'Emp Carne', category: 'Platos Principales', price: 2500, initialStock: 108 },
  { id: 19, name: 'Emp J&Q', category: 'Platos Principales', price: 2500, initialStock: 36 },
  { id: 1, name: 'Bandeja Griega', category: 'Platos Principales', price: 7000, initialStock: 50 },
  { id: 12, name: 'Focaccia x1', category: 'Platos Principales', price: 4000, initialStock: 37 },
  { id: 24, name: 'Focaccia x2', category: 'Platos Principales', price: 6000, stockKey: 12, stockUnits: 2 },
  { id: 11, name: 'Chipa x6', category: 'Platos Principales', price: 4500, initialStock: 12 },
  { id: 25, name: 'Chipa x12', category: 'Platos Principales', price: 7500, stockKey: 11, stockUnits: 2 },

  // Bebidas
  // Vino: stock compartido medido en vasos (32 botellas x 3 vasos); la botella descuenta 3 vasos.
  { id: 14, name: 'Vino Vaso', category: 'Bebidas', price: 3000, initialStock: 32 * 3 },
  { id: 22, name: 'Vino Botella', category: 'Bebidas', price: 8000, stockKey: 14, stockUnits: 3 },
  { id: 15, name: 'Cerveza', category: 'Bebidas', price: 3000, initialStock: 120 },
  { id: 20, name: 'Coca Cola', category: 'Bebidas', price: 2500, initialStock: 110 },
  { id: 21, name: 'Seven Up', category: 'Bebidas', price: 2500, initialStock: 50 },
  { id: 23, name: 'Café', category: 'Bebidas', price: 1000, initialStock: 100 },

  // Promociones Especiales (al final de todo)
  { id: 26, name: 'Promo 2 Bandejas Griegas', category: 'Promociones', price: 10000, stockKey: 1, stockUnits: 2, isPromo: true },
];

export const FOCACCIA_FLAVORS = [
  { id: 'foc_neron', name: 'Nerón', initialStock: 9 },
  { id: 'foc_clasica', name: 'Clásica', initialStock: 10 },
  { id: 'foc_cesar', name: 'César', initialStock: 9 },
  { id: 'foc_agusto', name: 'Agusto', initialStock: 9 },
];

export const stockKey = (item) => item.stockKey ?? item.id;
export const stockUnits = (item) => item.stockUnits ?? 1;

export const INITIAL_STOCK = {
  ...MENU_ITEMS.reduce((acc, item) => {
    if (item.initialStock !== undefined) acc[item.id] = item.initialStock;
    return acc;
  }, {}),
  ...FOCACCIA_FLAVORS.reduce((acc, f) => {
    acc[f.id] = f.initialStock;
    return acc;
  }, {}),
};

export const getKitchenItemInfo = (item) => {
  const name = item.name || '';
  const id = item.id;
  
  // Chipá: 6u o 12u se traducen a la cantidad exacta de unidades individuales a hornear
  if (id === 25 || (/chip[aá]/i.test(name) && /12/.test(name))) {
    return { displayName: 'Chipá', units: 12, isSpecial: true };
  }
  if (id === 11 || (/chip[aá]/i.test(name) && /6/.test(name))) {
    return { displayName: 'Chipá', units: 6, isSpecial: true };
  }
  if (/chip[aá]/i.test(name)) {
    return { displayName: 'Chipá', units: 1, isSpecial: true };
  }

  // Focaccia sin gustos específicos (compatibilidad): x2 se traduce a 2 focaccias, x1 a 1 focaccia
  if (id === 24 || (/foc/i.test(name) && /2/.test(name))) {
    return { displayName: 'Focaccia', units: 2, isSpecial: true };
  }
  if (id === 12 || /foc/i.test(name)) {
    return { displayName: 'Focaccia', units: 1, isSpecial: true };
  }

  // Bandeja Griega: la promo de 2 bandejas se traduce a 2 Bandejas Griegas literales a preparar
  if (id === 26 || (/bandeja/i.test(name) && (/2/.test(name) || /promo/i.test(name)))) {
    return { displayName: 'Bandeja Griega', units: 2, isSpecial: false };
  }
  if (id === 1 || /bandeja/i.test(name)) {
    return { displayName: 'Bandeja Griega', units: 1, isSpecial: false };
  }

  return {
    displayName: name,
    units: 1,
    isSpecial: false
  };
};

export const groupOrderItems = (rawItems = []) => {
  const result = {};

  rawItems.forEach(rawItem => {
    // Si el item tiene gustos de focaccia seleccionados (focacciaFlavors)
    if (Array.isArray(rawItem.focacciaFlavors) && rawItem.focacciaFlavors.length > 0) {
      rawItem.focacciaFlavors.forEach(flavor => {
        const flavorName = typeof flavor === 'object' ? flavor.name : flavor;
        const displayName = `Focaccia ${flavorName}`;
        if (result[displayName]) {
          result[displayName].quantity += 1;
        } else {
          result[displayName] = {
            id: rawItem.id,
            name: displayName,
            quantity: 1,
            isSpecial: true,
          };
        }
      });
      return;
    }

    // Flujo normal para el resto de los productos o compatibilidad con pedidos antiguos
    const { displayName, units, isSpecial } = getKitchenItemInfo(rawItem);
    const itemQty = typeof rawItem.quantity === 'number' && rawItem.quantity > 0 ? rawItem.quantity : 1;
    const unitsToAdd = itemQty * units;

    if (result[displayName]) {
      result[displayName].quantity += unitsToAdd;
    } else {
      result[displayName] = {
        ...rawItem,
        name: displayName,
        quantity: unitsToAdd,
        isSpecial
      };
    }
  });

  return Object.values(result);
};


