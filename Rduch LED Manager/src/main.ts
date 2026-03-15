import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// ============================================================================
// 1. DANE I SŁOWNIKI
// ============================================================================
const font5x7: Record<string, number[]> = {
  'A': [14, 17, 17, 31, 17, 17, 17], 'B': [30, 17, 17, 30, 17, 17, 30],
  'C': [14, 17, 16, 16, 16, 17, 14], 'D': [30, 17, 17, 17, 17, 17, 30],
  'E': [31, 16, 16, 30, 16, 16, 31], 'W': [17, 17, 17, 21, 21, 21, 10],
  'I': [14, 4, 4, 4, 4, 4, 14], 'T': [31, 4, 4, 4, 4, 4, 4],
  'a': [0, 0, 14, 1, 15, 17, 15], 'b': [16, 16, 22, 25, 17, 17, 30],
  'c': [0, 0, 14, 16, 16, 17, 14], 'e': [0, 0, 14, 17, 31, 16, 14],
  'i': [4, 0, 12, 4, 4, 4, 14], 'm': [0, 0, 26, 21, 21, 17, 17],
  't': [8, 30, 8, 8, 8, 9, 6], 'w': [0, 0, 17, 17, 21, 21, 10],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  'default': [31, 17, 17, 17, 17, 17, 31]
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
  // 3. SYMULATOR RDUCH (Canvas & Edytor)
  // ============================================================================
  const canvas = document.getElementById("rduchCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  const editor = document.getElementById("songEditor") as HTMLTextAreaElement;

  if (canvas && ctx && editor) {
    const cols = 20;
    const rows = 10;
    const dotRadius = 1.5;
    const dotGap = 1;
    const charGapX = 4;

    const charWidth = (5 * (dotRadius * 2 + dotGap)) - dotGap;
    const charHeight = (7 * (dotRadius * 2 + dotGap)) - dotGap;

    const cellW = charWidth + charGapX;
    const totalWidth = cols * cellW;
    const cellH = totalWidth / rows;

    canvas.width = totalWidth;
    canvas.height = rows * cellH;

    function drawChar(char: string, startX: number, startY: number) {
      const charData = font5x7[char] || font5x7[char.toUpperCase()] || font5x7['default'];

      for (let r = 0; r < 7; r++) {
        const rowBits = charData[r];
        for (let c = 0; c < 5; c++) {
          const isDotOn = (rowBits & (1 << (4 - c))) !== 0;
          const x = startX + c * (dotRadius * 2 + dotGap) + dotRadius;
          const y = startY + r * (dotRadius * 2 + dotGap) + dotRadius;

          ctx!.beginPath();
          ctx!.arc(x, y, dotRadius, 0, Math.PI * 2);

          if (isDotOn) {
            ctx!.fillStyle = "#ffaa00";
            ctx!.shadowBlur = 3;
            ctx!.shadowColor = "#ffaa00";
          } else {
            ctx!.fillStyle = "#222222";
            ctx!.shadowBlur = 0;
          }
          ctx!.fill();
        }
      }
    }

    function renderScreen() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      const text = editor.value;
      const selStart = editor.selectionStart;
      const selEnd = editor.selectionEnd;

      let r = 0, c = 0;

      for (let i = 0; i <= text.length; i++) {
        if (r >= rows) break;

        const x = c * cellW;
        const y = r * cellH;

        if (i >= selStart && i < selEnd) {
          ctx!.fillStyle = "rgba(255, 170, 0, 0.25)";
          ctx!.shadowBlur = 0;
          ctx!.fillRect(x, y, charWidth, charHeight);
        }

        if (i < text.length) {
          const char = text[i];
          if (char === '\n') {
            r++; c = 0;
          } else {
            drawChar(char, x, y);
            c++;
            if (c >= cols) { r++; c = 0; }
          }
        }
      }
    }

    editor.addEventListener("input", renderScreen);
    editor.addEventListener("keyup", renderScreen);
    editor.addEventListener("mouseup", renderScreen);

    function applyFormatting(formatter: (text: string) => string) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = editor.value;

      if (start === end) {
        editor.value = formatter(text);
      } else {
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);
        editor.value = before + formatter(selected) + after;
      }

      editor.focus();
      editor.setSelectionRange(start, end);
      renderScreen();
    }

    document.getElementById("btnUpper")!.onclick = () => applyFormatting(t => t.toUpperCase());
    document.getElementById("btnLower")!.onclick = () => applyFormatting(t => t.toLowerCase());
    document.getElementById("btnLeft")!.onclick = () => applyFormatting(t => t.split('\n').map(l => l.trim().padEnd(20, ' ')).join('\n'));
    document.getElementById("btnRight")!.onclick = () => applyFormatting(t => t.split('\n').map(l => l.padStart(20, ' ')).join('\n'));
    document.getElementById("btnCenter")!.onclick = () => applyFormatting(t => t.split('\n').map(l => {
      const trimmed = l.trim();
      if (trimmed.length >= 20) return trimmed.substring(0, 20);
      const padding = 20 - trimmed.length;
      const leftPad = Math.floor(padding / 2);
      return ' '.repeat(leftPad) + trimmed + ' '.repeat(padding - leftPad);
    }).join('\n'));

    editor.value = "Witamy w Rduch LED!";
    renderScreen();
  }

  // ============================================================================
  // 4. OBSŁUGA BIBLIOTEKI I KARTY SD
  // ============================================================================
  const loadSdBtn = document.getElementById("loadSdBtn") as HTMLButtonElement;
  const loadSdBtnText = document.getElementById("loadSdBtnText") as HTMLSpanElement;
  const driveList = document.getElementById("driveList") as HTMLDivElement;
  const libraryTree = document.getElementById("libraryTree") as HTMLDivElement;
  const errorBox = document.getElementById("errorBox") as HTMLDivElement;
  const errorList = document.getElementById("errorList") as HTMLUListElement;
  const openExplorerBtn = document.getElementById("openExplorerBtn") as HTMLButtonElement;
  const searchInput = document.getElementById("searchInput") as HTMLInputElement;

  let currentSdPath = "";

  function buildCategory(title: string, icon: string, items: any[], color: string) {
    if (items.length === 0) return "";
    let html = `<details>`;
    html += `<summary style="color: ${color}">
               ${icon} <span>${title}</span> <span style="color: #667; font-size: 0.8rem; margin-left: 5px;">(${items.length})</span> ${icons.chevron}
             </summary>`;
    html += `<ul class="item-list">`;
    items.forEach((item: any) => {
      html += `<li><small style="color: #667; display: inline-block; width: 45px;">#${item.number}</small> ${item.title}</li>`;
    });
    html += `</ul></details>`;
    return html;
  }

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
            ${d.is_removable ? '<span class="badge">KARTA / USB</span>' : ''}
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
              html += buildCategory("Playlisty", icons.playlist, result.playlists, "var(--accent)");
              html += buildCategory("Ekrany", icons.screen, result.screens, "#8be9fd");

              const sortedCategories = Object.keys(result.categories).sort();
              for (const catName of sortedCategories) {
                html += buildCategory(catName, icons.folder, result.categories[catName], "#edfff2");
              }

              libraryTree.innerHTML = html;
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

  if (openExplorerBtn) {
    openExplorerBtn.addEventListener("click", () => {
      if (currentSdPath) invoke("open_in_explorer", { path: currentSdPath });
    });
  }

  // ============================================================================
  // 5. WYSZUKIWARKA PIEŚNI
  // ============================================================================
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = (e.target as HTMLInputElement).value.toLowerCase();
      const categories = document.querySelectorAll('#libraryTree details');

      categories.forEach(details => {
        let hasVisibleItem = false;
        const items = details.querySelectorAll('li');

        items.forEach(li => {
          const text = li.textContent?.toLowerCase() || '';
          if (text.includes(term)) {
            li.style.display = 'block';
            hasVisibleItem = true;
          } else {
            li.style.display = 'none';
          }
        });

        (details as HTMLElement).style.display = hasVisibleItem ? 'block' : 'none';

        if (term.length > 0 && hasVisibleItem) {
          (details as HTMLDetailsElement).open = true;
        } else if (term.length === 0) {
          (details as HTMLDetailsElement).open = false;
        }
      });
    });
  }
});