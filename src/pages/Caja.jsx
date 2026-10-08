import { useState, useRef } from 'react';
import { useOrders } from '../store';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const MENU_ITEMS = [
  // Picada Griega
  { id: 1, name: 'Skordalia', category: 'Picada Griega', price: 3500 },
  { id: 2, name: 'Tzatziki', category: 'Picada Griega', price: 3500 },
  { id: 3, name: 'Hummus', category: 'Picada Griega', price: 3500 },
  { id: 4, name: 'Pan Pita', category: 'Picada Griega', price: 1500 },
  { id: 5, name: 'Aceitunas', category: 'Picada Griega', price: 2000 },
  
  // Dulces
  { id: 6, name: 'Melomakarona', category: 'Dulces', price: 2500 },
  { id: 7, name: 'Bizcochuelo', category: 'Dulces', price: 2000 },
  { id: 8, name: 'Torta', category: 'Dulces', price: 3000 },
  { id: 9, name: 'Pasta Frola', category: 'Dulces', price: 2500 },

  // Platos Principales
  { id: 10, name: 'Empanadas', category: 'Platos Principales', price: 1500 },
  { id: 11, name: 'Chipa', category: 'Platos Principales', price: 1000 },
  { id: 12, name: 'Foccaccia', category: 'Platos Principales', price: 2500 },
  { id: 13, name: 'Pizzetas', category: 'Platos Principales', price: 2000 },

  // Bebidas
  { id: 14, name: 'Vino', category: 'Bebidas', price: 3500 },
  { id: 15, name: 'Cerveza', category: 'Bebidas', price: 2500 },
  { id: 16, name: 'Gaseosa', category: 'Bebidas', price: 1500 },
];

export default function Caja() {
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [receiptImage, setReceiptImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const fileInputRef = useRef(null);
  const { addOrder, orders } = useOrders();
  const navigate = useNavigate();

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setReceiptImage(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadExcel = (tipo) => {
    const today = new Date().toLocaleDateString();
    
    const filteredOrders = tipo === 'dia' 
      ? orders.filter(o => {
          if (!o.createdAt) return false;
          return new Date(o.createdAt).toLocaleDateString() === today;
        })
      : orders;

    const dataToExport = filteredOrders.map(order => {
        const items = order.items?.map(i => i.name).join(' + ') || '';
        const total = order.items?.reduce((sum, item) => sum + item.price, 0) || 0;
        const hasReceipt = order.receiptImage ? 'Sí (Comprobante Adjunto)' : 'No';
        
        return {
          "Nombre del Cliente": order.customerName,
          "Pedido (#)": order.orderNumber,
          "Detalle de Compra": items,
          "Método de Pago": order.paymentMethod || 'Efectivo',
          "Total Pagado": total,
          "Comprobante MercadoPago": hasReceipt,
          "Fecha": order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
    
    const fileName = tipo === 'dia' ? `Ventas_del_Dia_${today.replace(/\//g, '-')}.xlsx` : `Ventas_Totales.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

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
      orderNumber,
      paymentMethod: receiptImage ? 'transferencia' : 'efectivo',
      receiptImage: receiptImage || null
    });

    setCustomerName('');
    setSelectedItems([]);
    setReceiptImage(null);
  };

  return (
    <div className="h-[100dvh] bg-[var(--color-background)] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Menu Section */}
      <div className="flex-1 p-6 md:border-r-4 border-[var(--color-secondary)] overflow-y-auto bg-white">
        <div className="flex justify-between items-center mb-8 border-b-2 border-[var(--color-surface-dim)] pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[var(--color-primary)] hover:bg-gray-100 transition-colors focus:outline-none">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-3xl font-black text-[var(--color-primary)] uppercase tracking-widest">Menú del Banquete</h2>
          </div>
          <button onClick={() => navigate('/')} className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-secondary)] uppercase tracking-widest transition-colors">Volver</button>
        </div>
        
        <div className="flex flex-col gap-8">
          {[...new Set(MENU_ITEMS.map(item => item.category))].map(category => (
            <div key={category}>
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4 border-b-2 border-[var(--color-surface-dim)] pb-2 uppercase tracking-widest">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {MENU_ITEMS.filter(item => item.category === category).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="p-4 bg-[var(--color-background)] rounded-none border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all text-left flex flex-col justify-between min-h-[110px] group"
                  >
                    <span className="font-bold text-lg group-hover:text-white text-[var(--color-primary)]">{item.name}</span>
                    <span className="font-bold text-md text-[var(--color-secondary)] mt-2">${item.price}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Order Section */}
      <div className="w-full md:w-[350px] lg:w-[450px] bg-[var(--color-primary)] p-4 md:p-6 shadow-2xl flex flex-col z-10 text-white greek-pattern-bg border-t-4 md:border-t-0 md:border-l-4 border-[var(--color-secondary)]">
        <h2 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-widest border-b-2 border-[var(--color-secondary)] pb-2 md:pb-4 shrink-0">Pedido Actual</h2>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="mb-4 shrink-0">
            <label className="block text-xs md:text-sm font-bold mb-1 md:mb-2 uppercase tracking-wider text-[var(--color-secondary)]">Nombre del Invitado</label>
            <input
              type="text"
              required
              className="w-full p-2 md:p-4 rounded-none border-2 border-[var(--color-secondary)] bg-white/10 text-white placeholder-white/50 focus:bg-white focus:text-[var(--color-primary)] focus:outline-none transition-colors font-bold text-base md:text-lg"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Aquiles"
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 mb-4 bg-white/5 p-2 md:p-4 border-2 border-white/20 custom-scrollbar">
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
            <div className="mb-2 shrink-0 flex justify-between items-center text-xl md:text-2xl font-black text-[var(--color-secondary)]">
              <span>TOTAL:</span>
              <span>${selectedItems.reduce((sum, item) => sum + item.price, 0)}</span>
            </div>
          )}

          <div className="mb-4 shrink-0">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageCapture}
            />
            {receiptImage ? (
              <div className="w-full p-4 rounded-none border-2 bg-[#34a853] border-[#34a853] text-white font-bold uppercase tracking-wider text-center">
                ✅ Comprobante Capturado
                <button 
                  type="button" 
                  onClick={() => setReceiptImage(null)}
                  className="block w-full text-center text-sm mt-2 text-white/70 hover:text-white underline normal-case"
                >
                  Eliminar foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              >
                <img src={`${import.meta.env.BASE_URL}logo_mp.webp`} alt="Pagar con MercadoPago" className="w-full h-auto object-contain max-h-20 mx-auto drop-shadow-md hover:drop-shadow-xl" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!customerName || selectedItems.length === 0}
            className="w-full bg-[var(--color-secondary)] text-[var(--color-primary)] py-3 md:py-4 rounded-none font-black text-base md:text-lg disabled:opacity-50 hover:bg-white transition-colors mt-auto shrink-0 uppercase tracking-widest border-2 border-[var(--color-secondary)]"
          >
            Enviar a Cocina
          </button>
        </form>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b-4 border-[var(--color-secondary)] flex justify-between items-center bg-[var(--color-primary)] text-white">
          <h3 className="text-xl font-black uppercase tracking-widest">Administración</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="text-white hover:text-[#ffdad6] text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Exportar a Excel</p>
            <button onClick={() => handleDownloadExcel('dia')} className="w-full p-4 text-left border-2 border-[var(--color-primary)] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors uppercase tracking-wider flex items-center justify-between">
              Ventas del Día
              <span className="text-xl">📅</span>
            </button>
            <button onClick={() => handleDownloadExcel('total')} className="w-full p-4 text-left border-2 border-[var(--color-primary)] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors uppercase tracking-wider flex items-center justify-between">
              Ventas Totales
              <span className="text-xl">📊</span>
            </button>
          </div>
          <button onClick={() => { setShowReceiptsModal(true); setIsSidebarOpen(false); }} className="w-full p-4 mt-2 text-left border-2 border-[var(--color-secondary)] font-bold text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider flex items-center justify-between">
            Ver Comprobantes
            <span className="text-xl">🧾</span>
          </button>
          
          <div className="mt-auto pt-6 border-t-2 border-gray-100">
            <div className="text-center">
              <p className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-1">Total del Día</p>
              <p className="text-3xl font-black text-[var(--color-primary)]">
                ${orders.reduce((sum, order) => sum + (order.items?.reduce((s, i) => s + i.price, 0) || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Comprobantes */}
      {showReceiptsModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-none shadow-2xl border-4 border-[var(--color-secondary)]">
            <div className="p-6 border-b-4 border-[var(--color-secondary)] flex justify-between items-center bg-[var(--color-primary)] text-white">
              <h3 className="text-2xl font-black uppercase tracking-widest">Comprobantes de Transferencia</h3>
              <button onClick={() => setShowReceiptsModal(false)} className="text-white hover:text-[#ffdad6] text-4xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.filter(o => o.receiptImage).length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400 font-bold text-xl uppercase tracking-widest">No hay comprobantes guardados</div>
              ) : (
                orders.filter(o => o.receiptImage).map(order => (
                  <div key={order.id} className="bg-white border-2 border-gray-200 shadow-md p-4 flex flex-col">
                    <div className="mb-4 pb-4 border-b-2 border-gray-100">
                      <p className="font-black text-lg text-[var(--color-primary)]">{order.customerName}</p>
                      <p className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-2">Pedido #{order.orderNumber}</p>
                      <p className="font-bold text-gray-600">Total: ${order.items?.reduce((s, i) => s + i.price, 0) || 0}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden">
                      <img src={order.receiptImage} alt={`Comprobante ${order.customerName}`} className="max-h-64 object-contain" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
