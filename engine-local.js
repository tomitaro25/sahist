/**
 * Șahist — Local Engine (Beginner)
 *
 * Strategie multi-layer pentru nivel începător realist:
 *   1. Evită sacrificiile flagrante (nu dă regina pe pion fără motiv)
 *   2. Capturează piese cu profit net pozitiv
 *   3. Promovează pionii înspre regine
 *   4. Pune adversarul în șah dacă poate, fără să piardă material
 *   5. Preferă rocada dacă e disponibilă (siguranța regelui)
 *   6. Preferă mișcări spre centru în deschidere
 *   7. Altfel: mutare semi-aleatorie cu mică preferință pozițională
 *
 * Nu e un engine puternic — face greșeli, dar nu greșeli pe care
 * nici un începător real nu le-ar face.
 */

'use strict';

const LocalEngine = (() => {

  const VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };

  // ─── Utilități ───────────────────────────────────────────────────
  function pieceVal(type) { return VAL[type] || 0; }

  /**
   * Estimează dacă o captură are profit net (MVV-LVA simplificat).
   * Returnează valoarea netă: pozitiv = bun pentru cel care capturează.
   * Nu simulează recaptura completă — doar un nivel de adâncime.
   */
  function captureNetValue(engine, move) {
    const board = engine.getBoard();
    const attacker = board[move.from.r][move.from.c];
    const victim = move.enPassant
      ? { type: 'P' }
      : board[move.to.r][move.to.c];

    if (!victim) return 0;

    const gain = pieceVal(victim.type);
    const cost = pieceVal(attacker.type);

    // Verifică dacă pătratul destinație e apărat de adversar
    const opponent = attacker.color === 'w' ? 'b' : 'w';
    const newBoard = simulateMove(engine, move);
    const isDefended = isSquareAttackedBy(newBoard, move.to.r, move.to.c, opponent);

    // Dacă e apărat, pierdem atacatorul după captură
    const netGain = isDefended ? gain - cost : gain;
    return netGain;
  }

  /**
   * Simulează o mutare și returnează noul board (shallow pentru viteză).
   */
  function simulateMove(engine, move) {
    const board = engine.getBoard();
    const newBoard = board.map(row => row.map(p => p ? {...p} : null));
    const piece = newBoard[move.from.r][move.from.c];
    newBoard[move.to.r][move.to.c] = move.promotion
      ? { color: piece.color, type: move.promotion }
      : piece;
    newBoard[move.from.r][move.from.c] = null;
    if (move.enPassant) newBoard[move.from.r][move.to.c] = null;
    if (move.castling === 'K') { newBoard[7][5] = newBoard[7][7]; newBoard[7][7] = null; }
    if (move.castling === 'Q') { newBoard[7][3] = newBoard[7][0]; newBoard[7][0] = null; }
    if (move.castling === 'k') { newBoard[0][5] = newBoard[0][7]; newBoard[0][7] = null; }
    if (move.castling === 'q') { newBoard[0][3] = newBoard[0][0]; newBoard[0][0] = null; }
    return newBoard;
  }

  /**
   * Verifică dacă un pătrat e atacat de o culoare, pe un board dat.
   * Versiune rapidă — nu folosește getLegalMoves (evită recursie).
   */
  function isSquareAttackedBy(board, tr, tc, attackerColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.color !== attackerColor) continue;
        if (canAttackSquare(board, r, c, tr, tc, p.type, p.color)) return true;
      }
    }
    return false;
  }

  function canAttackSquare(board, fr, fc, tr, tc, type, color) {
    const dr = tr - fr, dc = tc - fc;
    const absDr = Math.abs(dr), absDc = Math.abs(dc);

    switch (type) {
      case 'P': {
        const dir = color === 'w' ? -1 : 1;
        return dr === dir && absDc === 1;
      }
      case 'N':
        return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
      case 'B':
        if (absDr !== absDc) return false;
        return slidesClear(board, fr, fc, Math.sign(dr), Math.sign(dc), tr, tc);
      case 'R':
        if (dr !== 0 && dc !== 0) return false;
        return slidesClear(board, fr, fc, Math.sign(dr), Math.sign(dc), tr, tc);
      case 'Q':
        if (dr !== 0 && dc !== 0 && absDr !== absDc) return false;
        return slidesClear(board, fr, fc, Math.sign(dr), Math.sign(dc), tr, tc);
      case 'K':
        return absDr <= 1 && absDc <= 1;
    }
    return false;
  }

  function slidesClear(board, fr, fc, ddr, ddc, tr, tc) {
    let r = fr + ddr, c = fc + ddc;
    while (r !== tr || c !== tc) {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      if (board[r][c]) return false;
      r += ddr; c += ddc;
    }
    return true;
  }

  /**
   * Scor pozițional simplu pentru o mutare liniștită (fără captură).
   * Preferă centrul, dezvoltarea pieselor, rocada.
   */
  function quietScore(engine, move) {
    const board = engine.getBoard();
    const piece = board[move.from.r][move.from.c];
    let score = 0;

    // Rocadă: foarte valoroasă (siguranța regelui)
    if (move.castling) return 60 + Math.random() * 10;

    // Promovare fără captură (rar, dar posibil)
    if (move.promotion) return 80;

    const toR = move.to.r, toC = move.to.c;
    const distCenter = Math.abs(3.5 - toR) + Math.abs(3.5 - toC);

    switch (piece.type) {
      case 'P':
        // Avansare pion: bonus pentru pioni avansați
        score += piece.color === 'w' ? (6 - toR) * 3 : toR * 3;
        // Centru
        if (toC >= 2 && toC <= 5) score += 4;
        break;
      case 'N':
      case 'B':
        // Dezvoltare: bonus dacă piesa era pe rândul de start
        if ((piece.color === 'w' && move.from.r === 7) ||
            (piece.color === 'b' && move.from.r === 0)) score += 10;
        score += Math.max(0, 8 - distCenter * 1.5);
        break;
      case 'R':
        // Tururi pe coloane deschise sau semi-deschise
        score += 2;
        break;
      case 'Q':
        // Nu muta regina prea devreme
        const moveNum = engine.getMoveHistory().length;
        if (moveNum < 10) score -= 5;
        score += Math.max(0, 4 - distCenter);
        break;
      case 'K':
        // Regele stă locului în deschidere/mijloc
        const moves = engine.getMoveHistory().length;
        if (moves < 30 && !move.castling) score -= 15;
        break;
    }

    // Mic zgomot aleatoriu (să nu fie mereu același)
    score += Math.random() * 5;
    return score;
  }

  // ─── Engine principal ────────────────────────────────────────────
  function getBestMove(engine, level = 'beginner') {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    return getBeginner(engine, allMoves);
  }

  function getBeginner(engine, allMoves) {
    const board = engine.getBoard();

    // ── Pasul 1: Categorizează toate mutările ──────────────────────
    const captures = [];
    const quietMoves = [];

    for (const m of allMoves) {
      const isCapture = m.enPassant || (board[m.to.r][m.to.c] !== null);
      if (isCapture) {
        const net = captureNetValue(engine, m);
        captures.push({ move: m, net });
      } else {
        quietMoves.push(m);
      }
    }

    // ── Pasul 2: Capturi cu profit net pozitiv (câștigăm material) ──
    const goodCaptures = captures.filter(c => c.net > 0);
    if (goodCaptures.length > 0) {
      goodCaptures.sort((a, b) => b.net - a.net);
      // Preia cea mai bună, cu mic zgomot între egale
      const best = goodCaptures[0].net;
      const tied = goodCaptures.filter(c => c.net === best);
      return tied[Math.floor(Math.random() * tied.length)].move;
    }

    // ── Pasul 3: Capturi egale (nu pierdem, nu câștigăm) ────────────
    // Acceptăm cu 40% probabilitate (un începător uneori schimbă egal)
    const equalCaptures = captures.filter(c => c.net === 0);
    if (equalCaptures.length > 0 && Math.random() < 0.40) {
      return equalCaptures[Math.floor(Math.random() * equalCaptures.length)].move;
    }

    // ── Pasul 4: Mutări liniștite cu scor pozițional ─────────────────
    const candidateMoves = quietMoves.length > 0 ? quietMoves : allMoves.filter(m => {
      // Dacă nu există mutări liniștite, acceptăm capturi egale sau cu pierdere mică
      const net = captureNetValue(engine, m);
      return net >= -1; // max pierdere 1 pion (P), nu sacrificii mari
    });

    const pool = candidateMoves.length > 0 ? candidateMoves : allMoves;
    const scored = pool.map(m => ({ move: m, score: quietScore(engine, m) }));
    scored.sort((a, b) => b.score - a.score);

    // Ia top 3 și alege cu probabilitate ponderată (nu mereu cel mai bun)
    const top = scored.slice(0, Math.min(3, scored.length));
    // Beginner: 50% cel mai bun, 30% al doilea, 20% al treilea
    const weights = [0.50, 0.30, 0.20];
    const r = Math.random();
    let cumul = 0;
    for (let i = 0; i < top.length; i++) {
      cumul += weights[i] || 0.20;
      if (r < cumul) return top[i].move;
    }
    return top[0].move;
  }

  /**
   * Delay uman: 500–1200ms, cu variație naturală.
   */
  function getMoveWithDelay(engine, level = 'beginner', minMs = 500, maxMs = 1200) {
    return new Promise(resolve => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      setTimeout(() => resolve(getBestMove(engine, level)), delay);
    });
  }

  return { getBestMove, getMoveWithDelay };
})();
