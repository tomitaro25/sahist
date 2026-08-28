/**
 * Șahist — Stockfish Engine Wrapper
 *
 * Gestionează descărcarea, stocarea (IndexedDB) și comunicarea
 * cu Stockfish via UCI protocol într-un Web Worker.
 *
 * Mapare nivele 6–20:
 *   6–10  → Intermediar  (Skill 3–11)
 *   11–14 → Avansat      (Skill 12–15)
 *   15–17 → Expert       (Skill 16–18)
 *   18–20 → Maestru      (Skill 19–20)
 */

'use strict';

const StockfishEngine = (() => {

  // ─── Config ──────────────────────────────────────────────────────
  // URL-ul e citit din config.json (GitHub); fallback la hardcodat.
  const FALLBACK_URL = 'https://cdn.jsdelivr.net/npm/stockfish@18.0.8/src/stockfish-nnue-16-single.js';
  const DB_NAME      = 'sahist_stockfish';
  const DB_VERSION   = 1;
  const STORE_NAME   = 'engine_files';
  const FILE_KEY     = 'stockfish-lite';

  // Mapare nivel (6–20) → Skill Level Stockfish (0–20) + movetime (ms)
  const LEVEL_MAP = {
     6: { skill:  3, movetime:  500 },
     7: { skill:  5, movetime:  600 },
     8: { skill:  7, movetime:  700 },
     9: { skill:  9, movetime:  800 },
    10: { skill: 11, movetime:  900 },
    11: { skill: 12, movetime: 1000 },
    12: { skill: 13, movetime: 1100 },
    13: { skill: 14, movetime: 1200 },
    14: { skill: 15, movetime: 1400 },
    15: { skill: 16, movetime: 1500 },
    16: { skill: 17, movetime: 1700 },
    17: { skill: 18, movetime: 2000 },
    18: { skill: 19, movetime: 2200 },
    19: { skill: 20, movetime: 2500 },
    20: { skill: 20, movetime: 3000 },
  };

  // ─── Stare internă ────────────────────────────────────────────────
  let worker       = null;
  let workerState  = 'idle'; // idle | loading | ready | thinking
  let currentSkill = -1;
  let resolveMove  = null;
  let onStatusChange = null; // callback(state, message)

  // ─── IndexedDB ────────────────────────────────────────────────────
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    });
  }

  async function loadFromDB() {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(FILE_KEY);
        req.onsuccess = e => resolve(e.target.result || null);
        req.onerror   = e => reject(e.target.error);
      });
    } catch { return null; }
  }

  async function saveToDB(blob) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).put(blob, FILE_KEY);
        req.onsuccess = () => resolve(true);
        req.onerror   = e => reject(e.target.error);
      });
    } catch { return false; }
  }

  // ─── URL Resolution ───────────────────────────────────────────────
  async function resolveStockfishURL() {
    // 1. URL din localStorage (setat de config.json fetch la pornire)
    const stored = localStorage.getItem('sahist_stockfish_url');
    if (stored) return stored;
    // 2. Fallback hardcodat
    return FALLBACK_URL;
  }

  // ─── Download cu progress ─────────────────────────────────────────
  async function downloadStockfish(url, onProgress) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const total  = parseInt(response.headers.get('content-length') || '0');
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (onProgress && total) onProgress(received / total);
    }

    return new Blob(chunks, { type: 'application/javascript' });
  }

  // ─── Worker Lifecycle ─────────────────────────────────────────────
  function createWorkerFromBlob(blob) {
    const url = URL.createObjectURL(blob);
    const w   = new Worker(url);
    URL.revokeObjectURL(url); // liberat după creare
    return w;
  }

  function setupWorkerMessages(w) {
    w.onmessage = e => {
      const msg = typeof e.data === 'string' ? e.data : '';

      if (msg === 'uciok') {
        // UCI handshake complet — trimite isready
        w.postMessage('isready');
        return;
      }

      if (msg === 'readyok') {
        workerState = 'ready';
        if (onStatusChange) onStatusChange('ready', '');
        return;
      }

      if (msg.startsWith('bestmove') && resolveMove) {
        const parts = msg.split(' ');
        const uci   = parts[1]; // ex: "e2e4", "e1g1", "e7e8q"
        workerState = 'ready';
        const cb = resolveMove;
        resolveMove = null;
        cb(uciToMove(uci));
      }
    };

    w.onerror = err => {
      console.error('Stockfish worker error:', err);
      workerState = 'idle';
      if (resolveMove) { resolveMove(null); resolveMove = null; }
      if (onStatusChange) onStatusChange('error', err.message);
    };
  }

  // ─── Conversie UCI ↔ intern ───────────────────────────────────────
  function uciToMove(uci) {
    if (!uci || uci === '(none)') return null;
    // Format: "e2e4" sau "e7e8q" (promovare)
    const fc = uci.charCodeAt(0) - 97; // 'a'=0
    const fr = 8 - parseInt(uci[1]);
    const tc = uci.charCodeAt(2) - 97;
    const tr = 8 - parseInt(uci[3]);
    const promotion = uci.length >= 5 ? uci[4].toUpperCase() : null;
    return { from: {r:fr, c:fc}, to: {r:tr, c:tc}, promotion };
  }

  function fenFromEngine(engine) {
    return engine.getFEN();
  }

  // ─── Setare nivel Stockfish ────────────────────────────────────────
  function applySkillLevel(w, skill) {
    w.postMessage(`setoption name Skill Level value ${skill}`);
    // Erori la mutări slabe — simulează greșeli umane la nivele joase
    if (skill < 10) {
      const errProb  = Math.round(100 - skill * 8);
      const maxErr   = Math.round(300 - skill * 25);
      w.postMessage(`setoption name UCI_LimitStrength value true`);
      w.postMessage(`setoption name UCI_Elo value ${400 + skill * 80}`);
    } else {
      w.postMessage(`setoption name UCI_LimitStrength value false`);
    }
    currentSkill = skill;
  }

  // ─── Inițializare publică ─────────────────────────────────────────
  async function init(statusCallback, progressCallback) {
    if (worker && workerState !== 'idle') return; // deja inițializat

    onStatusChange = statusCallback;
    workerState = 'loading';
    if (onStatusChange) onStatusChange('loading', 'Caut motorul în cache...');

    try {
      // 1. Încearcă din IndexedDB
      let blob = await loadFromDB();

      if (!blob) {
        // 2. Descarcă
        const url = await resolveStockfishURL();
        if (onStatusChange) onStatusChange('loading', 'Se descarcă motorul Stockfish (~6MB)...');
        blob = await downloadStockfish(url, progressCallback);
        // Salvează pentru offline
        await saveToDB(blob);
        if (onStatusChange) onStatusChange('loading', 'Motor salvat. Se inițializează...');
      } else {
        if (onStatusChange) onStatusChange('loading', 'Se inițializează motorul...');
      }

      // 3. Creează worker și pornește UCI handshake
      worker = createWorkerFromBlob(blob);
      setupWorkerMessages(worker);
      worker.postMessage('uci');

    } catch (err) {
      workerState = 'idle';
      if (onStatusChange) onStatusChange('error', `Eroare: ${err.message}`);
      throw err;
    }
  }

  // ─── Obține mutarea ────────────────────────────────────────────────
  function getMove(engine, level) {
    return new Promise((resolve, reject) => {
      if (!worker || workerState !== 'ready') {
        reject(new Error('Stockfish not ready'));
        return;
      }

      const cfg      = LEVEL_MAP[level] || LEVEL_MAP[10];
      const { skill, movetime } = cfg;
      const fen      = fenFromEngine(engine);

      // Actualizează skill dacă s-a schimbat
      if (skill !== currentSkill) applySkillLevel(worker, skill);

      workerState = 'thinking';
      resolveMove = resolve;

      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go movetime ${movetime}`);
    });
  }

  // ─── getMoveWithDelay (interfața comună cu engine-local) ──────────
  function getMoveWithDelay(engine, level) {
    // Delay mic suplimentar față de movetime (UX natural)
    const extraDelay = 100 + Math.random() * 200;
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const move = await getMove(engine, level);
          resolve(move);
        } catch (err) {
          reject(err);
        }
      }, extraDelay);
    });
  }

  // ─── Verifică dacă e disponibil (fișier în cache) ─────────────────
  async function isAvailable() {
    const blob = await loadFromDB();
    return blob !== null;
  }

  function getState() { return workerState; }

  function destroy() {
    if (worker) { worker.terminate(); worker = null; }
    workerState = 'idle';
    resolveMove = null;
  }

  return { init, getMove, getMoveWithDelay, isAvailable, getState, destroy, LEVEL_MAP };
})();
