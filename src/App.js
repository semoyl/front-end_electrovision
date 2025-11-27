import React, { useState, useEffect } from 'react';
import { BrowserRouter as Roteador, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CadastroProduto from './pages/CadastroProduto';
import GestaoEstoque from './pages/GestaoEstoque';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [tema, setTema] = useState('verde');

  useEffect(() => {
    const temaSalvo = localStorage.getItem('electrovision_tema');
    if (temaSalvo) setTema(temaSalvo);
  }, []);

  useEffect(() => {
    document.body.className = tema;
    localStorage.setItem('electrovision_tema', tema);
  }, [tema]);

  useEffect(() => {
    try {
      const usuarioSalvo = localStorage.getItem('electrovision_usuario');
      if (usuarioSalvo && usuarioSalvo !== 'undefined') {
        const dadosUsuario = JSON.parse(usuarioSalvo);
        const usuarioNormalizado = {
          ...dadosUsuario,
          id: dadosUsuario.id_funcionario || dadosUsuario.id
        };
        setUsuario(usuarioNormalizado);
      }
    } catch (erro) {
      console.error('Erro ao carregar usuário:', erro);
      localStorage.removeItem('electrovision_usuario');
    }
  }, []);

  const manipularLogin = (dadosUsuario) => {
    const usuarioNormalizado = {
      ...dadosUsuario,
      id: dadosUsuario.id_funcionario || dadosUsuario.id
    };
    setUsuario(usuarioNormalizado);
    localStorage.setItem('electrovision_usuario', JSON.stringify(usuarioNormalizado));
  };

  const manipularLogout = () => {
    setUsuario(null);
    localStorage.removeItem('electrovision_usuario');
  };

  const alternarTema = () => {
    setTema(tema === 'verde' ? 'vermelho' : 'verde');
  };

  return (
    <Roteador>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!usuario ? <Login aoFazerLogin={manipularLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={usuario ? <Dashboard usuario={usuario} aoFazerLogout={manipularLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/produtos" 
            element={usuario ? <CadastroProduto usuario={usuario} aoFazerLogout={manipularLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/estoque" 
            element={usuario ? <GestaoEstoque usuario={usuario} aoFazerLogout={manipularLogout} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={usuario ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Roteador>
  );
}

export default App;