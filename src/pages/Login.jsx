import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [roleSelection, setRoleSelection] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'cultura123') {
      setRoleSelection(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const selectRole = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full border border-[var(--color-surface-dim)]">
        <h1 className="text-3xl font-bold text-center text-[var(--color-primary)] mb-8">Buffet Casa de la Cultura</h1>
        
        {!roleSelection ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Contraseña Maestra</label>
              <input
                type="password"
                className={`w-full p-3 rounded-xl border ${error ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' : 'border-[var(--color-surface-dim)] focus:ring-[var(--color-primary)]'} bg-[var(--color-surface)] focus:outline-none focus:ring-2`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña (cultura123)"
                autoFocus
              />
              {error && <p className="text-[#ba1a1a] text-sm mt-2">Contraseña incorrecta</p>}
            </div>
            <button type="submit" className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-semibold hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] transition-colors">
              Ingresar
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">Selecciona el Dispositivo</h2>
            <button onClick={() => selectRole('/caja')} className="w-full p-4 rounded-xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors">
              Caja (iPad)
            </button>
            <button onClick={() => selectRole('/cocina')} className="w-full p-4 rounded-xl border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] font-bold text-lg hover:bg-[var(--color-secondary)] hover:text-white transition-colors">
              Cocina (Tablet)
            </button>
            <button onClick={() => selectRole('/pantalla')} className="w-full p-4 rounded-xl border-2 border-[var(--color-tertiary)] text-[var(--color-tertiary)] font-bold text-lg hover:bg-[var(--color-tertiary)] hover:text-white transition-colors">
              Pantalla Pública (PC)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
