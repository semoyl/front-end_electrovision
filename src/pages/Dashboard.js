import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServicoApi from '../services/api';

function Dashboard({ usuario, aoFazerLogout }) {
  const [tema, setTema] = useState('verde');

  useEffect(() => {
    const temaSalvo = localStorage.getItem('electrovision_tema') || 'verde';
    setTema(temaSalvo);
  }, []);

  const alternarTema = () => {
    const novoTema = tema === 'verde' ? 'vermelho' : 'verde';
    setTema(novoTema);
    document.body.className = novoTema;
    localStorage.setItem('electrovision_tema', novoTema);
  };
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  const carregarMovimentacoes = async () => {
    try {
      const resposta = await ServicoApi.obterMovimentacoes();
      if (resposta.status) {
        const lista = resposta.movimentacoes || resposta.dados || [];
        setMovimentacoes(lista.slice(0, 10));
      }
    } catch (erro) {
      console.error('Erro ao carregar movimentações:', erro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div>
      <header className="header">
        <h1>ElectroVision - Dashboard</h1>
        <div className="user-info">
          <span>Bem-vindo, {usuario.nome}</span>
          <button className="btn-tema-header" onClick={alternarTema} title="Alternar tema">
            {tema === 'verde' ? '👽' : '🩸'}
          </button>
          <button className="btn btn-secondary" onClick={aoFazerLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Cadastro de Produtos</h3>
            <p>Gerencie o catálogo de produtos eletrônicos</p>
            <Link to="/produtos" className="btn btn-primary">
              Acessar
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>Gestão de Estoque</h3>
            <p>Controle movimentações de entrada e saída</p>
            <Link to="/estoque" className="btn btn-success">
              Acessar
            </Link>
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Últimas Movimentações</h3>
          {carregando ? (
            <p>Carregando...</p>
          ) : movimentacoes.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Resumo</th>
                  <th>Funcionário</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((movimentacao) => (
                  <tr key={movimentacao.id_historico}>
                    <td>{new Date(movimentacao.data).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span style={{
                        color: movimentacao.resumo.startsWith('ENTRADA') ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {movimentacao.resumo}
                      </span>
                    </td>
                    <td>{movimentacao.funcionario_nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              Nenhuma movimentação registrada
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;