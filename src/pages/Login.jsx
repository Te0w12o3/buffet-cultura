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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-primary)] greek-pattern-bg">
      <div className="bg-white rounded-none shadow-2xl p-8 max-w-md w-full meander-border">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="h-24 mx-auto mb-6 object-contain" />
        <h1 className="text-3xl font-black text-center text-[var(--color-primary)] mb-2 uppercase tracking-widest">Buffet</h1>
        <h2 className="text-xl font-bold text-center text-[var(--color-secondary)] mb-8 uppercase tracking-wider">Casa de la Cultura</h2>
        
        {!roleSelection ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">Contraseña Maestra</label>
              <input
                type="password"
                className={`w-full p-4 rounded-none border-2 ${error ? 'border-[#ba1a1a] focus:ring-[#ba1a1a]' : 'border-[var(--color-primary)] focus:ring-[var(--color-secondary)]'} bg-[var(--color-surface)] focus:outline-none focus:ring-2 font-sans`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
                autoFocus
              />
              {error && <p className="text-[#ba1a1a] text-sm mt-2 font-bold">Contraseña incorrecta</p>}
            </div>
            <button type="submit" className="w-full bg-[var(--color-secondary)] text-[var(--color-primary)] py-4 rounded-none font-black text-lg hover:bg-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors uppercase tracking-widest border-2 border-[var(--color-secondary)]">
              Ingresar al Ágora
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center mb-6 text-[var(--color-primary)] uppercase tracking-widest border-b-2 border-[var(--color-secondary)] pb-4">Selecciona el Dispositivo</h2>
            <button onClick={() => selectRole('/caja')} className="w-full p-4 rounded-none border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors uppercase tracking-wider">
              Caja (iPad)
            </button>
            <button onClick={() => selectRole('/cocina')} className="w-full p-4 rounded-none border-2 border-[var(--color-tertiary)] text-[var(--color-tertiary)] font-bold text-lg hover:bg-[var(--color-tertiary)] hover:text-white transition-colors uppercase tracking-wider">
              Cocina (Tablet)
            </button>
            <button onClick={() => selectRole('/pantalla')} className="w-full p-4 rounded-none border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] font-bold text-lg hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors uppercase tracking-wider bg-[var(--color-primary)]">
              Pantalla Pública (PC)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
