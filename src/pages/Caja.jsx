import { useState } from 'react';
import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { id: 1, name: 'Empanada de Carne', category: 'Entradas' },
  { id: 2, name: 'Porción de Locro', category: 'Platos Principales' },
  { id: 3, name: 'Choripán', category: 'Platos Principales' },
  { id: 4, name: 'Gaseosa Cola', category: 'Bebidas' },
  { id: 5, name: 'Vino Tinto (Copa)', category: 'Bebidas' },
  { id: 6, name: 'Agua Mineral', category: 'Bebidas' },
  { id: 7, name: 'Flan con Dulce de Leche', category: 'Postres' },
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

    const orderNumber = orders.length + 101; // Empezar desde #101

    addOrder({
      customerName,
      items: selectedItems,
      orderNumber
    });

    setCustomerName('');
    setSelectedItems([]);
  };

  return (
    <div className="h-screen bg-[var(--color-background)] flex flex-col md:flex-row overflow-hidden">
      {/* Menu Section */}
      <div className="flex-1 p-6 md:border-r border-[var(--color-surface-dim)] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">Menú</h2>
          <button onClick={() => navigate('/')} className="text-sm text-[var(--color-secondary)] underline">Volver</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="p-4 bg-white rounded-xl border border-[var(--color-surface-dim)] shadow-sm hover:border-[var(--color-primary)] hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[100px]"
            >
              <span className="text-xs font-semibold text-[var(--color-secondary)] uppercase tracking-wider mb-2">{item.category}</span>
              <span className="font-bold text-[var(--color-on-surface)]">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Order Section */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white p-6 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] flex flex-col z-10">
        <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6">Pedido Actual</h2>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Nombre del Cliente</label>
            <input
              type="text"
              required
              className="w-full p-3 rounded-xl border border-[var(--color-surface-dim)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:outline-none"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="flex-1 overflow-y-auto mb-6 bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-surface-dim)]">
            {selectedItems.length === 0 ? (
              <p className="text-center text-[var(--color-on-surface-variant)] mt-10">No hay productos seleccionados</p>
            ) : (
              <ul className="space-y-3">
                {selectedItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-[var(--color-surface-dim)]">
                    <span className="font-medium">{item.name}</span>
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="text-[#ba1a1a] text-2xl leading-none px-2 hover:bg-[#ffdad6] rounded-md transition-colors">&times;</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={!customerName || selectedItems.length === 0}
            className="w-full bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-colors mt-auto"
          >
            Enviar a Cocina
          </button>
        </form>
      </div>
    </div>
  );
}
