import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Cocina() {
  const { orders, markAsReady } = useOrders();
  const navigate = useNavigate();

  const pendingOrders = orders.filter(o => o.status === 'preparacion');

  return (
    <div className="h-screen flex flex-col bg-[var(--color-primary)] p-6 text-white font-sans greek-pattern-bg overflow-hidden">
      <div className="flex justify-between items-center mb-8 border-b-2 border-[var(--color-secondary)] pb-4">
        <h1 className="text-3xl font-black uppercase tracking-widest text-white">Cocina del Banquete</h1>
        <button onClick={() => navigate('/')} className="text-sm text-[var(--color-secondary)] hover:text-white uppercase tracking-widest font-bold transition-colors">Volver</button>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-3xl text-white/50 font-serif italic">No hay banquetes pendientes</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-6 pb-6 overflow-x-auto custom-scrollbar snap-x">
          {pendingOrders.map(order => {
            const groupedItems = Object.values(order.items.reduce((acc, item) => {
              if (acc[item.name]) {
                acc[item.name].quantity += 1;
              } else {
                acc[item.name] = { ...item, quantity: 1 };
              }
              return acc;
            }, {}));

            return (
            <div key={order.id} className="snap-start shrink-0 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] bg-white text-[var(--color-primary)] rounded-none p-6 shadow-2xl flex flex-col border-4 border-[var(--color-secondary)] h-full overflow-hidden">
              <div className="flex justify-between items-start mb-4 border-b-2 border-[var(--color-primary)] pb-2 shrink-0">
                <h2 className="text-5xl font-black">#{order.orderNumber}</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
                <ul className="space-y-3 text-lg font-bold">
                  {groupedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-3 text-[var(--color-secondary)] font-bold">•</span>
                      <span className="leading-tight">{item.quantity}x {item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => markAsReady(order.id)}
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white hover:text-[var(--color-primary)] font-black py-4 rounded-none text-xl shrink-0 transition-colors uppercase tracking-widest border-2 border-[var(--color-primary)] hover:border-[var(--color-secondary)]"
              >
                Marcar Listo
              </button>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
