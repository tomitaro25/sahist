/**
 * Șahist — Storage Module
 * All localStorage operations, namespaced with 'sahist_' prefix.
 * Future-proof: add new keys here, never scatter localStorage calls in UI code.
 */

'use strict';

const Storage = (() => {
  const PREFIX = 'sahist_';

  function key(k) { return PREFIX + k; }

  function get(k, fallback = null) {
    try {
      const val = localStorage.getItem(key(k));
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  }

  function set(k, val) {
    try { localStorage.setItem(key(k), JSON.stringify(val)); return true; }
    catch { return false; }
  }

  function remove(k) {
    try { localStorage.removeItem(key(k)); } catch {}
  }

  // ─── Settings ─────────────────────────────────────────────────────────────
  const DEFAULT_SETTINGS = {
    playerColor: 'w',       // 'w' | 'b'
    engineLevel: 'beginner', // 'beginner' | 'intermediate' (future)
    showLegalMoves: true,
    showMoveHistory: true,
    soundEnabled: false,    // future
    theme: 'dark',          // 'dark' | 'light' (future)
    apiKey: '',             // for AI tiers (future)
  };

  function getSettings() {
    return { ...DEFAULT_SETTINGS, ...get('settings', {}) };
  }

  function saveSettings(settings) {
    set('settings', { ...getSettings(), ...settings });
  }

  // ─── Game Stats ───────────────────────────────────────────────────────────
  const DEFAULT_STATS = {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    totalMoves: 0,
  };

  function getStats() {
    return { ...DEFAULT_STATS, ...get('stats', {}) };
  }

  function recordResult(result) { // 'win' | 'loss' | 'draw'
    const stats = getStats();
    stats.gamesPlayed++;
    if (result === 'win') stats.wins++;
    else if (result === 'loss') stats.losses++;
    else stats.draws++;
    set('stats', stats);
  }

  function addMoves(n) {
    const stats = getStats();
    stats.totalMoves += n;
    set('stats', stats);
  }

  // ─── Current Game ─────────────────────────────────────────────────────────
  function saveCurrentGame(fen, moveHistory, playerColor) {
    set('current_game', { fen, moveHistory, playerColor, savedAt: Date.now() });
  }

  function loadCurrentGame() {
    return get('current_game', null);
  }

  function clearCurrentGame() {
    remove('current_game');
  }

  // ─── Game History (last N games) ──────────────────────────────────────────
  const MAX_HISTORY = 20;

  function saveGameToHistory(summary) {
    // summary: { result, moves, playerColor, endFEN, date }
    const history = get('game_history', []);
    history.unshift({ ...summary, date: Date.now() });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    set('game_history', history);
  }

  function getGameHistory() {
    return get('game_history', []);
  }

  // ─── Export / Import ──────────────────────────────────────────────────────
  function exportAll() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(PREFIX)) {
        try { data[k] = JSON.parse(localStorage.getItem(k)); } catch {}
      }
    }
    return JSON.stringify(data, null, 2);
  }

  function importAll(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith(PREFIX)) localStorage.setItem(k, JSON.stringify(v));
      }
      return true;
    } catch { return false; }
  }

  return {
    getSettings, saveSettings,
    getStats, recordResult, addMoves,
    saveCurrentGame, loadCurrentGame, clearCurrentGame,
    saveGameToHistory, getGameHistory,
    exportAll, importAll
  };
})();
