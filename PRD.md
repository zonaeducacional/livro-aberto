# PRD: Livro Aberto — Flipbook Interativo com Painel do Autor

## 1. Visão Geral do Produto
O **Livro Aberto** é uma plataforma literária e pedagógica interativa, baseada em folheamento de páginas 3D (*flipbook* realista), concebida para que o autor e pensador **Sérgio** possa escrever, organizar e publicar continuamente suas crônicas, reflexões filosóficas, ensaios históricos e textos educativos.

A aplicação opera em dois modos integrados:
1. **Modo Leitor (Público)**: Uma experiência imersiva de leitura com estética de livro físico impresso, virada de páginas suave via toque ou clique, sumário interativo, paginação realista e tipografia clássica.
2. **Modo Autor/Admin (Restrito)**: Uma interface moderna e elegante com painel de gerenciamento de textos, permitindo criar novos capítulos, editar rascunhos, reordenar tópicos, configurar capa e publicar imediatamente.

---

## 2. Princípios e Diretrizes Inegociáveis
- **Soberania e FOSS:** 100% autônomo, sem dependência de serviços externos proprietários ou bancos pagos em nuvem.
- **Local-First & Resiliência:** Os textos redigidos são salvos instantaneamente no armazenamento local (IndexedDB/LocalStorage), garantindo que nada se perca mesmo offline.
- **Portabilidade Total:** Exportação e importação completa da obra em formato aberto (`.json`), permitindo backups fáceis e publicação estática em qualquer servidor próprio (Nginx / N4050 / GitHub Pages).
- **Estética Editorial Nobre ("UI Pro Max"):** Tipografia com serifas de alta legibilidade (estilo editorial de alta qualidade), texturas sutis de papel, numeração automática e layout equilibrado.

---

## 3. Personas e Casos de Uso

### 3.1. Sérgio (Autor / Administrador)
- Acessa o modo administrativo de forma segura e discreta através de botão ou atalho de teclado (`Ctrl + Shift + A`).
- Escreve novos textos utilizando um editor de texto estruturado (com suporte a parágrafos, poesias, citações e epígrafes).
- Organiza a sequência da obra (capítulos, prólogo, sumário, ensaios e epílogo).
- Customiza dados da capa (Título da obra, Subtítulo, Nome do Autor, Imagem de Capa).
- Exporta o arquivo de dados consolidado para backup ou distribuição.

### 3.2. Leitor (Alunos, Professores, Comunidade)
- Folheia as páginas usando mouse (arrastando cantos ou clicando), setas do teclado ou toque na tela (mobile/tablet).
- Navega pelo Sumário / Índice Dinâmico, pulando diretamente para o capítulo desejado.
- Desfruta de uma experiência fluida, sem distrações, com paginação automática correta (página esquerda e página direita).

---

## 4. Requisitos Funcionais (RF)

### RF-01: Controle de Acesso e Modo Administrativo
- [ ] Ponto de entrada discreto (ícone sutil de chave/cadeado no cabeçalho ou rodapé e atalho de teclado).
- [ ] Autenticação com senha mestre soberana (hash local com opção de redefinição pelo autor).
- [ ] Painel lateral ou modal retrátil com estética Glassmorphism / Dark Mode para gestão de capítulos.

### RF-02: Gerenciador de Capítulos e Textos
- [ ] Lista de capítulos com status (*Publicado* ou *Rascunho*).
- [ ] Criação de novos capítulos com: Título, Data/Época, Subtítulo e Conteúdo.
- [ ] Reordenação de capítulos (mover para cima / para baixo).
- [ ] Edição em tempo real com pré-visualização.
- [ ] Exclusão com confirmação de segurança.

### RF-03: Motor de Auto-Paginação Dinâmica (Turn.js Engine)
- [ ] O motor deve receber os capítulos cadastrados e convertê-los dinamicamente nas páginas do livro.
- [ ] Quebra inteligente de conteúdo: textos longos devem se distribuir fluentemente em múltiplas folhas sem quebrar o layout nem cortar parágrafos ao meio.
- [ ] Geração dinâmica de:
  - **Página 1 (Capa)**: Capa dura decorada com arte e tipografia destacada.
  - **Página 2 (Folha de Rosto / Créditos)**: Dados do autor, dedicatória e nota editorial.
  - **Página 3/4 (Sumário Dinâmico)**: Lista clicável de todos os capítulos com numeração de página correspondente.
  - **Páginas de Conteúdo (Pares à esquerda, Ímpares à direita)**: Numeração no rodapé e cabeçalho sutil.
  - **Última Página (Contracapa / Epílogo)**: Fechamento elegante do livro.

### RF-04: Persistência Local-First e Gerenciamento de Dados
- [ ] Salvamento automático local no navegador (IndexedDB / LocalStorage).
- [ ] Botão de **Exportar Livro (.json)**: Baixa um backup completo de todos os textos e configurações.
- [ ] Botão de **Importar Livro (.json)**: Carrega um backup existente com restauração completa.
- [ ] Estrutura pronta para sincronização ou exportação de build estático consolidado para publicação na web.

### RF-05: Controles de Leitura e Acessibilidade
- [ ] Botões visuais de navegação: Próxima Página (`>`), Página Anterior (`<`), Ir para o Início, Ir para o Fim.
- [ ] Atalhos de teclado: Setas Esquerda/Direita e barra de espaço.
- [ ] Indicador de progresso (Ex: "Página 12 de 48").
- [ ] Opção de alternar entre modo Livro Duplo (computador) e Modo Página Única (telas pequenas).

---

## 5. Requisitos Não Funcionais (RNF)
- **Desempenho:** Carregamento instantâneo, virada a 60fps sem engasgos de GPU/CPU.
- **Responsividade:** Adaptação suave ao tamanho da janela e dispositivos móveis.
- **Independência:** Funciona 100% offline sem necessidade de servidores externos.
- **Compatibilidade:** Funciona nos navegadores modernos (Chrome, Chromium, Firefox, Edge).
