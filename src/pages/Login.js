import React, { useState } from 'react';
import ServicoApi from '../services/api';

function Login({ aoFazerLogin }) {
  const [chave, setChave] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const manipularEnvio = async (e) => {
    e.preventDefault();
    if (!chave.trim()) {
      setErro('Por favor, insira sua chave de acesso');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const resposta = await ServicoApi.fazerLogin(chave);
      console.log('🟡 Resposta completa:', resposta);
      console.log('🟡 resposta.status:', resposta.status);
      console.log('🟡 resposta.dados:', resposta.dados);
      console.log('🟡 resposta.funcionario:', resposta.funcionario);
      
      if (resposta.status && resposta.funcionario) {
        console.log('✅ Login bem-sucedido, chamando aoFazerLogin');
        aoFazerLogin(resposta.funcionario);
      } else if (resposta.status && resposta.dados) {
        console.log('✅ Login bem-sucedido (dados), chamando aoFazerLogin');
        aoFazerLogin(resposta.dados);
      } else {
        console.log('❌ Login falhou:', resposta.message);
        setErro(resposta.message || 'Erro ao fazer login');
      }
    } catch (erro) {
      console.log('❌ Erro de conexão:', erro);
      setErro('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>ElectroVision</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#7f8c8d' }}>
          Sistema de Controle de Estoque
        </p>
        
        {erro && (
          <div className="alert alert-danger" style={{
            background: 'rgba(231, 76, 60, 0.2)',
            border: '2px solid #e74c3c',
            color: '#e74c3c',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 'bold',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
          }}>
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={manipularEnvio}>
          <div className="form-group">
            <label htmlFor="chave">Chave de Acesso:</label>
            <input
              type="text"
              id="chave"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              placeholder="Digite sua chave de acesso"
              disabled={carregando}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;