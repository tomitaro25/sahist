/**
 * Șahist — Local Engine (Beginner)
 * Strategy: capture if possible, otherwise random legal move.
 * Designed to be weak but not completely random — feels like a beginner opponent.
 * Future: extend with heuristic tiers (intermediate, defensive, positional).
 */

'use strict';

const LocalEngine = (() => {

  const PIECE_VALUE = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };

  /**
   * Pick the best move for the current player (always used for the AI color).
   * Level 'beginner': captures if possible (highest value first), else random.
   */
  function getBestMove(engine, level = 'beginner') {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;

    if (level === 'beginner') {
      return getBeginner(engine, allMoves);
    }

    // Future levels: intermediate, strong
    return getRandom(allMoves);
  }

  function getBeginner(engine, allMoves) {
    const board = engine.getBoard();

    // Separate captures from quiet moves
    const captures = allMoves.filter(m => {
      if (m.enPassant) return true;
      const target = board[m.to.r][m.to.c];
      return target !== null;
    });

    if (captures.length > 0) {
      // Sort by captured piece value descending
      captures.sort((a, b) => {
        const valA = captureValue(board, a);
        const valB = captureValue(board, b);
        return valB - valA;
      });
      // Pick best capture (with small random among equal values)
      const bestVal = captureValue(board, captures[0]);
      const bestCaptures = captures.filter(m => captureValue(board, m) === bestVal);
      return bestCaptures[Math.floor(Math.random() * bestCaptures.length)];
    }

    // No captures: pick a random legal move
    return getRandom(allMoves);
  }

  function captureValue(board, move) {
    if (move.enPassant) return PIECE_VALUE['P'];
    const target = board[move.to.r][move.to.c];
    return target ? (PIECE_VALUE[target.type] || 0) : 0;
  }

  function getRandom(allMoves) {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  /**
   * Add a small delay so the AI move doesn't feel instant (human-like pause).
   */
  function getMoveWithDelay(engine, level = 'beginner', minMs = 400, maxMs = 900) {
    return new Promise(resolve => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      setTimeout(() => resolve(getBestMove(engine, level)), delay);
    });
  }

  return { getBestMove, getMoveWithDelay };
})();
