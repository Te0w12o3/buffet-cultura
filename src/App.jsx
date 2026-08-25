import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Caja from './pages/Caja';
import Cocina from './pages/Cocina';
import Pantalla from './pages/Pantalla';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/caja" element={<Caja />} />
        <Route path="/cocina" element={<Cocina />} />
        <Route path="/pantalla" element={<Pantalla />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
