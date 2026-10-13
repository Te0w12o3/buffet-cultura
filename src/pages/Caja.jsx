import { useState, useRef } from 'react';
import { useOrders, useStock } from '../store';
import { MENU_ITEMS } from '../menu';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function Caja() {
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [receiptImage, setReceiptImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const fileInputRef = useRef(null);
  const { addOrder, orders } = useOrders();
  const { stock, reduceStock, updateItemStock, resetStock } = useStock();
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

  const getAvailableStock = (itemId) => {
    const total = stock[itemId] ?? 0;
    const inCart = selectedItems.filter(i => i.id === itemId).length;
    return Math.max(0, total - inCart);
  };

  const handleAddItem = (item) => {
    const available = getAvailableStock(item.id);
    if (available <= 0) return;
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

    if (!receiptImage) {
      setShowChangeModal(true);
      return;
    }

    processOrder();
  };

  const processOrder = () => {
    const orderNumber = orders.length + 101;

    addOrder({
      customerName,
      items: selectedItems,
      orderNumber,
      paymentMethod: receiptImage ? 'transferencia' : 'efectivo',
      receiptImage: receiptImage || null
    });

    reduceStock(selectedItems);

    setCustomerName('');
    setSelectedItems([]);
    setReceiptImage(null);
    setShowChangeModal(false);
    setPaymentAmount('');
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
        
        <div className="flex gap-2 md:gap-4 mb-6 justify-start items-center flex-wrap border-b-2 border-[var(--color-surface-dim)] pb-4">
          <span className="text-sm md:text-lg font-bold uppercase tracking-widest text-[#e91e63]">Dulces</span>
          <span className="text-sm md:text-lg font-bold text-gray-300">•</span>
          <span className="text-sm md:text-lg font-bold uppercase tracking-widest text-[#f57c00]">Platos Principales</span>
          <span className="text-sm md:text-lg font-bold text-gray-300">•</span>
          <span className="text-sm md:text-lg font-bold uppercase tracking-widest text-[#1976d2]">Bebidas</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {MENU_ITEMS.map((item) => {
            let colors = { border: 'border-[var(--color-primary)]', hover: 'hover:bg-[var(--color-primary)]', text: 'text-[var(--color-primary)]' };
            if (item.category === 'Dulces') colors = { border: 'border-[#e91e63]', hover: 'hover:bg-[#e91e63]', text: 'text-[#e91e63]' };
            if (item.category === 'Platos Principales') colors = { border: 'border-[#f57c00]', hover: 'hover:bg-[#f57c00]', text: 'text-[#f57c00]' };
            if (item.category === 'Bebidas') colors = { border: 'border-[#1976d2]', hover: 'hover:bg-[#1976d2]', text: 'text-[#1976d2]' };

            const inCart = selectedItems.filter(i => i.id === item.id).length;
            const currentTotalStock = stock[item.id] ?? 0;
            const available = Math.max(0, currentTotalStock - inCart);
            const isOutOfStock = available <= 0;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isOutOfStock}
                onClick={() => handleAddItem(item)}
                className={`p-3 md:p-4 bg-[var(--color-background)] rounded-none border-2 ${colors.border} ${
                  isOutOfStock
                    ? 'opacity-40 cursor-not-allowed border-gray-300 bg-gray-100'
                    : `${colors.hover} hover:text-white cursor-pointer`
                } transition-all text-left flex flex-col justify-between min-h-[105px] md:min-h-[115px] group relative select-none`}
              >
                <div className="flex justify-between items-start w-full gap-1">
                  <span className={`font-bold text-base md:text-lg leading-tight ${isOutOfStock ? 'text-gray-400 line-through' : colors.text} ${!isOutOfStock && 'group-hover:text-white'}`}>
                    {item.name}
                  </span>
                  {inCart > 0 && (
                    <span className="bg-[var(--color-primary)] text-white text-xs font-black px-1.5 py-0.5 rounded-full shrink-0 group-hover:bg-white group-hover:text-[var(--color-primary)] shadow-sm">
                      x{inCart}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center w-full mt-2 pt-2 border-t border-gray-100 group-hover:border-white/20">
                  <span className={`font-bold text-sm md:text-base ${isOutOfStock ? 'text-gray-400' : 'text-gray-600 group-hover:text-white'}`}>
                    ${item.price}
                  </span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 uppercase tracking-wider rounded ${
                      currentTotalStock === 0 || isOutOfStock
                        ? 'bg-red-100 text-red-700'
                        : available <= 5
                          ? 'bg-amber-100 text-amber-800 group-hover:bg-amber-300 group-hover:text-amber-950'
                          : 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200 group-hover:text-emerald-950'
                    }`}
                  >
                    {currentTotalStock === 0
                      ? 'Sin stock'
                      : isOutOfStock
                        ? 'Agotado (en pedido)'
                        : `Stock: ${available}`}
                  </span>
                </div>
              </button>
            );
          })}
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
        <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
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

          <button onClick={() => { setShowStockModal(true); setIsSidebarOpen(false); }} className="w-full p-4 text-left border-2 border-[var(--color-tertiary)] font-bold text-[var(--color-tertiary)] hover:bg-[var(--color-tertiary)] hover:text-white transition-colors uppercase tracking-wider flex items-center justify-between">
            Control de Stock
            <span className="text-xl">📦</span>
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

      {/* Modal de Control de Stock */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-none shadow-2xl border-4 border-[var(--color-secondary)]">
            <div className="p-4 md:p-6 border-b-4 border-[var(--color-secondary)] flex justify-between items-center bg-[var(--color-primary)] text-white">
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">Control y Ajuste de Stock</h3>
                <p className="text-xs text-[var(--color-secondary)] tracking-wider mt-1">Modificá el inventario disponible en tiempo real</p>
              </div>
              <button onClick={() => setShowStockModal(false)} className="text-white hover:text-[#ffdad6] text-4xl leading-none">&times;</button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MENU_ITEMS.map((item) => {
                  const currentQty = stock[item.id] ?? 0;
                  return (
                    <div key={item.id} className="p-4 border-2 border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm md:text-base text-[var(--color-primary)] truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">{item.category} • ${item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateItemStock(item.id, Math.max(0, currentQty - 1))}
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-[var(--color-primary)] font-black text-lg bg-white flex items-center justify-center text-[var(--color-primary)] hover:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) => updateItemStock(item.id, e.target.value)}
                          className="w-16 p-1 text-center font-black border-2 border-gray-300 focus:border-[var(--color-primary)] focus:outline-none bg-white text-base"
                        />
                        <button
                          type="button"
                          onClick={() => updateItemStock(item.id, currentQty + 1)}
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-[var(--color-primary)] font-black text-lg bg-white flex items-center justify-center text-[var(--color-primary)] hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-gray-100 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Seguro que querés restablecer todo el stock a los valores iniciales?")) {
                    resetStock();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 font-bold uppercase tracking-wider underline cursor-pointer"
              >
                Restablecer a valores iniciales
              </button>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="w-full sm:w-auto px-6 py-2 bg-[var(--color-primary)] text-white font-black uppercase tracking-wider hover:bg-[var(--color-secondary)] transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal de Vuelto */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md flex flex-col rounded-none shadow-2xl border-4 border-[var(--color-secondary)] text-center p-6 md:p-8">
            <h3 className="text-3xl font-black uppercase tracking-widest text-[var(--color-primary)] mb-6">Calculadora de Vuelto</h3>
            
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total a Cobrar</p>
              <p className="text-5xl font-black text-[#ba1a1a]">
                ${selectedItems.reduce((sum, item) => sum + item.price, 0)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-[var(--color-primary)]">Abona con:</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
                <input
                  type="number"
                  autoFocus
                  className="w-full p-4 pl-10 rounded-none border-4 border-gray-200 focus:border-[var(--color-secondary)] focus:outline-none transition-colors font-black text-3xl text-center"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mb-8 p-4 bg-gray-50 border-2 border-gray-200">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Vuelto a entregar</p>
              <p className={`text-4xl font-black ${paymentAmount && Number(paymentAmount) >= selectedItems.reduce((sum, item) => sum + item.price, 0) ? 'text-[#34a853]' : 'text-gray-400'}`}>
                ${paymentAmount && Number(paymentAmount) >= selectedItems.reduce((sum, item) => sum + item.price, 0) 
                  ? Number(paymentAmount) - selectedItems.reduce((sum, item) => sum + item.price, 0) 
                  : '0'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={processOrder}
                className="w-full bg-[var(--color-primary)] text-white py-4 rounded-none font-black text-xl uppercase tracking-widest hover:bg-[var(--color-secondary)] transition-colors"
              >
                Confirmar y Enviar
              </button>
              <button 
                onClick={processOrder}
                className="w-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] py-3 rounded-none font-bold text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                Saltar (Sin calcular vuelto)
              </button>
              <button 
                onClick={() => { setShowChangeModal(false); setPaymentAmount(''); }}
                className="w-full text-gray-400 py-2 rounded-none font-bold text-sm underline hover:text-gray-600 transition-colors mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
