/**
 * data-store.js
 * Módulo de persistência soberana e gerenciamento de dados do Livro Aberto.
 * Arquitetura Local-First (sem dependência de serviços externos).
 */

const STORAGE_KEY = 'livro_aberto_db_v1';

// Dados padrão iniciais (Seed)
const DEFAULT_BOOK_DATA = {
  meta: {
    title: 'Livro Aberto',
    subtitle: 'Crônicas, Filosofia e Memórias Pedagógicas',
    author: 'Sérgio',
    year: '2026',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    coverBgColor: '#1e1b18',
    dedication: 'Dedicado aos estudantes, colegas educadores e a todos que buscam no conhecimento e na reflexão um caminho para a emancipação humana.'
  },
  auth: {
    // PIN padrão inicial: "1234" (armazenado em hash simples)
    pinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4' // sha256 de "1234"
  },
  chapters: [
    {
      id: 'cap-1',
      title: 'A Ágora Escolar',
      subtitle: 'O diálogo como ferramenta pedagógica',
      date: 'Novembro de 2026',
      published: true,
      order: 1,
      content: `A sala de aula não é um repositório inerte de instruções prontas, mas sim uma praça viva — uma autêntica ágora moderna onde o pensamento se forja no confronto generoso de ideias.

Quando nos dispomos a escutar verdadeiramente o educando, transformamos o ato de ensinar em uma experiência filosófica compartilhada. Não se trata apenas de transmitir conteúdos curriculares obrigatórios, mas de despertar a inquietação sadia: a dúvida que questiona o óbvio e convida à autonomia intelectual.

Na escola pública, essa vocação se torna ainda mais nobre. Cada aluno traz consigo o peso de realidades densas e a potência de saberes comunitários que merecem ser acolhidos e elevados ao patamar do diálogo crítico.`
    },
    {
      id: 'cap-2',
      title: 'Tempo e Memória',
      subtitle: 'Raízes, história e pertencimento',
      date: 'Novembro de 2026',
      published: true,
      order: 2,
      content: `O historiador não é apenas aquele que perscruta o passado com o rigor dos arquivos, mas quem compreende como as correntes invisíveis do tempo moldam o presente que habitamos.

Em cada esquina, em cada relato oral passado de geração em geração, sobrevive uma herança cultural que resiste ao esquecimento. A memória é a âncora que nos impede de sermos arrastados pela superficialidade de um mundo apressado.

Ensinar História é oferecer às novas gerações as chaves para que possam ler sua própria ancestralidade com dignidade e projetar futuros mais justos.`
    },
    {
      id: 'cap-3',
      title: 'A Estética do Saber',
      subtitle: 'A beleza escondida no ato de aprender',
      date: 'Novembro de 2026',
      published: true,
      order: 3,
      content: `Há uma poesia silenciosa quando uma criança desvenda o sentido de uma frase ou quando um jovem compreende a mecânica de um acontecimento histórico.

Essa experiência estética do conhecimento não deve ser ofuscada pelo imediatismo utilitarista. Ler um bom livro, sentir o toque de suas páginas e saborear as palavras com calma é um ato de resistência e celebração da imaginação humana.`
    }
  ]
};

// Utilitário de Hashing SHA-256 com fallback em puro JS
async function sha256(message) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('crypto.subtle indisponível no contexto, utilizando fallback.');
    }
  }
  // Algoritmo SHA-256 em puro JS como fallback de máxima compatibilidade
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = message[lengthProperty] * 8;
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  let compositeLength = message[lengthProperty];
  for (i = 0; i < compositeLength; i++) {
    const code = message.charCodeAt(i);
    words[i >> 2] |= (code & 0xff) << ((3 - (i % 4)) * 8);
  }
  words[compositeLength >> 2] |= 0x80 << ((3 - (compositeLength % 4)) * 8);
  words[(((compositeLength + 8) >> 6) << 4) + 15] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash.slice(0);
    for (i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    for (i = 0; i < 64; i++) {
      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1 + ch + k[i] + w[i]) | 0;
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;
      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Classe DataStore Local-First
class DataStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Garante integridade estrutural
        return {
          meta: { ...DEFAULT_BOOK_DATA.meta, ...(parsed.meta || {}) },
          auth: { ...DEFAULT_BOOK_DATA.auth, ...(parsed.auth || {}) },
          chapters: Array.isArray(parsed.chapters) ? parsed.chapters : DEFAULT_BOOK_DATA.chapters
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do LocalStorage, restaurando padrões:', e);
    }
    // Salva os dados padrão iniciais se for o primeiro acesso
    this.saveToStorage(DEFAULT_BOOK_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_BOOK_DATA));
  }

  saveToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Falha ao gravar no LocalStorage:', e);
      return false;
    }
  }

  getBook() {
    return this.data;
  }

  getPublishedChapters() {
    return this.data.chapters
      .filter(c => c.published)
      .sort((a, b) => a.order - b.order);
  }

  getAllChapters() {
    return [...this.data.chapters].sort((a, b) => a.order - b.order);
  }

  getChapter(id) {
    return this.data.chapters.find(c => c.id === id);
  }

  saveChapter(chapter) {
    const chapters = this.data.chapters;
    const index = chapters.findIndex(c => c.id === chapter.id);

    if (index >= 0) {
      // Atualizar existente mantendo id
      chapters[index] = { ...chapters[index], ...chapter };
    } else {
      // Novo capítulo
      const newChapter = {
        id: chapter.id || 'cap-' + Date.now(),
        title: chapter.title || 'Sem Título',
        subtitle: chapter.subtitle || '',
        date: chapter.date || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        published: chapter.published !== undefined ? chapter.published : true,
        order: chapter.order || (chapters.length + 1),
        content: chapter.content || ''
      };
      chapters.push(newChapter);
    }

    this.saveToStorage(this.data);
    return true;
  }

  deleteChapter(id) {
    this.data.chapters = this.data.chapters.filter(c => c.id !== id);
    // Reordenar ordens sequenciais
    this.data.chapters.sort((a, b) => a.order - b.order).forEach((c, idx) => {
      c.order = idx + 1;
    });
    this.saveToStorage(this.data);
    return true;
  }

  moveChapter(id, direction) {
    const chapters = this.getAllChapters();
    const index = chapters.findIndex(c => c.id === id);
    if (index < 0) return false;

    if (direction === 'up' && index > 0) {
      const prev = chapters[index - 1];
      const curr = chapters[index];
      const tempOrder = prev.order;
      prev.order = curr.order;
      curr.order = tempOrder;
    } else if (direction === 'down' && index < chapters.length - 1) {
      const next = chapters[index + 1];
      const curr = chapters[index];
      const tempOrder = next.order;
      next.order = curr.order;
      curr.order = tempOrder;
    }

    this.data.chapters = chapters;
    this.saveToStorage(this.data);
    return true;
  }

  updateMeta(meta) {
    this.data.meta = { ...this.data.meta, ...meta };
    this.saveToStorage(this.data);
    return true;
  }

  async verifyPin(inputPin) {
    if (!inputPin) return false;
    const hash = await sha256(inputPin.trim());
    return hash === this.data.auth.pinHash;
  }

  async updatePin(newPin) {
    if (!newPin || newPin.trim().length < 4) return false;
    this.data.auth.pinHash = await sha256(newPin.trim());
    this.saveToStorage(this.data);
    return true;
  }

  exportJSON() {
    const exportData = {
      ...this.data,
      exportedAt: new Date().toISOString(),
      app: 'Livro Aberto Flipbook'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livro_aberto_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.chapters || !parsed.meta) {
        throw new Error('Formato de arquivo inválido: ausência de metadados ou capítulos.');
      }
      this.data.meta = { ...this.data.meta, ...parsed.meta };
      this.data.chapters = parsed.chapters;
      if (parsed.auth && parsed.auth.pinHash) {
        this.data.auth.pinHash = parsed.auth.pinHash;
      }
      this.saveToStorage(this.data);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_BOOK_DATA));
    this.saveToStorage(this.data);
    return true;
  }
}

// Instância global exposta
window.LivroDataStore = new DataStore();
