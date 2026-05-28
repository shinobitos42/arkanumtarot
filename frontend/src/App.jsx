import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async'; // <-- IMPORTAÇÃO NECESSÁRIA

// Importação das Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardTarot from './pages/DashboardTarot';
import PainelTarologo from './pages/PainelTarologo';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';

export default function App() {
  return (
    <HelmetProvider> {/* <-- ENVOLVENDO TODA A APLICAÇÃO */}
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />

          {/* Rotas Privadas (Painéis) */}
          <Route path="/dashboard" element={<DashboardTarot />} />
          <Route path="/painel-tarologo" element={<PainelTarologo />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}