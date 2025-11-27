const API_BASE_URL = 'http://localhost:3030';

class ServicoApi {
  async requisicao(endpoint, opcoes = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const configuracao = {
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
      ...opcoes,
    };

    console.log('🔵 Fazendo requisição:', url);
    console.log('🔵 Configuração:', configuracao);

    try {
      const resposta = await fetch(url, configuracao);
      console.log('🟢 Status da resposta:', resposta.status);
      console.log('🟢 Resposta ok:', resposta.ok);
      
      const texto = await resposta.text();
      console.log('🟢 Texto da resposta:', texto);
      
      const dados = texto ? JSON.parse(texto) : {};
      console.log('🟢 Dados processados:', dados);
      return dados;
    } catch (erro) {
      console.error('🔴 Erro na API:', erro);
      return {
        status: false,
        codigo_status: 500,
        mensagem: 'Erro de conexão com o servidor'
      };
    }
  }

  // Autenticação
  async fazerLogin(chave) {
    return this.requisicao('/v1/electrovision/login', {
      method: 'POST',
      body: JSON.stringify({ chave }),
    });
  }

  // Funcionários
  async obterFuncionarios() {
    return this.requisicao('/v1/electrovision/funcionarios');
  }

  async obterFuncionario(id) {
    return this.requisicao(`/v1/electrovision/funcionario/${id}`);
  }

  async criarFuncionario(funcionario) {
    return this.requisicao('/v1/electrovision/funcionario', {
      method: 'POST',
      body: JSON.stringify(funcionario),
    });
  }

  async atualizarFuncionario(id, funcionario) {
    return this.requisicao(`/v1/electrovision/funcionario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(funcionario),
    });
  }

  async excluirFuncionario(id) {
    return this.requisicao(`/v1/electrovision/funcionario/${id}`, {
      method: 'DELETE',
    });
  }

  // Produtos
  async obterProdutos() {
    return this.requisicao('/v1/electrovision/produtos');
  }

  async obterProduto(id) {
    return this.requisicao(`/v1/electrovision/produto/${id}`);
  }

  async buscarProdutos(nome) {
    return this.requisicao(`/v1/electrovision/produtos/buscar/${nome}`);
  }

  async criarProduto(produto) {
    return this.requisicao('/v1/electrovision/produto', {
      method: 'POST',
      body: JSON.stringify(produto),
    });
  }

  async atualizarProduto(id, produto) {
    return this.requisicao(`/v1/electrovision/produto/${id}`, {
      method: 'PUT',
      body: JSON.stringify(produto),
    });
  }

  async excluirProduto(id) {
    return this.requisicao(`/v1/electrovision/produto/${id}`, {
      method: 'DELETE',
    });
  }

  // Movimentações
  async obterMovimentacoes() {
    return this.requisicao('/v1/electrovision/movimentacoes');
  }

  async obterMovimentacoesProduto(id) {
    return this.requisicao(`/v1/electrovision/movimentacoes/produto/${id}`);
  }

  async criarMovimentacao(movimentacao) {
    return this.requisicao('/v1/electrovision/movimentacao', {
      method: 'POST',
      body: JSON.stringify(movimentacao),
    });
  }
}

export default new ServicoApi();