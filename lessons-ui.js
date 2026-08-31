/**
 * Șahist — Lecții UI Controller v2
 *
 * Fix-uri față de v1:
 * - Switch automat la tab Joacă când pornește un exemplu
 * - Callbacks stocate permanent (nu se pierd la re-init)
 * - Meniu se reîncarcă corect fără refresh
 * - Explicații la fiecare pas (user și auto)
 * - Buton "Exemplul următor" funcțional
 * - Tabla nu se mai deplasează la actualizarea textului
 */

'use strict';

const LessonsUI = (() => {

  // ─── Stare ────────────────────────────────────────────────────
  let activeLesson   = null;
  let activeExample  = null;
  let currentStep    = 0;
  let lessonActive   = false;
  let freePlayActive = false;
  let _callbacks     = null; // stocate permanent, nu se pierd la re-render

  // ─── Progres ──────────────────────────────────────────────────
  const PROGRESS_KEY = 'sahist_lesson_progress';

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
    catch { return {}; }
  }

  function markCompleted(modId, exId) {
    const p = getProgress();
    if (!p[modId]) p[modId] = {};
    p[modId][exId] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  }

  function isCompleted(modId, exId) {
    return !!(getProgress()[modId]?.[exId]);
  }

  // ─── Coordonate ───────────────────────────────────────────────
  function algToRC(sq) {
    return { r: 8 - parseInt(sq[1]), c: sq.charCodeAt(0) - 97 };
  }

  // ─── Init (poate fi apelat de mai multe ori) ──────────────────
  function init(cb) {
    if (cb) _callbacks = cb; // stocăm callbacks prima dată
    renderLessonsMenu();
  }

  // ─── Meniu principal ──────────────────────────────────────────
  function renderLessonsMenu() {
    const container = document.getElementById('lessons-panel');
    const detail    = document.getElementById('lesson-detail-panel');
    if (!container) return;

    // Ascunde detaliul, arată meniul
    if (detail) detail.style.display = 'none';
    container.style.display = 'block';

    let html = '';
    for (const [catKey, cat] of Object.entries(LESSONS_DATA)) {
      html += `<div class="lesson-category">
        <div class="lesson-cat-header">
          <span class="lesson-cat-icon">${cat.icon}</span>
          <span class="lesson-cat-title">${cat.label}</span>
        </div>
        <p class="lesson-cat-desc">${cat.description}</p>
        <div class="lesson-modules">`;

      for (const mod of cat.modules) {
        const completed = (mod.examples || []).filter(e => isCompleted(mod.id, e.id)).length;
        const total     = (mod.examples || []).length;
        const allDone   = total > 0 && completed === total;
        const soon      = mod.comingSoon;

        html += `<div class="lesson-module ${soon ? 'coming-soon' : ''} ${allDone ? 'done' : ''}"
          ${!soon ? `data-module="${mod.id}" data-cat="${catKey}"` : ''}>
          <div class="lesson-mod-title">
            ${allDone ? '<span style="color:#27ae60">✓</span> ' : ''}${mod.title}
            ${soon ? '<span class="soon-badge">În curând</span>' : ''}
          </div>
          <div class="lesson-mod-sub">${mod.subtitle || ''}</div>
          ${!soon && total > 0 ? `
            <div class="lesson-mod-meta">${completed}/${total} exemple</div>
            <div class="lesson-mod-progress">
              <div class="lesson-prog-bar" style="width:${Math.round(completed/total*100)}%"></div>
            </div>` : ''}
        </div>`;
      }
      html += `</div></div>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('.lesson-module:not(.coming-soon)').forEach(el => {
      el.addEventListener('click', () => {
        const modId  = el.dataset.module;
        const catKey = el.dataset.cat;
        const mod    = LESSONS_DATA[catKey]?.modules.find(m => m.id === modId);
        if (mod) openModule(mod);
      });
    });
  }

  // ─── Modul detail ─────────────────────────────────────────────
  function openModule(mod) {
    activeLesson = mod;
    const panel   = document.getElementById('lesson-detail-panel');
    const menu    = document.getElementById('lessons-panel');
    if (!panel || !menu) return;

    menu.style.display  = 'none';
    panel.style.display = 'block';

    const exHtml = (mod.examples || []).map((ex, i) => {
      const done = isCompleted(mod.id, ex.id);
      return `<button class="example-btn ${done ? 'done' : ''}" data-idx="${i}">
        <span class="ex-num">${i + 1}</span>
        <span class="ex-title">${done ? '✓ ' : ''}${ex.title}</span>
      </button>`;
    }).join('');

    panel.innerHTML = `
      <button class="back-btn" id="lesson-back">← Toate modulele</button>
      <div class="module-header">
        <div class="module-title">${mod.title}</div>
        <div class="module-subtitle">${mod.subtitle || ''}</div>
      </div>
      <div class="module-description">${mod.description}</div>
      <div class="examples-label">Alege un exemplu pentru a începe:</div>
      <div class="examples-row">${exHtml}</div>
    `;

    panel.querySelector('#lesson-back').addEventListener('click', () => {
      renderLessonsMenu();
    });

    panel.querySelectorAll('.example-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        startExample(mod.examples[parseInt(btn.dataset.idx)]);
      });
    });
  }

  // ─── Pornește exemplu ─────────────────────────────────────────
  function startExample(example) {
    activeExample  = example;
    currentStep    = 0;
    lessonActive   = true;
    freePlayActive = false;

    // Ascunde meniurile lecție
    const detail = document.getElementById('lesson-detail-panel');
    const menu   = document.getElementById('lessons-panel');
    if (detail) detail.style.display = 'none';
    if (menu)   menu.style.display   = 'none';

    // SWITCH LA TAB JOACĂ — tabla devine vizibilă
    if (_callbacks?.switchToPlay) _callbacks.switchToPlay();

    // Inițializează poziția pe tablă
    _callbacks.initPosition(example.startFEN, example.playerColor || 'w');

    // Arată panoul de lecție și reset butoane finale
    const stepPanel = document.getElementById('lesson-step-panel');
    if (stepPanel) stepPanel.style.display = 'block';
    const finishBtns = document.getElementById('lesson-finish-btns');
    if (finishBtns) finishBtns.style.display = 'none';
    const errMsg = document.getElementById('move-error-msg');
    if (errMsg) errMsg.style.display = 'none';

    // Execută primul pas
    executeStep(0);
  }

  // ─── Execută pas ──────────────────────────────────────────────
  function executeStep(idx) {
    const step = activeExample?.steps[idx];
    if (!step) {
      finishLesson();
      return;
    }

    currentStep = idx;
    updateStepPanel(step, idx);

    if (step.player === 'auto') {
      setTimeout(() => {
        const from = algToRC(step.from);
        const to   = algToRC(step.to);
        _callbacks.applyLessonMove(from, to, step.promotion || null);

        // Arată explicația DUPĂ mutarea automată
        if (step.explanation) showExplanation(step.explanation);

        // Avansează la pasul următor după ce utilizatorul citește
        const delay = step.explanation ? 2800 : 1000;
        setTimeout(() => executeStep(idx + 1), delay);
      }, 600);
    } else {
      // Rândul utilizatorului — highlight
      const from = algToRC(step.from);
      const to   = algToRC(step.to);
      _callbacks.highlightLessonSquares(from, to);
    }
  }

  // ─── Mutarea utilizatorului ───────────────────────────────────
  function handleUserMove(fromRC, toRC) {
    if (!lessonActive || freePlayActive) return false;

    const step = activeExample?.steps[currentStep];
    if (!step || step.player !== 'user') return false;

    const exp = algToRC(step.from);
    const ext = algToRC(step.to);

    const correct = fromRC.r === exp.r && fromRC.c === exp.c &&
                    toRC.r   === ext.r && toRC.c   === ext.c;

    if (!correct) {
      _callbacks.showMoveError();
      return true; // consumăm click-ul dar nu executăm mutarea
    }

    // Mutare corectă — aplică pe tablă
    _callbacks.applyLessonMove(exp, ext, step.promotion || null);
    _callbacks.clearLessonHighlights();

    // Arată explicația mutării utilizatorului
    if (step.explanation) showExplanation(step.explanation);

    const delay = step.explanation ? 2500 : 800;
    setTimeout(() => executeStep(currentStep + 1), delay);

    return true;
  }

  // ─── Panou pas curent ────────────────────────────────────────
  function updateStepPanel(step, idx) {
    const total    = activeExample.steps.length;
    const userSteps = activeExample.steps.filter(s => s.player === 'user').length;
    const doneUser  = activeExample.steps.slice(0, idx).filter(s => s.player === 'user').length;

    const indEl  = document.getElementById('step-indicator');
    const instEl = document.getElementById('step-instruction');
    const expEl  = document.getElementById('step-explanation');
    const errEl  = document.getElementById('move-error-msg');

    if (indEl) indEl.textContent =
      `${activeExample.title}  ·  Pas ${idx + 1} din ${total}`;

    const isUser = step.player === 'user';
    if (instEl) {
      instEl.textContent = isUser
        ? (step.hint || 'Fă mutarea indicată pe tablă')
        : '⟳ Calculatorul mută...';
      instEl.className = 'step-instruction ' + (isUser ? 'user-turn' : 'auto-turn');
    }

    // Curăță explicația și eroarea la fiecare pas nou
    if (expEl) expEl.textContent = '';
    if (errEl) errEl.style.display = 'none';
  }

  function showExplanation(text) {
    const el = document.getElementById('step-explanation');
    if (el && text) {
      el.textContent = text;
      // Scroll ușor spre explicație
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ─── Final lecție ─────────────────────────────────────────────
  function finishLesson() {
    markCompleted(activeLesson.id, activeExample.id);

    const indEl  = document.getElementById('step-indicator');
    const instEl = document.getElementById('step-instruction');
    const expEl  = document.getElementById('step-explanation');
    const btns   = document.getElementById('lesson-finish-btns');

    if (indEl)  indEl.textContent  = '✓ Lecție completată!';
    if (instEl) { instEl.textContent = ''; instEl.className = 'step-instruction'; }
    if (expEl)  expEl.textContent  =
      'Felicitări! Ai parcurs cu succes acest exemplu. Ce vrei să faci în continuare?';
    if (btns)   btns.style.display = 'flex';

    // Actualizează butonul "Exemplul următor"
    const nextBtn = document.getElementById('btn-lesson-next-example');
    if (nextBtn && activeLesson) {
      const curIdx = activeLesson.examples.findIndex(e => e.id === activeExample.id);
      const nextEx = activeLesson.examples[curIdx + 1];
      if (nextEx) {
        nextBtn.textContent = `→ ${nextEx.title}`;
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => {
          const finBtns = document.getElementById('lesson-finish-btns');
          if (finBtns) finBtns.style.display = 'none';
          startExample(nextEx);
        };
      } else {
        nextBtn.style.display = 'none'; // nu mai există exemplu următor
      }
    }
  }

  // ─── Joc liber ────────────────────────────────────────────────
  function startFreePlay() {
    freePlayActive = true;
    lessonActive   = false;

    const stepPanel = document.getElementById('lesson-step-panel');
    const finBtns   = document.getElementById('lesson-finish-btns');
    if (stepPanel) stepPanel.style.display = 'none';
    if (finBtns)   finBtns.style.display   = 'none';

    _callbacks.startFreePlay(activeExample.startFEN, activeExample.playerColor || 'w');
  }

  // ─── Ieșire lecție ────────────────────────────────────────────
  function exitLesson() {
    lessonActive   = false;
    freePlayActive = false;
    currentStep    = 0;

    const stepPanel = document.getElementById('lesson-step-panel');
    const finBtns   = document.getElementById('lesson-finish-btns');
    if (stepPanel) stepPanel.style.display = 'none';
    if (finBtns)   finBtns.style.display   = 'none';

    _callbacks.clearLessonHighlights();

    // Revenim la tab Învață și reîncărcăm meniul
    if (_callbacks?.switchToLearn) _callbacks.switchToLearn();
    renderLessonsMenu();
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
