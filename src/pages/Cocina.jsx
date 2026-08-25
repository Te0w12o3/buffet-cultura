import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Cocina() {
  const { orders, markAsReady } = useOrders();
  const navigate = useNavigate();

  const pendingOrders = orders.filter(o => o.status === 'preparacion');

  return (
    <div className="min-h-screen bg-[#1a1c1a] p-6 text-white font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cocina - Pedidos Activos</h1>
        <button onClick={() => navigate('/')} className="text-sm text-gray-400 underline">Volver</button>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-2xl text-gray-400 font-medium">No hay pedidos pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pendingOrders.map(order => (
            <div key={order.id} className="bg-[var(--color-surface)] text-[var(--color-on-surface)] rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-5xl font-bold">#{order.orderNumber}</h2>
                </div>
                <div className="h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  <ul className="space-y-3 text-lg">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-3 text-[var(--color-primary)] font-bold">•</span>
                        <span className="leading-tight">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <button
                onClick={() => markAsReady(order.id)}
                className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#064e3b] font-bold py-4 rounded-xl text-xl mt-4 transition-colors shadow-sm"
              >
                Marcar Listo
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
