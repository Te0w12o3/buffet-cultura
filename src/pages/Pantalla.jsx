import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Pantalla() {
  const { orders, markAsDelivered } = useOrders();
  const navigate = useNavigate();

  const preparing = orders.filter(o => o.status === 'preparacion');
  const ready = orders.filter(o => o.status === 'listo');

  return (
    <div className="h-screen flex relative overflow-hidden bg-white font-sans">
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-xs text-gray-400 hover:text-gray-600 z-50">Volver al Menú</button>

      {/* Preparación Column */}
      <div className="flex-1 bg-[var(--color-surface-container-low)] p-12 flex flex-col border-r border-[var(--color-surface-dim)]">
        <h1 className="text-4xl font-bold text-[var(--color-secondary)] mb-12 text-center tracking-wide border-b border-[var(--color-surface-dim)] pb-6">
          EN PREPARACIÓN
        </h1>
        <div className="flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-8">
            {preparing.map(order => (
              <div key={order.id} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-[var(--color-surface-dim)]">
                <div className="text-6xl font-bold text-[var(--color-on-surface)] opacity-80 mb-2">#{order.orderNumber}</div>
                <div className="text-2xl text-[var(--color-on-surface-variant)] truncate">{order.customerName}</div>
              </div>
            ))}
            {preparing.length === 0 && (
               <div className="col-span-2 text-center text-xl text-gray-400 mt-10">Ningún pedido en preparación</div>
            )}
          </div>
        </div>
      </div>

      {/* Listos Column */}
      <div className="flex-1 bg-[#dcfce7] p-12 flex flex-col">
        <h1 className="text-4xl font-bold text-[#166534] mb-12 text-center tracking-wide border-b border-green-300 pb-6">
          LISTOS PARA RETIRAR
        </h1>
        <div className="flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-2 gap-8">
            {ready.map(order => (
              <div 
                key={order.id} 
                className="text-center p-8 bg-white rounded-2xl shadow-md border-4 border-[#4ade80] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => markAsDelivered(order.id)}
                title="Hacer clic para marcar como entregado"
              >
                <div className="text-8xl font-extrabold text-[#166534] mb-4">#{order.orderNumber}</div>
                <div className="text-3xl font-medium text-[#14532d] truncate">{order.customerName}</div>
              </div>
            ))}
            {ready.length === 0 && (
               <div className="col-span-2 text-center text-xl text-green-700 opacity-50 mt-10">Ningún pedido listo para retirar</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Branding */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium text-gray-400 opacity-50 pointer-events-none">
        Buffet Casa de la Cultura
      </div>
    </div>
  );
}
