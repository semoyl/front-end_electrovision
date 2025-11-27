# ElectroVision - Sistema de Controle de Estoque

Sistema front-end em React.js para controle de estoque de equipamentos eletrônicos.

## Funcionalidades

### Autenticação
- Login com chave de funcionário
- Sessão persistente no localStorage
- Logout seguro

### Interface Principal (Dashboard)
- Exibe nome do usuário logado
- Botão de logout
- Acesso às funcionalidades principais
- Design responsivo

### Cadastro de Produtos
- Listagem automática de produtos
- Campo de busca inteligente
- Cadastro de novos produtos
- Edição de produtos existentes
- Exclusão de produtos
- Validações completas dos campos
- Retorno à interface principal

### Gestão de Estoque
- Listagem ordenada alfabeticamente (Bubble Sort)
- Seleção de produto para movimentação
- Escolha entre entrada/saída
- Inserção de data da movimentação
- Alertas automáticos de estoque baixo
- Verificação de estoque crítico
- Status visual do estoque

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
│   ├── Login.js        # Tela de login
│   ├── Dashboard.js    # Interface principal
│   ├── CadastroProduto.js  # Cadastro de produtos
│   └── GestaoEstoque.js    # Gestão de estoque
├── services/           # Serviços de API
│   └── api.js         # Comunicação com backend
├── App.js             # Componente principal
├── App.css            # Estilos globais
└── index.js           # Ponto de entrada
```

## Tecnologias Utilizadas

- **React.js 18** - Framework principal
- **React Router DOM** - Roteamento
- **CSS3** - Estilização
- **Fetch API** - Comunicação HTTP

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```

3. Acesse: http://localhost:3000

## Configuração da API

O sistema está configurado para se comunicar com a API em:
- **Base URL**: http://localhost:3030
- **Endpoints**: Conforme documentação da API ElectroVision

## Características Especiais

### Design
- Interface limpa e intuitiva
- Responsivo para mobile e desktop
- Cores e tipografia profissionais
- Feedback visual para ações

### Segurança
- Rotas protegidas por autenticação
- Validação de dados no frontend
- Tratamento de erros da API

### Usabilidade
- Navegação intuitiva
- Mensagens de sucesso/erro claras
- Loading states para operações
- Confirmações para ações críticas

### Performance
- Componentes otimizados
- Busca em tempo real
- Ordenação eficiente
- Cache de sessão

## Status do Estoque

- **Normal**: ≥ 5 unidades
- **Estoque Baixo**: 1-4 unidades  
- **Esgotado**: 0 unidades

## Alertas Automáticos

O sistema monitora automaticamente o estoque e exibe alertas quando:
- Estoque fica abaixo de 5 unidades
- Produto fica esgotado
- Tentativa de saída com quantidade insuficiente

## Desenvolvido por

Sistema desenvolvido para controle de estoque de equipamentos eletrônicos utilizando React.js e tecnologias modernas de desenvolvimento web.