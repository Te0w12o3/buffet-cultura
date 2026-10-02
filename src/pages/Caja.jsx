import { useState } from 'react';
import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { id: 1, name: 'Empanada de Carne', category: 'Entradas', price: 1500 },
  { id: 2, name: 'Porción de Locro', category: 'Platos Principales', price: 4500 },
  { id: 3, name: 'Choripán', category: 'Platos Principales', price: 3000 },
  { id: 4, name: 'Gaseosa Cola', category: 'Bebidas', price: 1200 },
  { id: 5, name: 'Vino Tinto (Copa)', category: 'Bebidas', price: 2000 },
  { id: 6, name: 'Agua Mineral', category: 'Bebidas', price: 1000 },
  { id: 7, name: 'Flan con Dulce de Leche', category: 'Postres', price: 1800 },
];

export default function Caja() {
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const { addOrder, orders } = useOrders();
  const navigate = useNavigate();

  const handleAddItem = (item) => {
    setSelectedItems([...selectedItems, item]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || selectedItems.length === 0) return;

    const orderNumber = orders.length + 101;

    addOrder({
      customerName,
      items: selectedItems,
      orderNumber
    });

    setCustomerName('');
    setSelectedItems([]);
  };

  return (
    <div className="h-screen bg-[var(--color-background)] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Menu Section */}
      <div className="flex-1 p-6 md:border-r-4 border-[var(--color-secondary)] overflow-y-auto bg-white">
        <div className="flex justify-between items-center mb-8 border-b-2 border-[var(--color-surface-dim)] pb-4">
          <h2 className="text-3xl font-black text-[var(--color-primary)] uppercase tracking-widest">Menú del Banquete</h2>
          <button onClick={() => navigate('/')} className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] uppercase tracking-widest transition-colors">Volver</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="p-4 bg-[var(--color-background)] rounded-none border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all text-left flex flex-col justify-between min-h-[110px] group"
            >
              <span className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-2 group-hover:text-[var(--color-secondary-container)]">{item.category}</span>
              <span className="font-bold text-lg group-hover:text-white text-[var(--color-primary)]">{item.name}</span>
              <span className="font-bold text-md text-[var(--color-secondary)] mt-2">${item.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Order Section */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-[var(--color-primary)] p-6 shadow-2xl flex flex-col z-10 text-white greek-pattern-bg border-l-4 border-[var(--color-secondary)]">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest border-b-2 border-[var(--color-secondary)] pb-4">Pedido Actual</h2>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[var(--color-secondary)]">Nombre del Invitado</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-none border-2 border-[var(--color-secondary)] bg-white/10 text-white placeholder-white/50 focus:bg-white focus:text-[var(--color-primary)] focus:outline-none transition-colors font-bold text-lg"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Aquiles"
            />
          </div>

          <div className="flex-1 overflow-y-auto mb-6 bg-white/5 p-4 border-2 border-white/20 custom-scrollbar">
            {selectedItems.length === 0 ? (
              <p className="text-center text-white/50 mt-10 font-serif italic">Ningún manjar seleccionado</p>
            ) : (
              <ul className="space-y-3">
                {selectedItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white text-[var(--color-primary)] p-3 shadow-sm font-bold">
                    <span>{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span>${item.price}</span>
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-[#ba1a1a] text-2xl leading-none px-2 hover:bg-[#ffdad6] transition-colors">&times;</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="mb-6 flex justify-between items-center text-2xl font-black text-[var(--color-secondary)]">
              <span>TOTAL:</span>
              <span>${selectedItems.reduce((sum, item) => sum + item.price, 0)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!customerName || selectedItems.length === 0}
            className="w-full bg-[var(--color-secondary)] text-[var(--color-primary)] py-4 rounded-none font-black text-lg disabled:opacity-50 hover:bg-white transition-colors mt-auto uppercase tracking-widest border-2 border-[var(--color-secondary)]"
          >
            Enviar a Cocina
          </button>
        </form>
      </div>
    </div>
  );
}
