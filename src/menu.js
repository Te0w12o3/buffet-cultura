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

export const extractFocacciaFlavors = (rawItem = {}) => {
  const name = String(rawItem.name || '');
  const id = rawItem.id;
  const isFoc = id === 12 || id === 24 || /foc/i.test(name);
  if (!isFoc) return null;

  // 1. Array u objeto directo focacciaFlavors
  if (rawItem.focacciaFlavors) {
    const list = Array.isArray(rawItem.focacciaFlavors)
      ? rawItem.focacciaFlavors
      : (typeof rawItem.focacciaFlavors === 'object' ? Object.values(rawItem.focacciaFlavors) : []);
    const extracted = list
      .map(f => (typeof f === 'object' && f !== null ? f.name : f))
      .filter(Boolean);
    if (extracted.length > 0) return extracted;
  }

  // 2. Propiedad flavorName
  if (rawItem.flavorName) {
    return [rawItem.flavorName];
  }

  // 3. Propiedad flavorSummary
  if (rawItem.flavorSummary) {
    const summary = String(rawItem.flavorSummary).trim();
    if (/^2\s+/i.test(summary)) {
      const flv = summary.replace(/^2\s+/i, '').trim();
      return [flv, flv];
    }
    if (summary.includes('+')) {
      return summary.split('+').map(s => s.trim()).filter(Boolean);
    }
    return [summary];
  }

  // 4. Paréntesis en el nombre del producto, ej: "Focaccia (Nerón)", "Focaccia x2 (Nerón + César)", "Focaccia x2 (2 Nerón)"
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const content = parenMatch[1].trim();
    if (/^2\s+/i.test(content)) {
      const flv = content.replace(/^2\s+/i, '').trim();
      return [flv, flv];
    }
    if (content.includes('+')) {
      return content.split('+').map(s => s.trim()).filter(Boolean);
    }
    const matched = FOCACCIA_FLAVORS.find(f => 
      f.name.toLowerCase() === content.toLowerCase() ||
      f.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    );
    if (matched) {
      return [matched.name];
    }
    if (content.length > 0) {
      return [content];
    }
  }

  // 5. Búsqueda de nombres de gustos conocidos en la cadena del nombre
  const found = [];
  FOCACCIA_FLAVORS.forEach(f => {
    const cleanFlv = f.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (cleanName.includes(cleanFlv)) {
      if (cleanName.includes('2 ' + cleanFlv) || cleanName.includes(cleanFlv + ' x2')) {
        found.push(f.name, f.name);
      } else {
        found.push(f.name);
      }
    }
  });
  if (found.length > 0) return found;

  // 6. Si no hay gusto especificado (ej. pedidos antiguos)
  const isX2 = id === 24 || (/foc/i.test(name) && /2/.test(name));
  return isX2 ? ['Clásica', 'Clásica'] : ['Clásica'];
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

  const itemsList = Array.isArray(rawItems) 
    ? rawItems 
    : (rawItems && typeof rawItems === 'object' ? Object.values(rawItems) : []);

  itemsList.forEach(rawItem => {
    if (!rawItem) return;

    // Si es Focaccia, extraemos los gustos específicos de forma garantizada
    const focacciaFlavors = extractFocacciaFlavors(rawItem);
    if (focacciaFlavors && focacciaFlavors.length > 0) {
      const itemQty = typeof rawItem.quantity === 'number' && rawItem.quantity > 0 ? rawItem.quantity : 1;
      
      for (let q = 0; q < itemQty; q++) {
        focacciaFlavors.forEach(flavor => {
          const displayName = `Focaccia (${flavor})`;
          if (result[displayName]) {
            result[displayName].quantity += 1;
          } else {
            result[displayName] = {
              id: rawItem.id,
              name: displayName,
              shortName: 'Focaccia',
              flavor: flavor,
              isFocaccia: true,
              quantity: 1,
              isSpecial: true,
            };
          }
        });
      }
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


