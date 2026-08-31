/**
 * Șahist — Lecții UI Controller
 *
 * Gestionează:
 * - Navigarea între module și exemple
 * - Execuția pas cu pas (ghidat / auto)
 * - Highlight-uri pe tablă pentru indicații
 * - Feedback la mutare greșită
 * - Trecerea în modul liber după lecție
 * - Progresul salvat în localStorage
 */

'use strict';

const LessonsUI = (() => {

  // ─── Stare lecție ─────────────────────────────────────────────
  let activeLesson   = null;  // modulul curent {id, title, examples, ...}
  let activeExample  = null;  // exemplul curent {id, steps, startFEN, ...}
  let currentStep    = 0;
  let lessonActive   = false; // suntem în modul lecție (vs joc liber)
  let freePlayActive = false; // joc liber pornit din lecție

  // Callback-uri spre UI-ul principal (setate la init)
  let callbacks = {};

  // ─── Progres ──────────────────────────────────────────────────
  const PROGRESS_KEY = 'sahist_lesson_progress';

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
    catch { return {}; }
  }

  function markCompleted(moduleId, exampleId) {
    const p = getProgress();
    if (!p[moduleId]) p[moduleId] = {};
    p[moduleId][exampleId] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  }

  function isCompleted(moduleId, exampleId) {
    const p = getProgress();
    return !!(p[moduleId]?.[exampleId]);
  }

  // ─── Utilități coordonate ────────────────────────────────────
  function algToRC(sq) {
    // 'e4' → {r:4, c:4}
    const c = sq.charCodeAt(0) - 97;
    const r = 8 - parseInt(sq[1]);
    return { r, c };
  }

  // ─── Init ─────────────────────────────────────────────────────
  function init(cb) {
    callbacks = cb;
    renderLessonsMenu();
  }

  // ─── Randează meniul principal ─────────────────────────────────
  function renderLessonsMenu() {
    const container = document.getElementById('lessons-panel');
    if (!container) return;

    const progress = getProgress();
    let html = '';

    for (const [catKey, cat] of Object.entries(LESSONS_DATA)) {
      html += `<div class="lesson-category">
        <div class="lesson-cat-header">
          <span class="lesson-cat-icon">${cat.icon}</span>
          <span class="lesson-cat-title">${cat.label}</span>
        </div>
        <div class="lesson-modules">`;

      for (const mod of cat.modules) {
        const completed = mod.examples.filter(e =>
          isCompleted(mod.id, e.id)).length;
        const total = mod.examples.length;
        const allDone = total > 0 && completed === total;
        const soon = mod.comingSoon;

        html += `<div class="lesson-module ${soon ? 'coming-soon' : ''} ${allDone ? 'done' : ''}"
          ${!soon ? `data-module="${mod.id}" data-cat="${catKey}"` : ''}>
          <div class="lesson-mod-title">
            ${allDone ? '✓ ' : ''}${mod.title}
            ${soon ? '<span class="soon-badge">În curând</span>' : ''}
          </div>
          <div class="lesson-mod-sub">${mod.subtitle || mod.description.slice(0, 60) + '...'}</div>
          ${!soon && total > 0 ? `<div class="lesson-mod-progress">
            <div class="lesson-prog-bar" style="width:${Math.round(completed/total*100)}%"></div>
          </div>` : ''}
        </div>`;
      }

      html += `</div></div>`;
    }

    container.innerHTML = html;

    // Click pe modul
    container.querySelectorAll('.lesson-module:not(.coming-soon)').forEach(el => {
      el.addEventListener('click', () => {
        const modId = el.dataset.module;
        const catKey = el.dataset.cat;
        const mod = LESSONS_DATA[catKey]?.modules.find(m => m.id === modId);
        if (mod) openModule(mod);
      });
    });
  }

  // ─── Deschide un modul ────────────────────────────────────────
  function openModule(mod) {
    activeLesson = mod;
    showModuleView(mod);
  }

  function showModuleView(mod) {
    const panel = document.getElementById('lesson-detail-panel');
    const menu  = document.getElementById('lessons-panel');
    if (!panel || !menu) return;

    menu.style.display  = 'none';
    panel.style.display = 'block';

    const progress = getProgress();

    let examplesHtml = mod.examples.map((ex, i) => {
      const done = isCompleted(mod.id, ex.id);
      return `<button class="example-btn ${done ? 'done' : ''}" data-idx="${i}">
        ${done ? '✓ ' : ''}${ex.title}
      </button>`;
    }).join('');

    panel.innerHTML = `
      <button class="back-btn" id="lesson-back">← Înapoi</button>
      <div class="module-header">
        <div class="module-title">${mod.title}</div>
        <div class="module-subtitle">${mod.subtitle || ''}</div>
      </div>
      <div class="module-description">${mod.description}</div>
      <div class="examples-label">Alege un exemplu:</div>
      <div class="examples-row">${examplesHtml}</div>
    `;

    panel.querySelector('#lesson-back').addEventListener('click', () => {
      panel.style.display = 'none';
      menu.style.display  = 'block';
      renderLessonsMenu();
    });

    panel.querySelectorAll('.example-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        startExample(mod.examples[idx]);
      });
    });
  }

  // ─── Pornește un exemplu ───────────────────────────────────────
  function startExample(example) {
    activeExample  = example;
    currentStep    = 0;
    lessonActive   = true;
    freePlayActive = false;

    // Ascunde panoul de detalii, arată UI-ul de lecție pe tablă
    document.getElementById('lesson-detail-panel').style.display = 'none';
    document.getElementById('lesson-step-panel').style.display   = 'block';

    // Inițializează engine-ul cu FEN-ul din exemplu
    callbacks.initPosition(example.startFEN, example.playerColor || 'w');

    // Execută primul pas
    executeStep(currentStep);
  }

  // ─── Execută un pas ───────────────────────────────────────────
  function executeStep(idx) {
    const step = activeExample.steps[idx];
    if (!step) {
      finishLesson();
      return;
    }

    updateStepPanel(step, idx);

    if (step.player === 'auto') {
      // Mutare automată după un mic delay
      setTimeout(() => {
        const from = algToRC(step.from);
        const to   = algToRC(step.to);
        callbacks.applyLessonMove(from, to, step.promotion || null);
        showExplanation(step.explanation);

        // Trece automat la pasul următor după ce utilizatorul citește
        setTimeout(() => {
          currentStep++;
          executeStep(currentStep);
        }, step.explanation ? 2200 : 900);
      }, 700);
    } else {
      // Rândul utilizatorului — highlight pe piesa de mutat
      const from = algToRC(step.from);
      const to   = algToRC(step.to);
      callbacks.highlightLessonSquares(from, to);
    }
  }

  // ─── Gestionează mutarea utilizatorului ───────────────────────
  function handleUserMove(fromRC, toRC) {
    if (!lessonActive || freePlayActive) return false;

    const step = activeExample.steps[currentStep];
    if (!step || step.player !== 'user') return false;

    const expectedFrom = algToRC(step.from);
    const expectedTo   = algToRC(step.to);

    const correct = fromRC.r === expectedFrom.r && fromRC.c === expectedFrom.c &&
                    toRC.r   === expectedTo.r   && toRC.c   === expectedTo.c;

    if (!correct) {
      callbacks.showMoveError();
      return true; // blochează mutarea, dar o "consumăm"
    }

    // Mutare corectă — aplică pe engine și tablă
    callbacks.applyLessonMove(expectedFrom, expectedTo, step.promotion || null);
    callbacks.clearLessonHighlights();
    showExplanation(step.explanation);

    setTimeout(() => {
      currentStep++;
      executeStep(currentStep);
    }, step.explanation ? 2000 : 800);

    return true; // mutarea a fost procesată de lecție
  }

  // ─── UI pas curent ────────────────────────────────────────────
  function updateStepPanel(step, idx) {
    const total   = activeExample.steps.filter(s => s.player === 'user').length;
    const userIdx = activeExample.steps.slice(0, idx + 1).filter(s => s.player === 'user').length;

    const panel = document.getElementById('lesson-step-panel');
    if (!panel) return;

    const isUser = step.player === 'user';

    panel.querySelector('#step-indicator').textContent =
      `${activeExample.title} · Pasul ${idx + 1} din ${activeExample.steps.length}`;

    panel.querySelector('#step-instruction').textContent =
      isUser ? (step.hint || 'Fă mutarea indicată') : '⟳ Calculatorul mută...';

    panel.querySelector('#step-instruction').className =
      'step-instruction ' + (isUser ? 'user-turn' : 'auto-turn');

    panel.querySelector('#step-explanation').textContent = '';
  }

  function showExplanation(text) {
    const el = document.getElementById('step-explanation');
    if (el && text) el.textContent = text;
  }

  // ─── Finalizare lecție ────────────────────────────────────────
  function finishLesson() {
    markCompleted(activeLesson.id, activeExample.id);

    const panel = document.getElementById('lesson-step-panel');
    if (!panel) return;

    panel.querySelector('#step-indicator').textContent = '✓ Lecție completă!';
    panel.querySelector('#step-instruction').textContent = '';
    panel.querySelector('#step-instruction').className = 'step-instruction';
    panel.querySelector('#step-explanation').textContent =
      'Ai finalizat cu succes acest exemplu. Vrei să mai exersezi?';

    // Arată butoanele de final
    document.getElementById('lesson-finish-btns').style.display = 'flex';
  }

  // ─── Joc liber ────────────────────────────────────────────────
  function startFreePlay() {
    freePlayActive = true;
    lessonActive   = false;

    document.getElementById('lesson-finish-btns').style.display = 'none';
    document.getElementById('lesson-step-panel').style.display  = 'none';

    // Reinițializează poziția și lasă utilizatorul să joace liber
    callbacks.startFreePlay(activeExample.startFEN, activeExample.playerColor || 'w');
  }

  // ─── Ieșire din lecție ────────────────────────────────────────
  function exitLesson() {
    lessonActive   = false;
    freePlayActive = false;
    activeLesson   = null;
    activeExample  = null;
    currentStep    = 0;

    callbacks.exitLessons();
  }

  // ─── API public ───────────────────────────────────────────────
  return {
    init,
    handleUserMove,
    startFreePlay,
    exitLesson,
    isLessonActive: () => lessonActive && !freePlayActive,
    isFreePlay:     () => freePlayActive,
  };

})();
