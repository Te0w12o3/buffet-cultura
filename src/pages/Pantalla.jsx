import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Pantalla() {
  const { orders, markAsDelivered } = useOrders();
  const navigate = useNavigate();

  const preparing = orders.filter(o => o.status === 'preparacion');
  const ready = orders.filter(o => o.status === 'listo');
  
  const prevReadyLength = useRef(ready.length);

  useEffect(() => {
    if (ready.length > prevReadyLength.current) {
      // Reproducir sonido de aviso tipo consultorio (ding-dong)
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playNote = (freq, startTime, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        const now = ctx.currentTime;
        playNote(659.25, now, 0.6); // E5
        playNote(523.25, now + 0.5, 0.8); // C5
      } catch (e) {
        console.error('No se pudo reproducir el sonido', e);
      }
    }
    prevReadyLength.current = ready.length;
  }, [ready.length]);

  return (
    <div className="h-screen flex relative overflow-hidden bg-[var(--color-background)] font-sans selection:bg-[var(--color-secondary)] selection:text-white">
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-xs text-white/50 hover:text-white z-50 transition-colors uppercase tracking-widest font-bold">Volver</button>

      {/* Preparación Column (Aegean Blue) */}
      <div className="flex-1 bg-[var(--color-primary)] p-12 flex flex-col border-r-8 border-[var(--color-secondary)] greek-pattern-bg">
        <div className="text-center mb-12 h-24 flex items-end justify-center">
          <h1 className="inline-block text-4xl md:text-5xl font-black text-white tracking-[0.2em] border-b-2 border-[var(--color-secondary)] pb-4 uppercase">
            En Preparación
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-8">
            {preparing.map(order => (
              <div key={order.id} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-none border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
                <div className="text-5xl font-bold text-white mb-3 tracking-wider">#{order.orderNumber}</div>
                <div className="text-xl text-[var(--color-secondary)] truncate font-semibold uppercase">{order.customerName}</div>
              </div>
            ))}
            {preparing.length === 0 && (
               <div className="col-span-2 text-center text-xl text-white/50 mt-10 font-serif italic">El ágora está tranquila...</div>
            )}
          </div>
        </div>
      </div>

      {/* Listos Column (White & Gold) */}
      <div className="flex-1 bg-[var(--color-surface)] p-12 flex flex-col relative overflow-hidden">
        {/* Subtle decorative corners */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-[var(--color-secondary)] m-4 opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-[var(--color-secondary)] m-4 opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-[var(--color-secondary)] m-4 opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-[var(--color-secondary)] m-4 opacity-20 pointer-events-none"></div>

        <div className="text-center mb-12 relative z-10 h-24 flex items-end justify-center">
          <h1 className="inline-block text-4xl md:text-5xl font-black text-[var(--color-primary)] tracking-[0.2em] border-b-2 border-[var(--color-secondary)] pb-4 uppercase">
            Listos Para Retirar
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
          <div className="grid grid-cols-2 gap-8">
            {ready.map(order => (
              <div 
                key={order.id} 
                className="text-center p-8 bg-[var(--color-surface)] shadow-2xl meander-border cursor-pointer hover:scale-[1.02] hover:bg-[var(--color-surface-container)] transition-all"
                onClick={() => markAsDelivered(order.id)}
                title="Hacer clic para marcar como entregado"
              >
                <div className="text-7xl font-extrabold text-[var(--color-primary)] mb-4">#{order.orderNumber}</div>
                <div className="text-2xl font-bold text-[var(--color-secondary)] truncate uppercase tracking-widest">{order.customerName}</div>
              </div>
            ))}
            {ready.length === 0 && (
               <div className="col-span-2 text-center text-xl text-[var(--color-primary)] opacity-50 mt-10 font-serif italic">Ningún banquete listo aún</div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
