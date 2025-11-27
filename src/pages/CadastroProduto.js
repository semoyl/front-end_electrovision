import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServicoApi from '../services/api';

function CadastroProduto({ usuario, aoFazerLogout }) {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState({
    nome: '',
    especificacao: '',
    qtd: '',
    prateleira: ''
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (termoBusca) {
      const filtrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        produto.especificacao.toLowerCase().includes(termoBusca.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados(produtos);
    }
  }, [termoBusca, produtos]);

  const carregarProdutos = async () => {
    setCarregando(true);
    try {
      const resposta = await ServicoApi.obterProdutos();
      
      let listaProdutos = [];
      if (resposta.status && resposta.produtos) {
        listaProdutos = resposta.produtos;
      } else if (resposta.status && resposta.dados) {
        listaProdutos = resposta.dados;
      } else {
        setErro(resposta.message || 'Erro ao carregar produtos');
        setCarregando(false);
        return;
      }
      
      // Normalizar: id_produto -> id
      const produtosNormalizados = listaProdutos.map(p => ({
        ...p,
        id: p.id_produto || p.id
      }));
      
      setProdutos(produtosNormalizados);
    } catch (erro) {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  };

  const manipularBusca = async () => {
    if (!termoBusca.trim()) {
      setProdutosFiltrados(produtos);
      return;
    }

    try {
      const resposta = await ServicoApi.buscarProdutos(termoBusca);
      if (resposta.status && resposta.produtos) {
        setProdutosFiltrados(resposta.produtos);
      } else if (resposta.status && resposta.dados) {
        setProdutosFiltrados(resposta.dados);
      }
    } catch (erro) {
      console.error('Erro na busca:', erro);
    }
  };

  const manipularEnvio = async (e) => {
    e.preventDefault();
    
    if (!dadosFormulario.nome || !dadosFormulario.especificacao || !dadosFormulario.qtd || !dadosFormulario.prateleira) {
      setErro('Todos os campos são obrigatórios');
      return;
    }

    if (isNaN(dadosFormulario.qtd) || parseInt(dadosFormulario.qtd) < 0) {
      setErro('Quantidade deve ser um número válido');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const dadosProduto = {
        ...dadosFormulario,
        qtd: parseInt(dadosFormulario.qtd)
      };

      let resposta;
      if (produtoEditando) {
        resposta = await ServicoApi.atualizarProduto(produtoEditando.id, dadosProduto);
        console.log('✏️ Resposta atualização:', resposta);
      } else {
        resposta = await ServicoApi.criarProduto(dadosProduto);
        console.log('➕ Resposta criação:', resposta);
      }

      if (resposta.status) {
        setSucesso(produtoEditando ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        setMostrarModal(false);
        setProdutoEditando(null);
        setDadosFormulario({ nome: '', especificacao: '', qtd: '', prateleira: '' });
        setTimeout(() => setSucesso(''), 3000);
        carregarProdutos();
      } else {
        setErro(resposta.message || 'Erro ao salvar produto');
      }
    } catch (erro) {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  };

  const manipularEdicao = (produto) => {
    setProdutoEditando(produto);
    setDadosFormulario({
      nome: produto.nome,
      especificacao: produto.especificacao,
      qtd: produto.qtd.toString(),
      prateleira: produto.prateleira
    });
    setMostrarModal(true);
  };

  const manipularExclusao = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    setCarregando(true);
    setErro('');
    setSucesso('');
    try {
      const resposta = await ServicoApi.excluirProduto(id);
      console.log('🗑️ Resposta exclusão:', resposta);
      if (resposta.status) {
        setSucesso('Produto excluído com sucesso!');
        setTimeout(() => setSucesso(''), 3000);
        carregarProdutos();
      } else {
        setErro(resposta.message || 'Erro ao excluir produto');
      }
    } catch (erro) {
      setErro('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  };

  const manipularEstoqueRapido = async (produto, tipo) => {
    setErro('');
    setSucesso('');
    
    if (tipo === 'saida' && produto.qtd === 0) {
      setErro('Estoque insuficiente');
      setTimeout(() => setErro(''), 3000);
      return;
    }
    
    try {
      // Registrar movimentação
      const movimentacao = {
        id_produto: produto.id,
        id_funcionario: usuario.id,
        tipo: tipo,
        quantidade: 1,
        data: new Date().toISOString().split('T')[0]
      };
      
      const resposta = await ServicoApi.criarMovimentacao(movimentacao);
      
      if (resposta.status) {
        setSucesso(`${tipo === 'entrada' ? '+1' : '-1'} ${produto.nome}`);
        setTimeout(() => setSucesso(''), 2000);
        
        if (resposta.alerta_estoque) {
          setTimeout(() => {
            alert(`ATENÇÃO: ${resposta.alerta_estoque.message}\nProduto: ${resposta.alerta_estoque.produto}\nQuantidade: ${resposta.alerta_estoque.quantidade_atual}`);
          }, 100);
        }
        
        carregarProdutos();
      } else {
        setErro(resposta.message || 'Erro ao atualizar estoque');
        setTimeout(() => setErro(''), 3000);
      }
    } catch (erro) {
      setErro('Erro de conexão');
      setTimeout(() => setErro(''), 3000);
    }
  };

  const abrirModal = () => {
    setProdutoEditando(null);
    setDadosFormulario({ nome: '', especificacao: '', qtd: '', prateleira: '' });
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setProdutoEditando(null);
    setErro('');
  };

  return (
    <div>
      <header className="header">
        <h1>Cadastro de Produtos</h1>
        <div className="user-info">
          <span>Usuário: {usuario.nome}</span>
          <Link to="/dashboard" className="btn btn-secondary">Voltar</Link>
          <button className="btn btn-secondary" onClick={aoFazerLogout}>Logout</button>
        </div>
      </header>

      <div className="container">
        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Produtos Cadastrados</h3>
            <button className="btn btn-primary" onClick={abrirModal}>
              Novo Produto
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && manipularBusca()}
            />
          </div>

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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>{produto.especificacao}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => manipularEstoqueRapido(produto, 'saida')}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          disabled={produto.qtd === 0}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                          {produto.qtd}
                        </span>
                        <button 
                          className="btn btn-success" 
                          onClick={() => manipularEstoqueRapido(produto, 'entrada')}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{produto.prateleira}</td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-warning" 
                          onClick={() => manipularEdicao(produto)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => manipularExclusao(produto.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {produtosFiltrados.length === 0 && !carregando && (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
              Nenhum produto encontrado
            </p>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{produtoEditando ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button className="close-btn" onClick={fecharModal}>&times;</button>
            </div>

            <form onSubmit={manipularEnvio}>
              <div className="form-group">
                <label>Nome do Produto:</label>
                <input
                  type="text"
                  value={dadosFormulario.nome}
                  onChange={(e) => setDadosFormulario({...dadosFormulario, nome: e.target.value})}
                  placeholder="Ex: iPhone 14 Pro"
                />
              </div>

              <div className="form-group">
                <label>Especificação:</label>
                <textarea
                  value={dadosFormulario.especificacao}
                  onChange={(e) => setDadosFormulario({...dadosFormulario, especificacao: e.target.value})}
                  placeholder="Ex: 128GB, Tela 6.1', Câmera 48MP, iOS 16"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Quantidade:</label>
                <input
                  type="number"
                  value={dadosFormulario.qtd}
                  onChange={(e) => setDadosFormulario({...dadosFormulario, qtd: e.target.value})}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Prateleira:</label>
                <input
                  type="text"
                  value={dadosFormulario.prateleira}
                  onChange={(e) => setDadosFormulario({...dadosFormulario, prateleira: e.target.value})}
                  placeholder="Ex: A1, B2, C3"
                />
              </div>

              <div className="actions">
                <button type="submit" className="btn btn-success" disabled={carregando}>
                  {carregando ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={fecharModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroProduto;