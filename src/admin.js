/**
 * admin.js
 * Painel Administrativo do Autor & Editor Soberano do Livro Aberto
 */

(function(window) {
  'use strict';

  let isAuthenticated = false;
  let activeTab = 'chapters'; // 'chapters' | 'editor' | 'settings' | 'backup'
  let editingChapterId = null;

  // Inicializa os listeners e componentes quando o DOM estiver pronto
  function initAdmin() {
    renderAdminUI();
    bindEvents();
  }

  function renderAdminUI() {
    // 1. Botão flutuante discreto no canto
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'admin-trigger-btn';
    triggerBtn.className = 'admin-trigger-btn';
    triggerBtn.setAttribute('title', 'Modo Autor / Painel de Escrita (Ctrl+Shift+A)');
    triggerBtn.innerHTML = `
      <span class="admin-btn-icon">✍️</span>
      <span class="admin-btn-label">Modo Autor</span>
    `;
    document.body.appendChild(triggerBtn);

    // 2. Modal Container
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'admin-modal-overlay';
    modalOverlay.className = 'admin-modal-overlay hidden';
    modalOverlay.innerHTML = `
      <div class="admin-modal-panel">
        <div class="admin-panel-header">
          <div class="header-brand">
            <span class="header-icon">🖋️</span>
            <div>
              <h3 class="panel-title">Estúdio do Autor</h3>
              <p class="panel-subtitle">Livro Aberto • Soberania & Escrita Livre</p>
            </div>
          </div>
          <button id="admin-close-btn" class="admin-close-btn" title="Fechar (Esc)">&times;</button>
        </div>

        <!-- TELA DE LOGIN -->
        <div id="admin-auth-view" class="admin-view">
          <div class="auth-card">
            <div class="auth-icon-wrap">🔒</div>
            <h4>Acesso do Escritor</h4>
            <p class="auth-desc">Digite sua senha ou PIN de autor para gerenciar o livro.</p>
            <div class="input-group">
              <input type="password" id="admin-pin-input" placeholder="Digite seu PIN (padrão: 1234)" autofocus />
              <button id="admin-login-submit" class="btn-primary">Entrar</button>
            </div>
            <p id="auth-error-msg" class="auth-error hidden">PIN incorreto. Tente novamente.</p>
            <p class="auth-hint">Dica: O PIN padrão inicial de fábrica é <code>1234</code>.</p>
          </div>
        </div>

        <!-- TELA DO PAINEL LOGADO -->
        <div id="admin-dashboard-view" class="admin-view hidden">
          <!-- BARRA DE NAVEGAÇÃO DAS ABAS -->
          <nav class="admin-tabs">
            <button class="tab-btn active" data-tab="chapters">
              <span class="tab-icon">📚</span> Capítulos (<span id="tab-chap-count">0</span>)
            </button>
            <button class="tab-btn" data-tab="editor">
              <span class="tab-icon">✍️</span> Editor de Texto
            </button>
            <button class="tab-btn" data-tab="settings">
              <span class="tab-icon">⚙️</span> Metadados da Obra
            </button>
            <button class="tab-btn" data-tab="backup">
              <span class="tab-icon">💾</span> Backup & Exportar
            </button>
          </nav>

          <!-- CONTEÚDO DAS ABAS -->
          <div class="tab-content-area">

            <!-- ABA 1: LISTA DE CAPÍTULOS -->
            <div id="tab-content-chapters" class="tab-pane active">
              <div class="pane-action-bar">
                <button id="btn-new-chapter" class="btn-primary">
                  <span>+</span> Novo Capítulo / Ensaio
                </button>
                <div class="pane-search-wrap">
                  <input type="text" id="chapter-search" placeholder="Buscar textos..." />
                </div>
              </div>
              <div class="chapters-table-wrap">
                <table class="chapters-table">
                  <thead>
                    <tr>
                      <th style="width: 50px;">Ordem</th>
                      <th>Título & Subtítulo</th>
                      <th style="width: 140px;">Data</th>
                      <th style="width: 100px;">Status</th>
                      <th style="width: 170px; text-align: right;">Ações</th>
                    </tr>
                  </thead>
                  <tbody id="chapters-list-tbody">
                    <!-- Gerado dinamicamente -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ABA 2: EDITOR DE TEXTO -->
            <div id="tab-content-editor" class="tab-pane hidden">
              <form id="chapter-editor-form" class="editor-form">
                <input type="hidden" id="editor-chap-id" value="" />
                
                <div class="form-row two-cols">
                  <div class="form-group">
                    <label for="editor-title">Título do Capítulo / Crônica *</label>
                    <input type="text" id="editor-title" required placeholder="Ex: O Valor da Razão e da Poesia" />
                  </div>
                  <div class="form-group">
                    <label for="editor-subtitle">Subtítulo ou Epígrafe</label>
                    <input type="text" id="editor-subtitle" placeholder="Ex: Reflexões sobre o cotidiano pedagógico" />
                  </div>
                </div>

                <div class="form-row two-cols">
                  <div class="form-group">
                    <label for="editor-date">Data / Época</label>
                    <input type="text" id="editor-date" placeholder="Ex: Novembro de 2026" />
                  </div>
                  <div class="form-group checkbox-group">
                    <label class="switch-label">
                      <input type="checkbox" id="editor-published" checked />
                      <span class="switch-slider"></span>
                      <span class="switch-text">Publicado no livro visível</span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <div class="editor-label-bar">
                    <label for="editor-content">Corpo do Texto *</label>
                    <span id="word-char-count" class="word-counter">0 palavras | 0 caracteres</span>
                  </div>
                  <textarea id="editor-content" rows="13" required placeholder="Escreva aqui suas reflexões, crônicas ou poemas..."></textarea>
                  <div class="editor-tips">
                    <small>💡 Dica: Dê dois "Enters" para criar novos parágrafos. O motor de auto-paginação dividirá seu texto em páginas harmoniosas automaticamente.</small>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" id="btn-cancel-editor" class="btn-secondary">Cancelar</button>
                  <button type="submit" id="btn-save-chapter" class="btn-primary">
                    <span>💾</span> Salvar e Diagramar no Livro
                  </button>
                </div>
              </form>
            </div>

            <!-- ABA 3: CONFIGURAÇÃO DA OBRA -->
            <div id="tab-content-settings" class="tab-pane hidden">
              <form id="book-settings-form" class="settings-form">
                <div class="form-section-title">Informações da Capa e da Obra</div>
                <div class="form-row two-cols">
                  <div class="form-group">
                    <label for="settings-title">Título Principal do Livro</label>
                    <input type="text" id="settings-title" required />
                  </div>
                  <div class="form-group">
                    <label for="settings-subtitle">Subtítulo da Obra</label>
                    <input type="text" id="settings-subtitle" />
                  </div>
                </div>

                <div class="form-row two-cols">
                  <div class="form-group">
                    <label for="settings-author">Nome do Autor</label>
                    <input type="text" id="settings-author" required />
                  </div>
                  <div class="form-group">
                    <label for="settings-year">Ano / Edição</label>
                    <input type="text" id="settings-year" />
                  </div>
                </div>

                <div class="form-group">
                  <label for="settings-dedication">Dedicatória & Mensagem Inicial</label>
                  <textarea id="settings-dedication" rows="3"></textarea>
                </div>

                <div class="form-section-title" style="margin-top: 25px;">Segurança do Autor</div>
                <div class="form-row two-cols">
                  <div class="form-group">
                    <label for="settings-new-pin">Novo PIN de Acesso (mínimo 4 caracteres)</label>
                    <input type="password" id="settings-new-pin" placeholder="Deixe em branco para manter o atual" />
                  </div>
                  <div class="form-group">
                    <label for="settings-new-pin-confirm">Confirmar Novo PIN</label>
                    <input type="password" id="settings-new-pin-confirm" placeholder="Repita o novo PIN" />
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary"><span>💾</span> Atualizar Informações da Obra</button>
                </div>
              </form>
            </div>

            <!-- ABA 4: BACKUP & EXPORTAR -->
            <div id="tab-content-backup" class="tab-pane hidden">
              <div class="backup-cards-grid">
                <div class="backup-card">
                  <div class="b-icon">📥</div>
                  <h4>Exportar Obra Completa</h4>
                  <p>Baixe todos os seus textos, capítulos, dedicatória e configurações em um arquivo seguro <code>.json</code>. Ideal para backups e transferências.</p>
                  <button id="btn-export-json" class="btn-accent">Baixar Arquivo de Backup (.json)</button>
                </div>

                <div class="backup-card">
                  <div class="b-icon">📤</div>
                  <h4>Restaurar / Importar Backup</h4>
                  <p>Carregue um arquivo de backup previamente exportado para restaurar ou sincronizar seus textos.</p>
                  <input type="file" id="import-json-file" accept=".json" style="display: none;" />
                  <button id="btn-import-trigger" class="btn-secondary">Selecionar Arquivo .json</button>
                </div>
              </div>

              <div class="sovereignty-badge">
                <span>🛡️ Soberania 100% Local-First: Seus textos não dependem de bancos externos ou servidores proprietários.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // 3. Container de Toasts / Notificações
    const toastContainer = document.createElement('div');
    toastContainer.id = 'admin-toast-container';
    toastContainer.className = 'admin-toast-container';
    document.body.appendChild(toastContainer);
  }

  function showToast(message, type = 'success') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : '⚠️'}</span>
      <span class="toast-text">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  function bindEvents() {
    const triggerBtn = document.getElementById('admin-trigger-btn');
    const overlay = document.getElementById('admin-modal-overlay');
    const closeBtn = document.getElementById('admin-close-btn');

    // Abrir modal
    const openModal = () => {
      overlay.classList.remove('hidden');
      if (!isAuthenticated) {
        document.getElementById('admin-auth-view').classList.remove('hidden');
        document.getElementById('admin-dashboard-view').classList.add('hidden');
        setTimeout(() => document.getElementById('admin-pin-input').focus(), 150);
      } else {
        renderDashboard();
      }
    };

    // Fechar modal
    const closeModal = () => {
      overlay.classList.add('hidden');
    };

    triggerBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    // Atalhos de teclado (Ctrl + Shift + A para abrir, Esc para fechar)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (overlay.classList.contains('hidden')) {
          openModal();
        } else {
          closeModal();
        }
      } else if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        closeModal();
      }
    });

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Submissão do PIN
    const pinInput = document.getElementById('admin-pin-input');
    const loginBtn = document.getElementById('admin-login-submit');
    const errorMsg = document.getElementById('auth-error-msg');

    const handleLogin = async () => {
      const pin = pinInput.value;
      const isValid = await window.LivroDataStore.verifyPin(pin);
      if (isValid) {
        isAuthenticated = true;
        errorMsg.classList.add('hidden');
        pinInput.value = '';
        document.getElementById('admin-auth-view').classList.add('hidden');
        document.getElementById('admin-dashboard-view').classList.remove('hidden');
        renderDashboard();
        showToast('Acesso de autor concedido. Bem-vindo, Sérgio!');
      } else {
        errorMsg.classList.remove('hidden');
        pinInput.select();
      }
    };

    loginBtn.addEventListener('click', handleLogin);
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });

    // Troca de Abas
    const tabButtons = document.querySelectorAll('.admin-tabs .tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Ações de Capítulos
    document.getElementById('btn-new-chapter').addEventListener('click', () => {
      openEditorForNew();
    });

    document.getElementById('chapter-search').addEventListener('input', (e) => {
      renderChaptersTable(e.target.value);
    });

    // Contador de palavras/caracteres do editor
    const editorContent = document.getElementById('editor-content');
    const countDisplay = document.getElementById('word-char-count');
    editorContent.addEventListener('input', () => {
      const text = editorContent.value.trim();
      const words = text ? text.split(/\s+/).length : 0;
      const chars = editorContent.value.length;
      countDisplay.textContent = `${words} palavras | ${chars} caracteres`;
    });

    // Salvar Capítulo Form
    const editorForm = document.getElementById('chapter-editor-form');
    editorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editor-chap-id').value;
      const title = document.getElementById('editor-title').value.trim();
      const subtitle = document.getElementById('editor-subtitle').value.trim();
      const date = document.getElementById('editor-date').value.trim();
      const published = document.getElementById('editor-published').checked;
      const content = document.getElementById('editor-content').value;

      window.LivroDataStore.saveChapter({
        id: id || undefined,
        title,
        subtitle,
        date,
        published,
        content
      });

      showToast(`Capítulo "${title}" gravado e diagramado com sucesso!`);
      notifyBookUpdated();
      switchTab('chapters');
    });

    document.getElementById('btn-cancel-editor').addEventListener('click', () => {
      switchTab('chapters');
    });

    // Salvar Metadados da Obra
    const settingsForm = document.getElementById('book-settings-form');
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('settings-title').value.trim();
      const subtitle = document.getElementById('settings-subtitle').value.trim();
      const author = document.getElementById('settings-author').value.trim();
      const year = document.getElementById('settings-year').value.trim();
      const dedication = document.getElementById('settings-dedication').value.trim();

      const newPin = document.getElementById('settings-new-pin').value;
      const confirmPin = document.getElementById('settings-new-pin-confirm').value;

      if (newPin) {
        if (newPin !== confirmPin) {
          showToast('Os campos de confirmação do novo PIN não coincidem.', 'warning');
          return;
        }
        if (newPin.length < 4) {
          showToast('O PIN deve ter no mínimo 4 caracteres.', 'warning');
          return;
        }
        await window.LivroDataStore.updatePin(newPin);
        showToast('PIN de autor atualizado com segurança.');
        document.getElementById('settings-new-pin').value = '';
        document.getElementById('settings-new-pin-confirm').value = '';
      }

      window.LivroDataStore.updateMeta({
        title,
        subtitle,
        author,
        year,
        dedication
      });

      showToast('Informações da obra salvas!');
      notifyBookUpdated();
    });

    // Exportação JSON
    document.getElementById('btn-export-json').addEventListener('click', () => {
      window.LivroDataStore.exportJSON();
      showToast('Arquivo de backup baixado com sucesso!');
    });

    // Importação JSON
    const fileInput = document.getElementById('import-json-file');
    document.getElementById('btn-import-trigger').addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = window.LivroDataStore.importJSON(event.target.result);
        if (result.success) {
          showToast('Obra importada e restaurada com sucesso!');
          renderDashboard();
          notifyBookUpdated();
        } else {
          showToast(`Erro na importação: ${result.error}`, 'warning');
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
    });
  }

  function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-content-area .tab-pane').forEach(p => {
      p.classList.toggle('hidden', p.id !== `tab-content-${tabId}`);
      p.classList.toggle('active', p.id === `tab-content-${tabId}`);
    });

    if (tabId === 'chapters') {
      renderChaptersTable();
    } else if (tabId === 'settings') {
      populateSettingsForm();
    }
  }

  function renderDashboard() {
    renderChaptersTable();
    populateSettingsForm();
  }

  function renderChaptersTable(filterQuery = '') {
    const chapters = window.LivroDataStore.getAllChapters();
    document.getElementById('tab-chap-count').textContent = chapters.length;

    const tbody = document.getElementById('chapters-list-tbody');
    tbody.innerHTML = '';

    const query = filterQuery.toLowerCase().trim();
    const filtered = query 
      ? chapters.filter(c => c.title.toLowerCase().includes(query) || (c.subtitle && c.subtitle.toLowerCase().includes(query)))
      : chapters;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-table-row">
            Nenhum capítulo encontrado. Clique em "+ Novo Capítulo" para começar.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((chap, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="col-order">
          <span class="order-badge">${chap.order}</span>
        </td>
        <td class="col-title">
          <div class="chap-title-line">${escapeHTML(chap.title)}</div>
          ${chap.subtitle ? `<div class="chap-subtitle-line">${escapeHTML(chap.subtitle)}</div>` : ''}
        </td>
        <td class="col-date">${escapeHTML(chap.date || '—')}</td>
        <td class="col-status">
          <span class="status-badge ${chap.published ? 'status-published' : 'status-draft'}">
            ${chap.published ? 'Publicado' : 'Rascunho'}
          </span>
        </td>
        <td class="col-actions">
          <button class="btn-action btn-move-up" title="Subir ordem" data-id="${chap.id}" ${idx === 0 ? 'disabled' : ''}>▲</button>
          <button class="btn-action btn-move-down" title="Descer ordem" data-id="${chap.id}" ${idx === filtered.length - 1 ? 'disabled' : ''}>▼</button>
          <button class="btn-action btn-edit" title="Editar texto" data-id="${chap.id}">✏️</button>
          <button class="btn-action btn-delete" title="Excluir" data-id="${chap.id}">🗑️</button>
        </td>
      `;

      // Eventos dos botões da linha
      tr.querySelector('.btn-move-up').addEventListener('click', () => {
        window.LivroDataStore.moveChapter(chap.id, 'up');
        renderChaptersTable(filterQuery);
        notifyBookUpdated();
      });

      tr.querySelector('.btn-move-down').addEventListener('click', () => {
        window.LivroDataStore.moveChapter(chap.id, 'down');
        renderChaptersTable(filterQuery);
        notifyBookUpdated();
      });

      tr.querySelector('.btn-edit').addEventListener('click', () => {
        openEditorForExisting(chap.id);
      });

      tr.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja excluir o capítulo "${chap.title}"?`)) {
          window.LivroDataStore.deleteChapter(chap.id);
          showToast(`Capítulo "${chap.title}" removido.`);
          renderChaptersTable(filterQuery);
          notifyBookUpdated();
        }
      });

      tbody.appendChild(tr);
    });
  }

  function openEditorForNew() {
    editingChapterId = null;
    document.getElementById('editor-chap-id').value = '';
    document.getElementById('editor-title').value = '';
    document.getElementById('editor-subtitle').value = '';
    document.getElementById('editor-date').value = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    document.getElementById('editor-published').checked = true;
    document.getElementById('editor-content').value = '';
    document.getElementById('word-char-count').textContent = '0 palavras | 0 caracteres';

    switchTab('editor');
    setTimeout(() => document.getElementById('editor-title').focus(), 150);
  }

  function openEditorForExisting(chapterId) {
    const chap = window.LivroDataStore.getChapter(chapterId);
    if (!chap) return;

    editingChapterId = chapterId;
    document.getElementById('editor-chap-id').value = chap.id;
    document.getElementById('editor-title').value = chap.title || '';
    document.getElementById('editor-subtitle').value = chap.subtitle || '';
    document.getElementById('editor-date').value = chap.date || '';
    document.getElementById('editor-published').checked = !!chap.published;
    document.getElementById('editor-content').value = chap.content || '';

    const text = (chap.content || '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    document.getElementById('word-char-count').textContent = `${words} palavras | ${(chap.content || '').length} caracteres`;

    switchTab('editor');
    setTimeout(() => document.getElementById('editor-title').focus(), 150);
  }

  function populateSettingsForm() {
    const meta = window.LivroDataStore.getBook().meta;
    document.getElementById('settings-title').value = meta.title || '';
    document.getElementById('settings-subtitle').value = meta.subtitle || '';
    document.getElementById('settings-author').value = meta.author || 'Sérgio';
    document.getElementById('settings-year').value = meta.year || '2026';
    document.getElementById('settings-dedication').value = meta.dedication || '';
  }

  function notifyBookUpdated() {
    window.dispatchEvent(new CustomEvent('livro:updated'));
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.LivroAdmin = {
    init: initAdmin,
    open: () => document.getElementById('admin-trigger-btn').click(),
    showToast
  };

})(window);
