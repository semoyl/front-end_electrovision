import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServicoApi from '../services/api';

function GestaoEstoque({ usuario, aoFazerLogout }) {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [tipoMovimentacao, setTipoMovimentacao] = useState('entrada');
  const [quantidade, setQuantidade] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const resposta = await ServicoApi.obterProdutos();
      if (resposta.status) {
        const listaProdutos = resposta.produtos || resposta.dados || [];
        
        // Normalizar: id_produto -> id
        const produtosNormalizados = listaProdutos.map(p => ({
          ...p,
          id: p.id_produto || p.id
        }));
        
        // Ordenação alfabética (Bubble Sort)
        const produtosOrdenados = [...produtosNormalizados];
        for (let i = 0; i < produtosOrdenados.length - 1; i++) {
          for (let j = 0; j < produtosOrdenados.length - i - 1; j++) {
            if (produtosOrdenados[j].nome > produtosOrdenados[j + 1].nome) {
              [produtosOrdenados[j], produtosOrdenados[j + 1]] = [produtosOrdenados[j + 1], produtosOrdenados[j]];
            }
          }
        }
        setProdutos(produtosOrdenados);
      } else {
        setErro(resposta.message || 'Erro ao carregar produtos');
      }
    } catch (erro) {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  };

  const manipularMovimentacao = async (e) => {
    e.preventDefault();
    
    if (!produtoSelecionado || !quantidade || !data) {
      setErro('Todos os campos são obrigatórios');
      return;
    }

    if (isNaN(quantidade) || parseInt(quantidade) <= 0) {
      setErro('Quantidade deve ser um número positivo');
      return;
    }

    setCarregando(true);
    setErro('');
    setSucesso('');
    setAlerta(null);

    try {
      const movimentacao = {
        id_produto: parseInt(produtoSelecionado),
        id_funcionario: usuario.id,
        tipo: tipoMovimentacao,
        quantidade: parseInt(quantidade),
        data: data
      };

      const resposta = await ServicoApi.criarMovimentacao(movimentacao);
      console.log('📦 Resposta movimentação:', resposta);
      
      if (resposta.status) {
        setSucesso(`Movimentação de ${tipoMovimentacao} realizada com sucesso!`);
        
        // Verificar se há alerta de estoque
        if (resposta.alerta_estoque) {
          setAlerta(resposta.alerta_estoque);
        }
        
        // Limpar formulário
        setProdutoSelecionado('');
        setQuantidade('');
        setTipoMovimentacao('entrada');
        
        // Recarregar produtos para atualizar quantidades
        carregarProdutos();
      } else {
        setErro(resposta.message || 'Erro ao realizar movimentação');
      }
    } catch (erro) {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  };

  const obterStatusEstoque = (quantidade) => {
    if (quantidade === 0) {
      return { status: 'ESGOTADO', cor: '#e74c3c' };
    } else if (quantidade < 5) {
      return { status: 'ESTOQUE BAIXO', cor: '#f39c12' };
    } else {
      return { status: 'NORMAL', cor: '#27ae60' };
    }
  };

  return (
    <div>
      <header className="header">
        <h1>Gestão de Estoque</h1>
        <div className="user-info">
          <span>Usuário: {usuario.nome}</span>
          <Link to="/dashboard" className="btn btn-secondary">Voltar</Link>
          <button className="btn btn-secondary" onClick={aoFazerLogout}>Logout</button>
        </div>
      </header>

      <div className="container">
        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}
        {alerta && (
          <div className="alert alert-warning">
            <strong>{alerta.message}</strong><br />
            Produto: {alerta.produto}<br />
            Quantidade atual: {alerta.quantidade_atual}<br />
            Status: {alerta.status}
          </div>
        )}

        <div className="card">
          <h3>Nova Movimentação</h3>
          <form onSubmit={manipularMovimentacao}>
            <div className="form-group">
              <label>Produto:</label>
              <select
                value={produtoSelecionado}
                onChange={(e) => setProdutoSelecionado(e.target.value)}
                disabled={carregando}
              >
                <option value="">Selecione um produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} - Qtd: {produto.qtd} - {produto.prateleira}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Movimentação:</label>
              <select
                value={tipoMovimentacao}
                onChange={(e) => setTipoMovimentacao(e.target.value)}
                disabled={carregando}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantidade:</label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                min="1"
                disabled={carregando}
              />
            </div>

            <div className="form-group">
              <label>Data:</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={carregando}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={carregando}>
              {carregando ? 'Processando...' : 'Registrar Movimentação'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Produtos em Estoque (Ordem Alfabética)</h3>
          {carregando ? (
            <p>Carregando...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Especificação</th>
                  <th>Quantidade</th>
                  <th>Prateleira</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const statusEstoque = obterStatusEstoque(produto.qtd);
                  return (
                    <tr key={produto.id}>
                      <td>{produto.nome}</td>
                      <td>{produto.especificacao}</td>
                      <td>{produto.qtd}</td>
                      <td>{produto.prateleira}</td>
                      <td>
                        <span style={{ 
                          color: statusEstoque.cor, 
                          fontWeight: 'bold',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: statusEstoque.cor + '20'
                        }}>
                          {statusEstoque.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {produtos.length === 0 && !carregando && (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              Nenhum produto cadastrado
            </p>
          )}
        </div>

        <div className="card">
          <h3>Legenda de Status</h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#27ae60', 
                borderRadius: '4px' 
              }}></div>
              <span>Normal (≥ 5 unidades)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#f39c12', 
                borderRadius: '4px' 
              }}></div>
              <span>Estoque Baixo (1-4 unidades)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#e74c3c', 
                borderRadius: '4px' 
              }}></div>
              <span>Esgotado (0 unidades)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestaoEstoque;