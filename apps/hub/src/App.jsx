import { Routes, Route, Navigate } from 'react-router-dom';
import Launcher from './Launcher.jsx';
import ModuleShell from './ModuleShell.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Launcher />} />
      <Route path="/tool/:id" element={<ModuleShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
