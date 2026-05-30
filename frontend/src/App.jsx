import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './mobile.css';

// Importação das Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardTarot from './pages/DashboardTarot';
import PainelTarologo from './pages/PainelTarologo';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';
import Planos from './pages/Planos'; 
import PainelAdmin from './pages/PainelAdmin'; 
import OEspaco from './pages/OEspaco'; // <--- IMPORTANDO A NOVA PÁGINA "O ESPAÇO"

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/o-espaco" element={<OEspaco />} /> {/* <--- ROTA ADICIONADA AQUI */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/planos" element={<Planos />} />

          {/* Rotas Privadas (Painéis) */}
          <Route path="/dashboard" element={<DashboardTarot />} />
          <Route path="/painel-tarologo" element={<PainelTarologo />} />
          
          {/* Rota Exclusiva de Administração */}
          <Route path="/admin" element={<PainelAdmin />} /> 
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}