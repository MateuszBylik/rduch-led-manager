import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// ============================================================================
// 1. DANE I SŁOWNIKI
// ============================================================================
// Kompletny słownik czcionki 5x8 (ASCII + Polskie Znaki)
const font5x8: Record<string, number[]> = {
  // --- SPACJA I ZNAKI INTERPUNKCYJNE ---
  ' ': [0, 0, 0, 0, 0, 0, 0, 0],
  '!': [4, 4, 4, 4, 4, 0, 4, 0],
  '"': [10, 10, 10, 0, 0, 0, 0, 0],
  '#': [10, 10, 31, 10, 31, 10, 10, 0],
  '$': [4, 15, 20, 14, 5, 30, 4, 0],
  '%': [24, 25, 2, 4, 8, 19, 3, 0],
  '&': [12, 18, 20, 8, 21, 18, 13, 0],
  '\'': [0, 16, 8, 4, 2, 1, 0, 0],
  '(': [2, 4, 8, 8, 8, 4, 2, 0],
  ')': [8, 4, 2, 2, 2, 4, 8, 0],
  '*': [0, 4, 21, 14, 21, 4, 0, 0],
  '+': [0, 4, 4, 31, 4, 4, 0, 0],
  ',': [0, 0, 0, 0, 0, 12, 4, 8],
  '-': [0, 0, 0, 31, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 24, 24, 0],
  '/': [0, 1, 2, 4, 8, 16, 0, 0],
  ':': [0, 0, 12, 12, 0, 12, 12, 0],
  ';': [0, 0, 12, 12, 0, 12, 4, 8],
  '<': [2, 4, 8, 16, 8, 4, 2, 0],
  '=': [0, 0, 31, 0, 31, 0, 0, 0],
  '>': [8, 4, 2, 1, 2, 4, 8, 0],
  '?': [14, 17, 1, 2, 4, 0, 4, 0],
  '@': [14, 17, 1, 9, 21, 21, 14, 0],
  '[': [14, 8, 8, 8, 8, 8, 14, 0],
  '\\': [0, 16, 8, 4, 2, 1, 0, 0],
  ']': [14, 2, 2, 2, 2, 2, 14, 0],
  '^': [4, 10, 17, 0, 0, 0, 0, 0],
  '_': [0, 0, 0, 0, 0, 0, 31, 0],
  '`': [16, 8, 4, 0, 0, 0, 0, 0],
  '{': [2, 4, 4, 8, 4, 4, 2, 0],
  '|': [4, 4, 4, 4, 4, 4, 4, 0],
  '}': [8, 4, 4, 2, 4, 4, 8, 0],
  '~': [8, 21, 2, 0, 0, 0, 0, 0],

  // --- CYFRY ---
  '0': [14, 17, 19, 21, 25, 17, 14, 0],
  '1': [4, 12, 4, 4, 4, 4, 14, 0],
  '2': [14, 17, 1, 2, 4, 8, 31, 0],
  '3': [31, 2, 4, 2, 1, 17, 14, 0],
  '4': [2, 6, 10, 18, 31, 2, 2, 0],
  '5': [31, 16, 30, 1, 1, 17, 14, 0],
  '6': [6, 8, 16, 30, 17, 17, 14, 0],
  '7': [31, 1, 2, 4, 8, 8, 8, 0],
  '8': [14, 17, 17, 14, 17, 17, 14, 0],
  '9': [14, 17, 17, 15, 1, 2, 12, 0],

  // --- DUŻE LITERY ALFABETU ---
  'A': [14, 17, 17, 31, 17, 17, 17, 0],
  'B': [30, 17, 17, 30, 17, 17, 30, 0],
  'C': [14, 17, 16, 16, 16, 17, 14, 0],
  'D': [30, 17, 17, 17, 17, 17, 30, 0],
  'E': [31, 16, 16, 30, 16, 16, 31, 0],
  'F': [31, 16, 16, 30, 16, 16, 16, 0],
  'G': [14, 17, 16, 23, 17, 17, 15, 0],
  'H': [17, 17, 17, 31, 17, 17, 17, 0],
  'I': [14, 4, 4, 4, 4, 4, 14, 0],
  'J': [7, 2, 2, 2, 2, 18, 12, 0],
  'K': [17, 18, 20, 24, 20, 18, 17, 0],
  'L': [16, 16, 16, 16, 16, 16, 31, 0],
  'M': [17, 27, 21, 17, 17, 17, 17, 0],
  'N': [17, 17, 25, 21, 19, 17, 17, 0],
  'O': [14, 17, 17, 17, 17, 17, 14, 0],
  'P': [30, 17, 17, 30, 16, 16, 16, 0],
  'Q': [14, 17, 17, 17, 21, 18, 13, 0],
  'R': [30, 17, 17, 30, 20, 18, 17, 0],
  'S': [15, 16, 16, 14, 1, 1, 30, 0],
  'T': [31, 4, 4, 4, 4, 4, 4, 0],
  'U': [17, 17, 17, 17, 17, 17, 14, 0],
  'V': [17, 17, 17, 17, 17, 10, 4, 0],
  'W': [17, 17, 17, 21, 21, 21, 10, 0],
  'X': [17, 17, 10, 4, 10, 17, 17, 0],
  'Y': [17, 17, 17, 10, 4, 4, 4, 0],
  'Z': [31, 1, 2, 4, 8, 16, 31, 0],

  // --- MAŁE LITERY ALFABETU ---
  'a': [0, 0, 14, 1, 15, 17, 15, 0],
  'b': [16, 16, 30, 17, 17, 17, 30, 0],
  'c': [0, 0, 15, 16, 16, 16, 15, 0],
  'd': [1, 1, 15, 17, 17, 17, 15, 0],
  'e': [0, 0, 14, 17, 31, 16, 14, 0],
  'f': [6, 9, 8, 28, 8, 8, 8, 0],
  'g': [0, 0, 15, 17, 17, 15, 1, 14], // Schodzi naturalnie do 8 rzędu
  'h': [16, 16, 22, 25, 17, 17, 17, 0],
  'i': [4, 0, 12, 4, 4, 4, 14, 0],
  'j': [2, 0, 6, 2, 2, 2, 18, 12],    // Schodzi naturalnie do 8 rzędu
  'k': [16, 16, 18, 20, 24, 20, 18, 0],
  'l': [12, 4, 4, 4, 4, 4, 14, 0],
  'm': [0, 0, 26, 21, 21, 17, 17, 0],
  'n': [0, 0, 22, 25, 17, 17, 17, 0],
  'o': [0, 0, 14, 17, 17, 17, 14, 0],
  'p': [0, 0, 30, 17, 17, 30, 16, 16], // Schodzi naturalnie do 8 rzędu
  'q': [0, 0, 15, 17, 17, 15, 1, 1],    // Schodzi naturalnie do 8 rzędu
  'r': [0, 0, 11, 12, 8, 8, 8, 0],
  's': [0, 0, 14, 16, 14, 1, 30, 0],
  't': [8, 8, 28, 8, 8, 9, 6, 0],
  'u': [0, 0, 17, 17, 17, 19, 13, 0],
  'v': [0, 0, 17, 17, 17, 10, 4, 0],
  'w': [0, 0, 17, 17, 21, 21, 10, 0],
  'x': [0, 0, 17, 10, 4, 10, 17, 0],
  'y': [0, 0, 17, 17, 17, 15, 1, 14],   // Schodzi naturalnie do 8 rzędu
  'z': [0, 0, 31, 2, 4, 8, 31, 0],

  // --- POLSKIE ZNAKI (DUŻE) ---
  'Ą': [14, 17, 17, 31, 17, 17, 17, 2], // Prawdziwy ogonek w 8 rzędzie
  'Ć': [4, 14, 17, 16, 16, 17, 14, 0],  // Zgrabna, wycentrowana kreska
  'Ę': [31, 16, 16, 30, 16, 16, 31, 2], // Prawdziwy ogonek w 8 rzędzie
  'Ł': [16, 20, 24, 16, 16, 16, 31, 0], // L z eleganckim przekreśleniem
  'Ń': [4, 21, 25, 21, 19, 17, 17, 0],  // Kreska wycentrowana
  'Ó': [4, 14, 17, 17, 17, 17, 14, 0],
  'Ś': [4, 15, 16, 14, 1, 17, 14, 0],
  'Ź': [4, 31, 2, 4, 8, 16, 31, 0],
  'Ż': [4, 31, 2, 4, 8, 16, 31, 0],     // Kropka na rzędzie 0

  // --- POLSKIE ZNAKI (MAŁE) ---
  'ą': [0, 0, 14, 1, 15, 17, 15, 2],    // Prawdziwy ogonek na samym dole
  'ę': [0, 0, 14, 17, 31, 16, 14, 2],   // Prawdziwy ogonek na samym dole
  'ć': [2, 4, 14, 16, 16, 17, 14, 0],   // Elegancki, długi, ukośny akcent (rzędy 0 i 1)
  'ł': [12, 4, 6, 4, 12, 4, 14, 0],
  'ń': [2, 4, 22, 25, 17, 17, 17, 0],   // Ukośny akcent
  'ó': [2, 4, 14, 17, 17, 17, 14, 0],   // Ukośny akcent
  'ś': [2, 4, 14, 16, 14, 1, 30, 0],    // Ukośny akcent
  'ź': [2, 4, 31, 2, 4, 8, 31, 0],      // Ukośny akcent
  'ż': [4, 0, 31, 2, 4, 8, 31, 0],      // Kropka z ładnym odstępem

  // --- DOMYŚLNY ZNAK (Dla nieznanych znaków - pusta ramka) ---
  'default': [31, 17, 17, 17, 17, 17, 31, 0]
};

const icons = {
  folder: `<svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  playlist: `<svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  screen: `<svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
  chevron: `<svg class="category-icon chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
};

document.addEventListener("DOMContentLoaded", () => {
  // --- BLOKADA POWIĘKSZANIA (Touchpad & Klawiatura) ---
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=')) {
      e.preventDefault();
    }
  });
  
  // ============================================================================
  // 2. OBSŁUGA GŁÓWNEGO OKNA (Pasek Tytułowy)
  // ============================================================================
  const appWindow = getCurrentWindow();

  // Wektorowe, idealnie ostre ikony dla przycisków okna
  const svgMinimize = `<svg width="10" height="10" viewBox="0 0 10 10"><path d="M 0,5 10,5" stroke="currentColor" stroke-width="1.5"/></svg>`;
  const svgMaximize = `<svg width="10" height="10" viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
  const svgRestore = `<svg width="10" height="10" viewBox="0 0 10 10"><rect x="2.5" y="0.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M 2.5,2.5 L 0.5,2.5 L 0.5,9.5 L 7.5,9.5 L 7.5,7.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
  const svgClose = `<svg width="10" height="10" viewBox="0 0 10 10"><path d="M 0,0 10,10 M 10,0 0,10" stroke="currentColor" stroke-width="1.5"/></svg>`;

  const minBtn = document.getElementById('titlebar-minimize');
  const maxBtn = document.getElementById('titlebar-maximize');
  const closeBtn = document.getElementById('titlebar-close');

  if (minBtn) {
    minBtn.innerHTML = svgMinimize;
    minBtn.addEventListener('click', () => appWindow.minimize());
  }

  if (closeBtn) {
    closeBtn.innerHTML = svgClose;
    closeBtn.addEventListener('click', () => appWindow.close());
  }

  if (maxBtn) {
    // Funkcja badająca stan okna i podmieniająca ikonę (Pełny ekran vs Okno)
    const updateMaximizeIcon = async () => {
      const isMaximized = await appWindow.isMaximized();
      maxBtn.innerHTML = isMaximized ? svgRestore : svgMaximize;
    };

    // Ustaw poprawną ikonę podczas startu aplikacji
    updateMaximizeIcon();

    // Ręczne kliknięcie w przycisk
    maxBtn.addEventListener('click', async () => {
      await appWindow.toggleMaximize();
      await updateMaximizeIcon();
    });

    // Nasłuchiwanie na zmiany z zewnątrz (np. gdy przeciągniesz okno myszką do górnej krawędzi w Windowsie)
    appWindow.onResized(async () => {
      await updateMaximizeIcon();
    });
  }

  // ============================================================================
  // 3. SYMULATOR RDUCH (Renderowanie na wielu płótnach)
  // ============================================================================
  const canvasPreview = document.getElementById("rduchCanvas") as HTMLCanvasElement;
  const ctxPreview = canvasPreview.getContext("2d");
  
  const canvasList = document.getElementById("rduchCanvasLists") as HTMLCanvasElement;
  const ctxList = canvasList.getContext("2d");

  const dotsPerRow = 5, dotsPerCol = 8;
  const charsPerCol = 20, charsPerRow = 10; 
  const dotRadius = 1.5, dotGap = 1, charGapX = 4, charGapY = 14; 

  const charWidth = (dotsPerRow * (dotRadius * 2 + dotGap)) - dotGap;
  const charHeight = (dotsPerCol * (dotRadius * 2 + dotGap)) - dotGap;
  const cellW = charWidth + charGapX;
  const cellH = charHeight + charGapY;

  const canvasTotalW = charsPerCol * charWidth + (charsPerCol - 1) * charGapX;
  const canvasTotalH = charsPerRow * charHeight + (charsPerRow - 1) * charGapY;

  if (canvasPreview) { canvasPreview.width = canvasTotalW; canvasPreview.height = canvasTotalH; }
  if (canvasList) { canvasList.width = canvasTotalW; canvasList.height = canvasTotalH; }

  // Zuniwersalizowana funkcja renderująca, przyjmująca kontekst płótna
  function renderToCanvas(ctx: CanvasRenderingContext2D | null, canvas: HTMLCanvasElement | null, text: string) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const lines = text.split(/\r?\n/);

    for (let row = 0; row < charsPerRow; row++) {
      const lineText = lines[row] || "";
      for (let col = 0; col < charsPerCol; col++) {
        const char = lineText[col] || " ";
        const startX = col * cellW;
        const startY = row * cellH;
        
        const charData = font5x8[char] || font5x8[char.toUpperCase()] || font5x8['default'];
        for (let r = 0; r < dotsPerCol; r++) {
          const rowBits = charData[r];
          for (let c = 0; c < dotsPerRow; c++) {
            const isDotOn = (rowBits & (1 << (dotsPerRow - 1 - c))) !== 0;
            const x = startX + c * (dotRadius * 2 + dotGap) + dotRadius;
            const y = startY + r * (dotRadius * 2 + dotGap) + dotRadius;

            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            if (isDotOn) {
              ctx.fillStyle = "#ffaa00"; ctx.shadowBlur = 3; ctx.shadowColor = "#ffaa00";
            } else {
              ctx.fillStyle = "#222222"; ctx.shadowBlur = 0;
            }
            ctx.fill();
          }
        }
      }
    }
  }

  // ============================================================================
  // 4. PARSOWANIE (Pieśni i Playlisty)
  // ============================================================================
  interface ParsedSong { sequence: string[]; blocks: Record<string, string[][]>; }

  function parseRduchFile(buffer: number[]): ParsedSong {
    const text = new TextDecoder('windows-1250').decode(new Uint8Array(buffer));
    const lines = text.split(/\r\n|\n|\r/); // Bezpieczny podział linii
    const parsed: ParsedSong = { sequence: [], blocks: {} };

    let currentBlockType = "ekran";
    let verseCounter = 0;
    let currentScreen: string[] = [];
    parsed.blocks[currentBlockType] = [];

    for (const line of lines) {
      if (line.startsWith('#n')) continue;
      if (line.startsWith('#k')) {
        parsed.sequence = line.substring(2).trim().split(',').filter(p => p.trim() !== '');
        continue;
      }
      if (line.startsWith('#z')) {
        verseCounter++; currentBlockType = verseCounter.toString();
        if (!parsed.blocks[currentBlockType]) parsed.blocks[currentBlockType] = [];
        continue;
      }
      if (line.startsWith('#r')) {
        currentBlockType = "r";
        if (!parsed.blocks[currentBlockType]) parsed.blocks[currentBlockType] = [];
        continue;
      }
      if (line.startsWith('#e')) {
        currentScreen = [];
        parsed.blocks[currentBlockType].push(currentScreen);
        continue;
      }

      // KULOODPORNE CZYTANIE TEKSTU (jeśli nie było tagu #e, sam stwórz ekran!)
      if (line.trim() !== '') {
        if (parsed.blocks[currentBlockType].length === 0) {
          currentScreen = [];
          parsed.blocks[currentBlockType].push(currentScreen);
        }
        currentScreen.push(line);
      } else if (parsed.blocks[currentBlockType].length > 0) {
        currentScreen.push(line); // Zachowuje puste linie między tekstem
      }
    }
    if (parsed.sequence.length === 0) parsed.sequence = Object.keys(parsed.blocks).filter(k => parsed.blocks[k].length > 0);
    return parsed;
  }

  interface PlaylistEntry { type: string; title: string; blockId: string; }

  function parsePlaylistFile(buffer: number[]): PlaylistEntry[] {
    const text = new TextDecoder('windows-1250').decode(new Uint8Array(buffer));
    const entries: PlaylistEntry[] = [];

    for (const line of text.split(/\r\n|\n|\r/)) {
      if (line.trim().startsWith('#0/')) continue;

      const matches = [...line.matchAll(/#(.*?)\//g)].map(m => m[1]);
      if (matches.length >= 3) {
        entries.push({
          type: matches[0].trim().toUpperCase(),
          title: matches[1].trim(),
          blockId: matches[2].trim().toLowerCase()
        });
      }
    }
    return entries;
  }

  // ============================================================================
  // 5. OBSŁUGA UI I LOGIKA ZAKŁADEK
  // ============================================================================
  const tabPreview = document.getElementById('tabPreview') as HTMLButtonElement;
  const tabLists = document.getElementById('tabLists') as HTMLButtonElement;
  const viewPreview = document.getElementById('viewPreview') as HTMLDivElement;
  const viewLists = document.getElementById('viewLists') as HTMLDivElement;

  // Elementy Zakładki 1 (Podgląd)
  const previewTitle = document.getElementById('previewSongTitle') as HTMLSpanElement;
  const previewNumber = document.getElementById('previewNumber') as HTMLSpanElement;
  const previewSequence = document.getElementById('previewSequence') as HTMLDivElement;
  const btnPrevScreen = document.getElementById('btnPrevScreen') as HTMLButtonElement;
  const btnNextScreen = document.getElementById('btnNextScreen') as HTMLButtonElement;
  const screenCounter = document.getElementById('screenCounter') as HTMLSpanElement;

  // Elementy Zakładki 2 (Listy)
  const listTitle = document.getElementById('listTitle') as HTMLSpanElement;
  const listNumber = document.getElementById('listNumber') as HTMLSpanElement;
  const listSequence = document.getElementById('listSequence') as HTMLDivElement;
  const btnPrevList = document.getElementById('btnPrevList') as HTMLButtonElement;
  const btnNextList = document.getElementById('btnNextList') as HTMLButtonElement;
  const listCounter = document.getElementById('listCounter') as HTMLSpanElement;

  let currentFlatScreens: { id: string, title: string, lines: string[] }[] = [];
  let currentActiveIndex = 0;

  let currentListScreens: { entryTitle: string, subtitle: string, lines: string[], isMissing: boolean }[] = [];
  let currentListActiveIndex = 0;

  function updatePreviewUI() {
    if (currentFlatScreens.length > 0) {
      renderToCanvas(ctxPreview, canvasPreview, currentFlatScreens[currentActiveIndex].lines.join('\n'));
      screenCounter.textContent = `${currentActiveIndex + 1} / ${currentFlatScreens.length}`;
    } else {
      renderToCanvas(ctxPreview, canvasPreview, "");
      screenCounter.textContent = "0 / 0";
    }

    btnPrevScreen.disabled = currentActiveIndex === 0 || currentFlatScreens.length === 0;
    btnNextScreen.disabled = currentActiveIndex === currentFlatScreens.length - 1 || currentFlatScreens.length === 0;

    document.querySelectorAll('#previewSequence .seq-item').forEach((el, idx) => {
      if (idx === currentActiveIndex) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  function updateListUI() {
    if (currentListScreens.length > 0) {
      renderToCanvas(ctxList, canvasList, currentListScreens[currentListActiveIndex].lines.join('\n'));
      listCounter.textContent = `${currentListActiveIndex + 1} / ${currentListScreens.length}`;
    } else {
      renderToCanvas(ctxList, canvasList, "");
      listCounter.textContent = "0 / 0";
    }

    // Inteligentne wyłączanie przycisków, jeśli nie ma więcej PRAWIDŁOWYCH ekranów w przód/tył
    let hasPrev = false;
    for (let i = currentListActiveIndex - 1; i >= 0; i--) {
      if (!currentListScreens[i].isMissing) { hasPrev = true; break; }
    }
    btnPrevList.disabled = !hasPrev;

    let hasNext = false;
    for (let i = currentListActiveIndex + 1; i < currentListScreens.length; i++) {
      if (!currentListScreens[i].isMissing) { hasNext = true; break; }
    }
    btnNextList.disabled = !hasNext;

    document.querySelectorAll('#listSequence .seq-item').forEach((el, idx) => {
      if (idx === currentListActiveIndex) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  function switchToTab(tab: "preview" | "list") {
    if (tab === "preview") {
      tabPreview.classList.add('active'); tabLists.classList.remove('active');
      viewPreview.style.display = 'block'; viewLists.style.display = 'none';
      updatePreviewUI();
    } else {
      tabLists.classList.add('active'); tabPreview.classList.remove('active');
      viewLists.style.display = 'block'; viewPreview.style.display = 'none';
      updateListUI();
    }
  }

  tabPreview.addEventListener('click', () => switchToTab("preview"));
  tabLists.addEventListener('click', () => switchToTab("list"));

  // --- Przyciski Nawigacji (Z przeskakiwaniem uszkodzonych ekranów) ---
  btnPrevScreen.addEventListener('click', () => { if (currentActiveIndex > 0) { currentActiveIndex--; updatePreviewUI(); } });
  btnNextScreen.addEventListener('click', () => { if (currentActiveIndex < currentFlatScreens.length - 1) { currentActiveIndex++; updatePreviewUI(); } });

  btnNextList.addEventListener('click', () => {
    let nextIdx = currentListActiveIndex + 1;
    // Pętla przeskakuje do przodu, dopóki napotyka "BRAK PLIKU"
    while (nextIdx < currentListScreens.length && currentListScreens[nextIdx].isMissing) nextIdx++;
    if (nextIdx < currentListScreens.length) { currentListActiveIndex = nextIdx; updateListUI(); }
  });

  btnPrevList.addEventListener('click', () => {
    let prevIdx = currentListActiveIndex - 1;
    // Pętla przeskakuje do tyłu, dopóki napotyka "BRAK PLIKU"
    while (prevIdx >= 0 && currentListScreens[prevIdx].isMissing) prevIdx--;
    if (prevIdx >= 0) { currentListActiveIndex = prevIdx; updateListUI(); }
  });

  // ============================================================================
  // GŁÓWNY HANDLER DWUKLIKU
  // ============================================================================
  document.getElementById("libraryTree")?.addEventListener('dblclick', async (e) => {
    const li = (e.target as HTMLElement).closest('li');
    if (!li) return;

    const fullPath = li.getAttribute('data-fullpath');
    const songTitle = li.getAttribute('data-title') || "Nieznany";
    const songNumber = li.getAttribute('data-number') || "----";
    if (!fullPath) return;

    const isPlaylist = fullPath.includes('/playlist_dir/');

    if (isPlaylist) {
      switchToTab("list");
      listTitle.textContent = songTitle;
      listNumber.textContent = `${songNumber}`;
      listNumber.style.background = "#bd93f9;"; previewNumber.style.color = "#282a36";

      listSequence.innerHTML = "";
      currentListScreens = [];

      try {
        const bytes: number[] = await invoke("read_file_content", { path: fullPath });
        const entries = parsePlaylistFile(bytes);

        for (const entry of entries) {
          // Bezpieczne szukanie elementu (odporne na cudzysłowy w tytule)
          const targetLi = Array.from(document.querySelectorAll('#libraryTree li')).find(
            el => el.getAttribute('data-title') === entry.title
          );

          if (!targetLi) {
            currentListScreens.push({
              entryTitle: entry.title, subtitle: "BRAK PLIKU NA KARCIE",
              lines: ["", "   BRAK PLIKU", "   " + entry.title], isMissing: true
            });
            continue;
          }

          const targetPath = targetLi.getAttribute('data-fullpath');
          if (!targetPath) continue;

          const songBytes: number[] = await invoke("read_file_content", { path: targetPath });
          const parsedSong = parseRduchFile(songBytes);

          let screensToAdd: string[][] = [];
          let subTitlePrefix = "";

          // OBSŁUGA EKRANÓW (PLIKI .ekr)
          if (entry.type === 'EKR' || targetPath.toLowerCase().endsWith('.ekr')) {
            const allScreens = parsedSong.blocks['ekran'] || Object.values(parsedSong.blocks)[0] || [];
            const requestedIndex = parseInt(entry.blockId) - 1;

            if (allScreens.length > 0) {
              if (!isNaN(requestedIndex) && requestedIndex >= 0 && requestedIndex < allScreens.length) {
                screensToAdd = [allScreens[requestedIndex]];
                subTitlePrefix = `Ekran ${entry.blockId}`;
              } else {
                screensToAdd = allScreens; // Fallback
                subTitlePrefix = "Ekran";
              }
            } else {
              currentListScreens.push({
                entryTitle: entry.title, subtitle: "PLIK JEST PUSTY",
                lines: ["", "   PUSTY PLIK"], isMissing: true
              });
              continue;
            }
          }
          // OBSŁUGA ZWYKŁYCH PIEŚNI Z ZWROTKAMI
          else {
            screensToAdd = parsedSong.blocks[entry.blockId];
            subTitlePrefix = entry.blockId === 'r' ? "Refren" : `Zwr. ${entry.blockId}`;

            if (!screensToAdd || screensToAdd.length === 0) {
              currentListScreens.push({
                entryTitle: entry.title, subtitle: `BRAK ZWR. ${entry.blockId}`,
                lines: ["", `   BRAK ZWR. ${entry.blockId}`], isMissing: true
              });
              continue;
            }
          }

          // Jeśli wszystko się udało, dodajemy ekrany do playlisty
          if (screensToAdd) {
            screensToAdd.forEach((screenLines, idx) => {
              let sub = subTitlePrefix;
              if (screensToAdd.length > 1) sub += ` (${idx + 1}/${screensToAdd.length})`;
              currentListScreens.push({
                entryTitle: entry.title, subtitle: sub,
                lines: screenLines, isMissing: false
              });
            });
          }
        }

        // --- Renderowanie Kafelków na boku ---
        currentListScreens.forEach((screen, idx) => {
          const div = document.createElement('div');
          div.className = `seq-item`;
          div.innerHTML = `<strong>${screen.entryTitle}</strong><br><small style="color:${screen.isMissing ? '#ff5555' : '#aaa'}">${screen.subtitle}</small>`;

          if (screen.isMissing) {
            div.style.opacity = '0.4';
            div.style.background = 'transparent';
            div.style.border = '1px dashed #555';
          }

          div.onclick = () => { currentListActiveIndex = idx; updateListUI(); };
          listSequence.appendChild(div);
        });

        if (currentListScreens.length === 0) {
          listSequence.innerHTML = `<div style="padding: 10px; color: #ff5555;">Lista jest pusta.</div>`;
        }

        // Zaznacz pierwszy poprawny ekran z brzegu (pomija błędy)
        currentListActiveIndex = currentListScreens.findIndex(s => !s.isMissing);
        if (currentListActiveIndex === -1) currentListActiveIndex = 0;

        updateListUI();

      } catch (err) {
        console.error("Błąd odczytu playlisty:", err);
      }

    } else {
      // ZWYKŁA PIEŚŃ / EKRAN
      switchToTab("preview");
      const isScreenFile = fullPath.toLowerCase().endsWith('.ekr') || fullPath.includes('/screen_dir/');

      try {
        const bytes: number[] = await invoke("read_file_content", { path: fullPath });
        const parsed = parseRduchFile(bytes);

        previewTitle.textContent = songTitle;
        if (isScreenFile) {
          previewNumber.textContent = `${songNumber}`;
          previewNumber.style.background = "#8be9fd"; previewNumber.style.color = "#282a36";
        } else {
          previewNumber.textContent = `${songNumber}`;
          previewNumber.style.background = "#44475a"; previewNumber.style.color = "#f8f8f2";
        }

        previewSequence.innerHTML = "";
        currentFlatScreens = [];
        currentActiveIndex = 0;

        parsed.sequence.forEach(seqId => {
          const blockId = seqId.trim().toLowerCase();
          const screens = parsed.blocks[blockId];
          if (!screens) return;

          screens.forEach((screenLines, idx) => {
            let titleName = "Ekran";
            if (!isScreenFile) {
              if (blockId === 'r') titleName = "Refren";
              else if (!isNaN(parseInt(blockId))) titleName = `Zwrotka ${blockId}`;
            }
            if (screens.length > 1) titleName += ` (${idx + 1}/${screens.length})`;
            currentFlatScreens.push({ id: blockId, title: titleName, lines: screenLines });
          });
        });

        currentFlatScreens.forEach((screen, idx) => {
          const div = document.createElement('div');
          div.className = `seq-item`;
          div.innerHTML = `<strong>${screen.title}</strong>`;
          div.onclick = () => { currentActiveIndex = idx; updatePreviewUI(); };
          previewSequence.appendChild(div);
        });

        if (currentFlatScreens.length === 0) previewSequence.innerHTML = `<div style="padding: 10px; color: #ff5555;">Plik jest pusty.</div>`;
        updatePreviewUI();

      } catch (err) {
        console.error("Błąd odczytu pieśni:", err);
      }
    }
  });

  let currentSdPath = "";

  // Dodajemy data-number do budowania kategorii
  function buildCategory(title: string, dirName: string, icon: string, items: any[], color: string) {
    if (items.length === 0) return "";
    let html = `<details><summary style="color: ${color}">${icon} <span>${title}</span> <span style="color: #667; font-size: 0.8rem; margin-left: 5px;">(${items.length})</span> ${icons.chevron}</summary><ul class="item-list">`;
    const cleanBase = currentSdPath.replace(/\\/g, '/').replace(/\/$/, '');
    items.forEach((item: any) => {
      html += `<li data-fullpath="${cleanBase}/${dirName}/${item.filename}" data-title="${item.title}" data-number="${item.number}">
                 <small style="color: #667; display: inline-block; width: 45px;">#${item.number}</small> ${item.title}
               </li>`;
    });
    html += `</ul></details>`;
    return html;
  }

  // ============================================================================
  // OBSŁUGA DYSKÓW I ŁADOWANIE KARTY SD
  // ============================================================================
  const loadSdBtn = document.getElementById("loadSdBtn") as HTMLButtonElement;
  const loadSdBtnText = document.getElementById("loadSdBtnText") as HTMLSpanElement;
  const driveList = document.getElementById("driveList") as HTMLDivElement;
  const libraryTree = document.getElementById("libraryTree") as HTMLDivElement;
  const errorBox = document.getElementById("errorBox") as HTMLDivElement;
  const errorList = document.getElementById("errorList") as HTMLUListElement;

  document.addEventListener('click', (e) => {
    if (loadSdBtn && driveList && !loadSdBtn.contains(e.target as Node) && !driveList.contains(e.target as Node)) {
      driveList.style.display = 'none';
    }
  });

  if (loadSdBtn) {
    loadSdBtn.addEventListener("click", async () => {
      try {
        const drives: any = await invoke("get_drives");
        if (drives.length === 0) {
          loadSdBtnText.textContent = "Nie wykryto dysków!";
          return;
        }

        driveList.innerHTML = drives.map((d: any) => `
          <div class="drive-item" data-path="${d.mount_point}">
            <span><strong>${d.mount_point}</strong> ${d.name}</span>
          </div>
        `).join("");

        driveList.style.display = driveList.style.display === 'block' ? 'none' : 'block';

        document.querySelectorAll('.drive-item').forEach(item => {
          item.addEventListener('click', async (e) => {
            const path = (e.currentTarget as HTMLElement).getAttribute('data-path');
            driveList.style.display = 'none';
            loadSdBtnText.textContent = "Ładowanie...";

            try {
              const result: any = await invoke("load_sd_card", { path });
              if (!result) {
                loadSdBtnText.textContent = "Błąd odczytu folderu!";
                return;
              }

              loadSdBtn.classList.add('loaded');
              loadSdBtnText.textContent = `Załadowano: ${path} (Zmień)`;
              currentSdPath = result.path;

              if (result.errors.length > 0) {
                errorBox.style.display = "block";
                errorList.innerHTML = result.errors.map((err: any) =>
                  `<li><strong>${err.filename}:</strong> ${err.message}</li>`
                ).join("");
              } else {
                errorBox.style.display = "none";
              }

              let html = "";
              html += buildCategory("Playlisty", "playlist_dir", icons.playlist, result.playlists, "var(--accent)");
              html += buildCategory("Ekrany", "screen_dir", icons.screen, result.screens, "#8be9fd");

              const sortedCategories = Object.keys(result.categories).sort();
              for (const catName of sortedCategories) {
                html += buildCategory(catName, catName, icons.folder, result.categories[catName], "#edfff2");
              }

              libraryTree.innerHTML = html;

              const searchInput = document.getElementById("searchInput") as HTMLInputElement;
              if (searchInput) searchInput.value = "";

            } catch (err) {
              console.error("Błąd parsowania:", err);
              loadSdBtnText.textContent = "Błąd odczytu!";
              loadSdBtn.classList.remove('loaded');
            }
          });
        });
      } catch (err) {
        console.error("Nie udało się pobrać dysków:", err);
      }
    });
  }

  // ============================================================================
  // 6. WYSZUKIWARKA PIEŚNI Z PRZYCISKIEM X
  // ============================================================================
  const searchInput = document.getElementById("searchInput") as HTMLInputElement;
  if (searchInput) {
    const clearSearchBtn = document.getElementById("clearSearchBtn") as HTMLButtonElement;
    const performSearch = (term: string) => {
      const categories = document.querySelectorAll('#libraryTree details');
      categories.forEach(details => {
        let hasVisibleItem = false;
        const items = details.querySelectorAll('li');
        items.forEach(li => {
          const text = li.textContent?.toLowerCase() || '';
          if (text.includes(term)) { li.style.display = 'block'; hasVisibleItem = true; }
          else { li.style.display = 'none'; }
        });
        (details as HTMLElement).style.display = hasVisibleItem ? 'block' : 'none';
        if (term.length > 0 && hasVisibleItem) { (details as HTMLDetailsElement).open = true; }
        else if (term.length === 0) { (details as HTMLDetailsElement).open = false; }
      });
    };
    searchInput.addEventListener("input", (e) => {
      const term = (e.target as HTMLInputElement).value.toLowerCase();
      clearSearchBtn.style.display = term.length > 0 ? 'flex' : 'none';
      performSearch(term);
    });
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = ""; clearSearchBtn.style.display = 'none'; performSearch("");
    });
  }

  updatePreviewUI();
  updateListUI();
});
