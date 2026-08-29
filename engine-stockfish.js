/**
 * Șahist — Stockfish Engine Wrapper v3
 *
 * Abordare corectă pentru Web Worker + WASM:
 * - Worker creat direct din URL CDN (nu din Blob)
 * - .wasm rezolvat corect relativ la .js pe CDN
 * - Fișierele corecte: stockfish-18-lite-single.js + .wasm
 * - UCI protocol cu confirmare isready după setoption
 * - Nivel 20: go depth 18 (putere maximă)
 */

'use strict';

const StockfishEngine = (() => {

  // URL same-origin — fișierele sunt în /stockfish/ din același repository GitHub
  // Browserele blochează new Worker() cu URL-uri cross-origin (jsdelivr etc.)
  // Soluție: fișierele .js și .wasm sunt uploadate direct în repo
  const FALLBACK_URL = './stockfish/stockfish-18-lite-single.js';

  // ─── Mapare nivele 6–20 ───────────────────────────────────────────
  // limitStrength: true → UCI_LimitStrength + UCI_Elo (comportament ELO realist)
  // limitStrength: false → Skill Level pur (putere algoritmică directă)
  // depth: în loc de movetime pentru nivel 20 (putere maximă)
  const LEVEL_MAP = {
     6: { skill: 20, elo:  800, movetime:  600, limitStrength: true  },
     7: { skill: 20, elo: 1000, movetime:  700, limitStrength: true  },
     8: { skill: 20, elo: 1150, movetime:  800, limitStrength: true  },
     9: { skill: 20, elo: 1300, movetime:  900, limitStrength: true  },
    10: { skill: 20, elo: 1450, movetime: 1000, limitStrength: true  },
    11: { skill: 20, elo: 1600, movetime: 1200, limitStrength: true  },
    12: { skill: 20, elo: 1700, movetime: 1400, limitStrength: true  },
    13: { skill: 20, elo: 1850, movetime: 1600, limitStrength: true  },
    14: { skill: 20, elo: 2000, movetime: 2000, limitStrength: true  },
    15: { skill: 20, elo: 2100, movetime: 2000, limitStrength: true  },
    16: { skill: 20, elo: 2200, movetime: 2500, limitStrength: true  },
    17: { skill: 20, elo: 2400, movetime: 3000, limitStrength: true  },
    18: { skill: 20, elo: 2600, movetime: 4000, limitStrength: true  },
    19: { skill: 20, elo: 2800, movetime: 5000, limitStrength: true  },
    20: { skill: 20, elo: 3600, depth:      18, limitStrength: false },
  };

  // ─── Stare internă ────────────────────────────────────────────────
  let worker       = null;
  let workerReady  = false;
  let resolveReady = null;
  let resolveMove  = null;
  let currentCfgKey = '';
  let onStatusChange = null;

  // ─── Creare worker din URL ────────────────────────────────────────
  // Worker direct din URL CDN — .wasm e rezolvat corect relativ la .js
  function createWorkerFromURL(url) {
    return new Worker(url);
  }

  // ─── Mesaje worker ────────────────────────────────────────────────
  function setupWorker(w) {
    w.onmessage = e => {
      const msg = typeof e.data === 'string' ? e.data
                : (e.data?.data || '');

      if (msg.startsWith('Stockfish') || msg === '') return; // mesaje de info

      if (msg === 'uciok') {
        w.postMessage('isready');
        return;
      }

      if (msg === 'readyok') {
        if (!workerReady) {
          workerReady = true;
          if (onStatusChange) onStatusChange('ready', '');
        }
        if (resolveReady) { resolveReady(); resolveReady = null; }
        return;
      }

      if (msg.startsWith('bestmove') && resolveMove) {
        const uci = msg.split(' ')[1];
        const cb  = resolveMove;
        resolveMove = null;
        cb(uciToMove(uci));
      }
    };

    w.onerror = err => {
      console.error('Stockfish worker error:', err.message || err);
      workerReady = false;
      if (resolveMove)  { resolveMove(null);  resolveMove = null;  }
      if (resolveReady) { resolveReady();      resolveReady = null; }
      if (onStatusChange) onStatusChange('error', String(err.message || err));
    };
  }

  // ─── Așteaptă readyok ────────────────────────────────────────────
  function waitReady(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolveReady = null;
        reject(new Error('Stockfish readyok timeout'));
      }, timeoutMs);
      resolveReady = () => { clearTimeout(timer); resolve(); };
    });
  }

  // ─── Conversie UCI → move ─────────────────────────────────────────
  function uciToMove(uci) {
    if (!uci || uci === '(none)') return null;
    const fc = uci.charCodeAt(0) - 97;
    const fr = 8 - parseInt(uci[1]);
    const tc = uci.charCodeAt(2) - 97;
    const tr = 8 - parseInt(uci[3]);
    const promotion = uci.length >= 5 ? uci[4].toUpperCase() : null;
    return { from:{r:fr, c:fc}, to:{r:tr, c:tc}, promotion };
  }

  // ─── URL resolution ───────────────────────────────────────────────
  function getStockfishURL() {
    return localStorage.getItem('sahist_stockfish_url') || FALLBACK_URL;
  }

  // ─── Aplică nivel cu confirmare ────────────────────────────────────
  async function applyLevel(cfg) {
    // Resetează LimitStrength mai întâi
    worker.postMessage('setoption name UCI_LimitStrength value false');

    if (cfg.limitStrength) {
      worker.postMessage(`setoption name UCI_Elo value ${cfg.elo}`);
      worker.postMessage(`setoption name UCI_LimitStrength value true`);
    }
    worker.postMessage(`setoption name Skill Level value ${cfg.skill}`);

    // Confirmare că opțiunile sunt aplicate
    worker.postMessage('isready');
    await waitReady(5000);
  }

  // ─── Init public ──────────────────────────────────────────────────
  async function init(statusCallback) {
    if (worker && workerReady) return;

    onStatusChange = statusCallback;
    if (onStatusChange) onStatusChange('loading', 'Se inițializează Stockfish...');

    try {
      const url = getStockfishURL();
      worker = createWorkerFromURL(url);
      setupWorker(worker);

      // UCI handshake
      worker.postMessage('uci');

      // Așteptăm readyok inițial
      await waitReady(20000);

      if (onStatusChange) onStatusChange('ready', '');

    } catch (err) {
      if (worker) { worker.terminate(); worker = null; }
      workerReady = false;
      if (onStatusChange) onStatusChange('error', err.message);
      throw err;
    }
  }

  // ─── getMove ──────────────────────────────────────────────────────
  async function getMove(engine, level) {
    if (!worker || !workerReady) throw new Error('Stockfish not ready');

    const cfg    = LEVEL_MAP[level] || LEVEL_MAP[20];
    const cfgKey = `${level}_${cfg.elo}_${cfg.limitStrength}`;
    const fen    = engine.getFEN();

    // Aplică configurația dacă s-a schimbat nivelul
    if (cfgKey !== currentCfgKey) {
      await applyLevel(cfg);
      currentCfgKey = cfgKey;
    }

    return new Promise((resolve) => {
      resolveMove = resolve;
      worker.postMessage(`position fen ${fen}`);
      if (cfg.depth) {
        worker.postMessage(`go depth ${cfg.depth}`);
      } else {
        worker.postMessage(`go movetime ${cfg.movetime}`);
      }
    });
  }

  async function getMoveWithDelay(engine, level) {
    return getMove(engine, level);
  }

  function getState() {
    return workerReady ? 'ready' : 'idle';
  }

  function destroy() {
    if (worker) { worker.terminate(); worker = null; }
    workerReady   = false;
    resolveMove   = null;
    resolveReady  = null;
    currentCfgKey = '';
  }

  return { init, getMove, getMoveWithDelay, getState, destroy, LEVEL_MAP };
})();
