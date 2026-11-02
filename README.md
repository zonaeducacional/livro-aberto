# Livro Aberto — Flipbook Interativo com Painel do Autor

Uma plataforma literária e pedagógica interativa baseada em **folheamento 3D realista (turn.js)**, desenvolvida sob a filosofia **Local-First & Soberania Digital** para o autor **Sérgio** (Professor, Pedagogo, Filósofo, Escritor e Historiador).

Permite que o autor redija, edite, organize e publique crônicas, reflexões filosóficas, memórias e ensaios pedagógicos quando quiser, com auto-paginação dinâmica, sumário clicável em tempo real e persistência local no navegador.

🌐 **Acesse online no GitHub Pages**: [https://zonaeducacional.github.io/livro-aberto/](https://zonaeducacional.github.io/livro-aberto/)

---

## 🚀 Funcionalidades Principais

### 1. Modo Leitor (Público & Imersivo)
* **Folheamento Realista 3D**: Virada de páginas suave via clique, arrasto dos cantos ou setas do teclado (`←` e `→`).
* **Tipografia Editorial "UI Pro Max"**: Fontes clássicas (*Cinzel* e *Cormorant Garamond*), capitulares elegantes (*drop caps*), textura suave de papel e sombras de lombada realistas.
* **Sumário Dinâmico & Clicável**: Índice de capítulos gerado e paginado automaticamente com link direto para a página de início de cada texto.
* **Barra de Controle (HUD Superior)**: Botões para Início, Anterior, Contador de Páginas ("Página X de Y"), Próxima, Fim e Sumário.

### 2. Painel do Autor / Modo Admin Soberano
* **Acesso Rápido & Discreto**:
  * Botão flutuante sutil no canto inferior direito ("✍️ Modo Autor").
  * Atalho universal de teclado: **`Ctrl + Shift + A`** (ou `Cmd + Shift + A`).
* **Autenticação Soberana**:
  * Proteção por PIN/Senha (PIN padrão inicial: `1234`).
  * Opção de alteração segura do PIN no próprio painel.
* **Editor de Textos & Ensaios**:
  * Título, subtítulo/epígrafe, data/época e status (*Publicado* ou *Rascunho*).
  * Contador em tempo real de palavras e caracteres.
  * Quebra inteligente de parágrafos em páginas físicas no flipbook sem estouro visual.
* **Gestão de Capítulos**:
  * Reordenação fácil de capítulos (subir `▲` ou descer `▼`).
  * Edição instantânea e exclusão protegida.
* **Metadados da Obra**:
  * Personalização do Título da Capa, Subtítulo, Nome do Autor ("Sérgio"), Ano/Edição e Dedicatória.
* **Backup & Restauração Soberana**:
  * **Exportar (.json)**: Download de backup integral de todos os textos e configurações da obra.
  * **Importar (.json)**: Restauração instantânea de backups anteriores.

---

## 🛠️ Stack Tecnológica
* **Frontend**: HTML5 Semântico, CSS3 Moderno (Custom Properties, Gradients, Backdrop Filter Glassmorphism).
* **Motor de Flipbook**: [turn.js v4](http://www.turnjs.com) com jQuery.
* **Tipografia**: Google Fonts (*Cormorant Garamond*, *Cinzel*, *Inter*).
* **Persistência**: Local-First (HTML5 Web Storage / LocalStorage com modelo de dados estruturado e hashes SHA-256 via Web Crypto API nativa).
* **Independência**: Sem necessidade de servidores em nuvem pagos, bancos externos proprietários ou bibliotecas pesadas.

---

## 📂 Estrutura do Projeto

```
book-flip-page-turn/
├── dist/
│   ├── index.html        # Estrutura principal e HUD do leitor
│   ├── style.css         # Estilos editoriais nobres e design do painel Admin
│   ├── data-store.js     # Banco de dados Local-First e persistência soberana
│   ├── pagination.js     # Motor de auto-paginação dinâmica e sumário
│   ├── admin.js          # Painel do autor, editor de texto e backup
│   └── script.js         # Turn.js engine e orquestrador dinâmico
├── src/                  # Cópia fonte sincronizada dos módulos
├── PRD.md                # Documento de Requisitos de Produto (Spec Kit)
├── README.md             # Este manual completo
└── LICENSE.txt           # Licença de uso
```

---

## 📖 Como Executar

Por ser uma aplicação 100% autônoma e Local-First, basta abrir o arquivo `dist/index.html` em qualquer navegador moderno:

1. **Abrir direto no navegador**:
   Dê dois cliques no arquivo `dist/index.html` ou abra pelo terminal:
   ```bash
   google-chrome "dist/index.html"
   # ou
   firefox "dist/index.html"
   ```

2. **Via servidor local HTTP (opcional)**:
   ```bash
   cd "/home/sergio/Área de trabalho/book-flip-page-turn/dist"
   python3 -m http.server 8080
   ```
   Acesse: `http://localhost:8080`

---

## ⌨️ Atalhos Úteis

| Atalho | Função |
| :--- | :--- |
| **`Ctrl + Shift + A`** | Abrir/Fechar Painel do Autor (Modo Admin) |
| **`Seta Direita (→)`** | Próxima Página do Livro |
| **`Seta Esquerda (←)`** | Página Anterior do Livro |
| **`Esc`** | Fechar modais e painéis abertos |

---

## 📜 Histórico de Modificações (Changelog)

### Versão 2.0.0 (Novembro de 2026) — Edição Autoral "Livro Aberto"
* **Arquitetura Soberana**: Criação do módulo `data-store.js` para persistência Local-First com CRUD de capítulos e backup JSON.
* **Auto-Paginação Dinâmica**: Criação do módulo `pagination.js` que converte textos em páginas físicas com capas nobres, folha de rosto, sumário pontilhado interativo e notas.
* **Painel do Autor (Modo Admin)**: Criação de `admin.js` com interface Glassmorphism Dark, autenticação soberana por PIN e editor de textos com contadores.
* **Estilização Editorial ("UI Pro Max")**: Refatoração completa de `style.css` com paleta marfim/ouro, sombras 3D de lombada e tipografia *Cinzel* e *Cormorant Garamond*.
* **HUD do Leitor**: Adição de barra de controles superior com indicador de páginas e botões de salto.
* **Spec Kit**: Formalização via Spec-Driven Development (`PRD.md`, `implementation_plan.md`, `task.md`).
