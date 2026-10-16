import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function Cocina() {
  const { orders, markAsReady } = useOrders();
  const navigate = useNavigate();

  const pendingOrders = orders.filter(o => o.status === 'preparacion');

  const prevPendingLength = useRef(null);
  const [audioCtx, setAudioCtx] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioCtx(ctx);
    if (ctx.state === 'running') {
      setSoundEnabled(true);
    }
    return () => ctx.close();
  }, []);

  const playKitchenAlert = () => {
    if (!audioCtx) return;
    try {
      const playTone = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.7, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      // Secuencia de alerta brillante y enérgica para ambiente de cocina
      playTone(587.33, now, 0.22);        // D5
      playTone(739.99, now + 0.14, 0.22); // F#5
      playTone(880.00, now + 0.28, 0.55); // A5
    } catch (e) {
      console.error('Error al reproducir alarma de cocina:', e);
    }
  };

  const enableSound = async () => {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      setSoundEnabled(true);
      // Truco para desbloquear Web Audio en navegadores y tablets
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.value = 0;
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.001);

      // Reproducir sonido de prueba inmediatamente para confirmar activación
      setTimeout(() => {
        playKitchenAlert();
      }, 50);
    }
  };

  useEffect(() => {
    // Solo reproducir si no es la carga inicial y la cantidad de pedidos pendientes aumentó
    if (prevPendingLength.current !== null && pendingOrders.length > prevPendingLength.current && audioCtx && soundEnabled) {
      playKitchenAlert();
    }
    prevPendingLength.current = pendingOrders.length;
  }, [pendingOrders.length, audioCtx, soundEnabled]);

  const getKitchenItemInfo = (item) => {
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

    // Focaccia: x2 se traduce a 2 focaccias, x1 a 1 focaccia
    if (id === 24 || (/foc/i.test(name) && /2/.test(name))) {
      return { displayName: 'Focaccia', units: 2, isSpecial: true };
    }
    if (id === 12 || /foc/i.test(name)) {
      return { displayName: 'Focaccia', units: 1, isSpecial: true };
    }

    return {
      displayName: name,
      units: 1,
      isSpecial: false
    };
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-primary)] p-6 text-white font-sans greek-pattern-bg overflow-hidden">
      <div className="flex justify-between items-center mb-8 border-b-2 border-[var(--color-secondary)] pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white">Cocina del Banquete</h1>
          {!soundEnabled ? (
            <button 
              onClick={enableSound} 
              className="text-xs bg-amber-400 text-amber-950 hover:bg-amber-300 font-black px-3 py-1.5 uppercase tracking-wider transition-colors shadow-sm animate-pulse cursor-pointer flex items-center gap-1.5"
            >
              <span>🔔</span> Activar Alarma de Pedidos
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold px-3 py-1 uppercase tracking-wider flex items-center gap-1">
                <span>🔔</span> Alarma Activa
              </span>
              <button 
                onClick={playKitchenAlert}
                className="text-xs text-white/70 hover:text-white underline cursor-pointer"
                title="Probar alarma"
              >
                (Probar)
              </button>
            </div>
          )}
        </div>
        <button onClick={() => navigate('/')} className="text-sm text-[var(--color-secondary)] hover:text-white uppercase tracking-widest font-bold transition-colors">Volver</button>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-3xl text-white/50 font-serif italic">No hay banquetes pendientes</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-6 pb-6 overflow-x-auto custom-scrollbar snap-x">
          {pendingOrders.map(order => {
            const rawItems = order.items || [];
            const groupedItems = Object.values(rawItems.reduce((acc, rawItem) => {
              const { displayName, units, isSpecial } = getKitchenItemInfo(rawItem);
              const itemQty = typeof rawItem.quantity === 'number' && rawItem.quantity > 0 ? rawItem.quantity : 1;
              const unitsToAdd = itemQty * units;

              if (acc[displayName]) {
                acc[displayName].quantity += unitsToAdd;
              } else {
                acc[displayName] = {
                  ...rawItem,
                  name: displayName,
                  quantity: unitsToAdd,
                  isSpecial
                };
              }
              return acc;
            }, {}));

            const hasSpecial = groupedItems.some(i => i.isSpecial);

            return (
            <div key={order.id} className="snap-start shrink-0 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] bg-white text-[var(--color-primary)] rounded-none p-6 shadow-2xl flex flex-col border-4 border-[var(--color-secondary)] h-full overflow-hidden">
              <div className="flex justify-between items-center mb-4 border-b-2 border-[var(--color-primary)] pb-2 shrink-0 gap-2">
                <h2 className="text-5xl font-black">#{order.orderNumber}</h2>
                {hasSpecial && (
                  <span className="bg-[#f57c00] text-white text-[11px] font-black px-2 py-1 uppercase tracking-wider shadow-sm text-right leading-tight">
                    ★ Chipá / Focaccia
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
                <ul className="space-y-3 text-lg font-bold">
                  {groupedItems.map((item, idx) => {
                    return (
                      <li 
                        key={idx} 
                        className={`flex items-start p-2 rounded transition-colors ${
                          item.isSpecial 
                            ? 'bg-amber-100/80 border-l-4 border-[#f57c00] text-amber-950 font-black shadow-xs' 
                            : 'text-[var(--color-primary)]'
                        }`}
                      >
                        <span className={`mr-2.5 font-bold ${item.isSpecial ? 'text-[#f57c00]' : 'text-[var(--color-secondary)]'}`}>
                          {item.isSpecial ? '★' : '•'}
                        </span>
                        <span className="leading-tight flex-1">
                          <span className={`font-black mr-2 ${item.isSpecial ? 'text-white bg-[#f57c00] px-1.5 py-0.5 text-base' : 'text-red-600'}`}>
                            {item.quantity}
                          </span>
                          <span className={item.isSpecial ? 'text-amber-950 font-black' : ''}>
                            {item.name}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              <button
                onClick={() => markAsReady(order.id)}
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white hover:text-[var(--color-primary)] font-black py-4 rounded-none text-xl shrink-0 transition-colors uppercase tracking-widest border-2 border-[var(--color-primary)] hover:border-[var(--color-secondary)] cursor-pointer"
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
