import { useState } from 'react';
import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';
import { groupOrderItems } from '../menu';

export default function Entrega() {
  const { orders, markAsDelivered } = useOrders();
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [lastDeliveredNumber, setLastDeliveredNumber] = useState(null);

  // Solo pedidos que la cocina marcó como listos
  const readyOrders = orders.filter(o => o.status === 'listo');

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setCheckedItems({});
  };

  const handleToggleCheck = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleConfirmDelivery = (orderId, orderNum) => {
    markAsDelivered(orderId);
    setSelectedOrder(null);
    setCheckedItems({});
    setLastDeliveredNumber(orderNum);
    setTimeout(() => {
      setLastDeliveredNumber(prev => (prev === orderNum ? null : prev));
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-white font-sans greek-pattern-bg flex flex-col p-4 md:p-6 select-none">
      {/* Notificación de último pedido entregado */}
      {lastDeliveredNumber && (
        <div className="mb-3 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 px-4 py-2 flex items-center justify-between text-xs font-bold shadow-md animate-fade-in">
          <span>✅ Pedido <strong>#{lastDeliveredNumber}</strong> entregado correctamente.</span>
          <button onClick={() => setLastDeliveredNumber(null)} className="text-white/70 hover:text-white text-base leading-none cursor-pointer">&times;</button>
        </div>
      )}

      {/* Contador y Estado */}
      <div className="flex justify-between items-center mb-4 bg-white/10 p-3 rounded border border-white/20">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/')} 
            className="text-white/50 hover:text-white text-sm font-bold cursor-pointer pr-1"
            title="Volver"
          >
            ←
          </button>
          <span className="text-xs uppercase tracking-wider text-white/80 font-bold">Banquete(s) listos:</span>
        </div>
        <span className={`text-xs font-black px-2.5 py-1 uppercase tracking-wider ${
          readyOrders.length > 0 
            ? 'bg-emerald-500 text-white animate-pulse' 
            : 'bg-white/20 text-white/60'
        }`}>
          {readyOrders.length} {readyOrders.length === 1 ? 'Pedido' : 'Pedidos'}
        </span>
      </div>

      {/* Lista de Pedidos Listos */}
      {readyOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 my-auto">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-secondary)] mb-2">No hay pedidos listos</h2>
          <p className="text-sm text-white/60 max-w-xs font-serif italic">
            Apenas la cocina termine de preparar un banquete, aparecerá aquí en tiempo real para que lo revises y entregues.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pb-6">
          <p className="text-xs text-white/70 uppercase tracking-widest font-bold mb-1">
            Tocá un pedido para revisar y entregar:
          </p>

          {readyOrders.map(order => {
            const grouped = groupOrderItems(order.items);
            const hasSpecial = grouped.some(i => i.isSpecial);
            const totalUnits = grouped.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={order.id}
                onClick={() => handleOpenOrder(order)}
                className="bg-white text-[var(--color-primary)] p-4 shadow-xl border-l-8 border-[var(--color-secondary)] flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-4xl md:text-5xl font-black text-[var(--color-primary)] shrink-0">
                    #{order.orderNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-lg text-[var(--color-primary)] truncate uppercase leading-tight">
                      {order.customerName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 font-bold">
                        {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'} ({grouped.length} {grouped.length === 1 ? 'ítem' : 'ítems'})
                      </span>
                      {hasSpecial && (
                        <span className="bg-[#f57c00] text-white text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wider">
                          ★ Chipá / Focaccia
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center text-xs font-black text-[var(--color-secondary)] bg-[var(--color-primary)] px-3 py-2 uppercase tracking-wider gap-1">
                  <span>Revisar</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Tarjeta Emergente de Detalle de Pedido */}
      {selectedOrder && (() => {
        const grouped = groupOrderItems(selectedOrder.items);
        const hasSpecial = grouped.some(i => i.isSpecial);
        const totalItemsCount = grouped.length;
        const checkedCount = Object.values(checkedItems).filter(Boolean).length;
        const allChecked = totalItemsCount > 0 && checkedCount === totalItemsCount;

        return (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white text-[var(--color-primary)] w-full sm:max-w-md max-h-[92vh] flex flex-col border-t-4 sm:border-4 border-[var(--color-secondary)] shadow-2xl animate-slide-up">
              
              {/* Header del Modal */}
              <div className="p-4 bg-[var(--color-primary)] text-white flex justify-between items-start border-b-2 border-[var(--color-secondary)]">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-black text-white">#{selectedOrder.orderNumber}</h2>
                    {hasSpecial && (
                      <span className="bg-[#f57c00] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                        ★ Chipá / Focaccia
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-wider mt-1 truncate">
                    Cliente: {selectedOrder.customerName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-white hover:text-[#ffdad6] text-3xl font-light leading-none p-1 cursor-pointer"
                  title="Cerrar sin entregar"
                >
                  &times;
                </button>
              </div>

              {/* Instrucción y Checklist */}
              <div className="px-4 py-2.5 bg-gray-100 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-700">
                <span>Verificá el contenido del pedido:</span>
                <span className="text-[11px] text-gray-500">
                  {checkedCount}/{totalItemsCount} verificados
                </span>
              </div>

              {/* Lista de Productos con Unidades Literales */}
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2.5">
                {grouped.map((item, idx) => {
                  const isChecked = Boolean(checkedItems[idx]);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleCheck(idx)}
                      className={`p-3 border-2 transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-emerald-50 border-emerald-300 opacity-75' 
                          : item.isSpecial
                            ? 'bg-amber-50/80 border-[#f57c00]'
                            : 'bg-white border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox visual táctil */}
                        <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm shrink-0 border-2 ${
                          isChecked 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked ? '✓' : ''}
                        </div>

                        {/* Cantidad literal destacada */}
                        <span className={`text-base font-black px-2 py-0.5 shrink-0 ${
                          item.isSpecial 
                            ? 'bg-[#f57c00] text-white' 
                            : 'bg-[var(--color-primary)] text-white'
                        }`}>
                          {item.quantity}
                        </span>

                        {/* Nombre del producto */}
                        <span className={`text-base font-bold truncate ${
                          isChecked 
                            ? 'line-through text-gray-500' 
                            : item.isSpecial 
                              ? 'text-amber-950 font-black' 
                              : 'text-[var(--color-primary)]'
                        }`}>
                          {item.name}
                        </span>
                      </div>

                      {item.isSpecial && (
                        <span className="text-[#f57c00] font-black text-sm shrink-0">★</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón de Confirmación de Entrega */}
              <div className="p-4 bg-gray-50 border-t-2 border-gray-200 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmDelivery(selectedOrder.id, selectedOrder.orderNumber)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-4 text-lg md:text-xl uppercase tracking-widest shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>ENTREGAR PEDIDO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Volver sin entregar
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}

