/**
 * pagination.js
 * Motor de Auto-Paginação Dinâmica e Construção do Livro para Turn.js
 */

(function(window) {
  'use strict';

  // Limite aproximado de caracteres por página para leitura confortável
  const CHARS_PER_PAGE = 750;

  /**
   * Divide o texto em blocos de páginas respeitando parágrafos inteiros
   */
  function splitChapterIntoPages(content) {
    if (!content) return [''];
    
    // Normaliza quebras de linha e divide em parágrafos
    const paragraphs = content
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (paragraphs.length === 0) return [''];

    const pages = [];
    let currentParagraphs = [];
    let currentCount = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const pLength = p.length;

      // Se somar este parágrafo estoura o limite e já temos algum parágrafo nesta página
      if (currentCount + pLength > CHARS_PER_PAGE && currentParagraphs.length > 0) {
        pages.push(currentParagraphs.join('\n\n'));
        currentParagraphs = [p];
        currentCount = pLength;
      } else {
        currentParagraphs.push(p);
        currentCount += pLength;
      }
    }

    if (currentParagraphs.length > 0) {
      pages.push(currentParagraphs.join('\n\n'));
    }

    return pages;
  }

  /**
   * Constrói o HTML de todo o livro e calcula as posições exatas do sumário
   */
  function generateBookStructure(dataStore) {
    const book = dataStore.getBook();
    const meta = book.meta;
    const chapters = dataStore.getPublishedChapters();

    const pagesHTML = [];
    let currentPageNum = 1;

    // 1. CAPA EXTERNA (Página 1 - Frente)
    const coverHTML = `
      <div class="page hard-cover page-cover page-num-1" data-page-type="cover">
        <div class="cover-inner">
          <div class="cover-ornament top-ornament">✦ ✦ ✦</div>
          <div class="cover-header">
            <span class="cover-badge">EDIÇÃO AUTORAL</span>
            <h1 class="cover-title">${escapeHTML(meta.title)}</h1>
            <div class="cover-divider"></div>
            <p class="cover-subtitle">${escapeHTML(meta.subtitle)}</p>
          </div>
          <div class="cover-center-art">
            <div class="cover-emboss-circle">
              <span class="cover-icon">📖</span>
            </div>
          </div>
          <div class="cover-footer">
            <p class="cover-author">${escapeHTML(meta.author)}</p>
            <p class="cover-year">${escapeHTML(meta.year || '2026')}</p>
          </div>
          <div class="cover-ornament bottom-ornament">✦ ✦ ✦</div>
        </div>
      </div>
    `;
    pagesHTML.push(coverHTML);
    currentPageNum++;

    // 2. FOLHA DE ROSTO & DEDICATÓRIA (Página 2 - Verso da Capa / Página Esquerda)
    const dedicationHTML = `
      <div class="page page-num-2 page-dedication" data-page-type="dedication">
        <div class="page-content">
          <div class="page-header-subtle">
            <span>MEMÓRIA & FILOSOFIA</span>
          </div>
          <div class="dedication-body">
            <div class="dedication-frame">
              <span class="quote-mark">“</span>
              <p class="dedication-text">${escapeHTML(meta.dedication || 'Sem dedicatória.')}</p>
              <div class="dedication-signature">— ${escapeHTML(meta.author)}</div>
            </div>
            <div class="imprint-box">
              <p><strong>Obra:</strong> ${escapeHTML(meta.title)}</p>
              <p><strong>Autor:</strong> ${escapeHTML(meta.author)}</p>
              <p><strong>Plataforma:</strong> Livro Aberto (FOSS & Local-First)</p>
              <p class="imprint-note">Escrito e diagramado soberanamente pelo autor.</p>
            </div>
          </div>
          <div class="page-footer">
            <span class="page-number">ii</span>
          </div>
        </div>
      </div>
    `;
    pagesHTML.push(dedicationHTML);
    currentPageNum++;

    // 3. SUMÁRIO (Página 3 - Página Direita)
    // O sumário começará na página 3. Precisamos calcular antecipadamente as páginas de cada capítulo
    const chapterMap = [];
    let runningPage = 4; // Primeiro capítulo começará na página 4

    chapters.forEach((chap, idx) => {
      const pChunks = splitChapterIntoPages(chap.content);
      chapterMap.push({
        chapter: chap,
        startPage: runningPage,
        pageCount: pChunks.length,
        chunks: pChunks
      });
      runningPage += pChunks.length;
    });

    const tocItemsHTML = chapterMap.map((item, idx) => `
      <li class="toc-item" data-jump-to="${item.startPage}">
        <div class="toc-item-left">
          <span class="toc-num">${idx + 1}.</span>
          <span class="toc-title">${escapeHTML(item.chapter.title)}</span>
        </div>
        <span class="toc-dots"></span>
        <span class="toc-page">${item.startPage}</span>
      </li>
    `).join('');

    const tocHTML = `
      <div class="page page-num-3 page-toc" data-page-type="toc">
        <div class="page-content">
          <div class="page-header-subtle">
            <span>SUMÁRIO DA OBRA</span>
          </div>
          <div class="toc-body">
            <h2 class="toc-heading">Índice dos Textos</h2>
            <div class="toc-divider"></div>
            ${chapters.length > 0 ? `<ul class="toc-list">${tocItemsHTML}</ul>` : '<p class="empty-book-msg">Nenhum capítulo publicado ainda. Acesse o Modo Autor para começar a escrever.</p>'}
          </div>
          <div class="page-footer">
            <span class="page-number">iii</span>
          </div>
        </div>
      </div>
    `;
    pagesHTML.push(tocHTML);
    currentPageNum++;

    // 4. PÁGINAS DOS CAPÍTULOS
    chapterMap.forEach((item, cIdx) => {
      item.chunks.forEach((chunk, pageInChapter) => {
        const isFirstPage = (pageInChapter === 0);
        const isEven = (currentPageNum % 2 === 0);
        const alignClass = isEven ? 'page-left' : 'page-right';

        // Converte quebras duplas em parágrafos HTML
        const paragraphsHTML = chunk
          .split(/\n\n+/)
          .map((p, pIdx) => {
            const dropCapClass = (isFirstPage && pIdx === 0) ? 'first-paragraph with-dropcap' : '';
            return `<p class="${dropCapClass}">${escapeHTML(p)}</p>`;
          })
          .join('');

        const headerTitle = isFirstPage ? '' : escapeHTML(item.chapter.title);

        const pageHTML = `
          <div class="page page-num-${currentPageNum} ${alignClass} page-text" data-page-type="content">
            <div class="page-content">
              <div class="page-header-subtle">
                <span class="header-chapter-title">${headerTitle}</span>
              </div>
              <div class="reading-body">
                ${isFirstPage ? `
                  <div class="chapter-start-header">
                    <span class="chapter-label">Capítulo ${cIdx + 1}</span>
                    <h2 class="chapter-main-title">${escapeHTML(item.chapter.title)}</h2>
                    ${item.chapter.subtitle ? `<p class="chapter-subtitle">${escapeHTML(item.chapter.subtitle)}</p>` : ''}
                    ${item.chapter.date ? `<div class="chapter-date">${escapeHTML(item.chapter.date)}</div>` : ''}
                    <div class="chapter-divider"></div>
                  </div>
                ` : ''}
                <div class="prose-content">
                  ${paragraphsHTML}
                </div>
              </div>
              <div class="page-footer">
                <span class="page-number">${currentPageNum}</span>
              </div>
            </div>
          </div>
        `;
        pagesHTML.push(pageHTML);
        currentPageNum++;
      });
    });

    // 5. GARANTIR PARIDADE PARA FECHAMENTO DO LIVRO
    // Se o número de páginas for ímpar antes da contracapa, insere página de anotações
    if (currentPageNum % 2 !== 0) {
      const blankPageHTML = `
        <div class="page page-num-${currentPageNum} page-left page-notes" data-page-type="notes">
          <div class="page-content">
            <div class="page-header-subtle"><span>NOTAS DO LEITOR</span></div>
            <div class="notes-lines">
              <div class="notes-hint">Espaço reservado para pensamentos e apontamentos livres.</div>
              <div class="line"></div><div class="line"></div><div class="line"></div>
              <div class="line"></div><div class="line"></div><div class="line"></div>
            </div>
            <div class="page-footer"><span class="page-number">${currentPageNum}</span></div>
          </div>
        </div>
      `;
      pagesHTML.push(blankPageHTML);
      currentPageNum++;
    }

    // 6. CONTRACAPA (Hard Cover de Encerramento)
    const backCoverHTML = `
      <div class="page hard-cover page-back-cover page-num-${currentPageNum}" data-page-type="back-cover">
        <div class="cover-inner back-inner">
          <div class="cover-ornament top-ornament">✦ ✦ ✦</div>
          <div class="back-cover-body">
            <div class="quote-colophon">
              <p>“Ensinar é um exercício de imortalidade. De alguma forma continuamos a viver naqueles cujos olhos aprenderam a ver o mundo pela magia da nossa palavra.”</p>
            </div>
            <div class="colophon-divider"></div>
            <div class="colophon-meta">
              <p class="brand">LIVRO ABERTO</p>
              <p class="author-sign">${escapeHTML(meta.author)}</p>
              <p class="sub">${escapeHTML(meta.subtitle)}</p>
            </div>
          </div>
          <div class="cover-ornament bottom-ornament">✦ ✦ ✦</div>
        </div>
      </div>
    `;
    pagesHTML.push(backCoverHTML);

    return {
      html: pagesHTML.join('\n'),
      totalPages: pagesHTML.length,
      chapterMap: chapterMap
    };
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

  window.LivroPagination = {
    generateBookStructure,
    splitChapterIntoPages
  };

})(window);
