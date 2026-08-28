/**
 * Șahist — Local Engine
 *
 * NIVEL 1 — Începător
 *   Strategie multi-layer: evită sacrificii, capturează cu profit,
 *   preferă rocada și mișcări poziționale de bază.
 *   Erori frecvente, dar nu flagrante.
 *
 * NIVEL 2 — Intermediar
 *   Minimax adâncime 2 cu alpha-beta pruning + evaluare pozițională completă.
 *   Vede amenințările cu 2 mutări înainte, atacă activ, apără piesele,
 *   încearcă să dea șah și mat, controlează centrul, evită să lase
 *   piesele în bătaie. Nivel incepator-intermediar spre mediu.
 */

'use strict';

const LocalEngine = (() => {

  // ─── Valori piese ────────────────────────────────────────────────
  const VAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

  // ─── Tabele poziționale (perspectiva albului, negrul le răstoarnă) ─
  // Sursa: clasic Piece-Square Tables (Shannon/Kaufman adaptat)
  const PST = {
    P: [
       0,  0,  0,  0,  0,  0,  0,  0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
       5,  5, 10, 25, 25, 10,  5,  5,
       0,  0,  0, 20, 20,  0,  0,  0,
       5, -5,-10,  0,  0,-10, -5,  5,
       5, 10, 10,-20,-20, 10, 10,  5,
       0,  0,  0,  0,  0,  0,  0,  0
    ],
    N: [
      -50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50
    ],
    B: [
      -20,-10,-10,-10,-10,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,
      -10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,
      -10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,
      -20,-10,-10,-10,-10,-10,-10,-20
    ],
    R: [
       0,  0,  0,  0,  0,  0,  0,  0,
       5, 10, 10, 10, 10, 10, 10,  5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
       0,  0,  0,  5,  5,  0,  0,  0
    ],
    Q: [
      -20,-10,-10, -5, -5,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10,
       -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,
      -10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,
      -20,-10,-10, -5, -5,-10,-10,-20
    ],
    K_mid: [  // Rege în deschidere/mijloc joc — stă în colț, rocat
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,
      -10,-20,-20,-20,-20,-20,-20,-10,
       20, 20,  0,  0,  0,  0, 20, 20,
       20, 30, 10,  0,  0, 10, 30, 20
    ],
    K_end: [  // Rege în final — merge spre centru
      -50,-40,-30,-20,-20,-30,-40,-50,
      -30,-20,-10,  0,  0,-10,-20,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 30, 40, 40, 30,-10,-30,
      -30,-10, 20, 30, 30, 20,-10,-30,
      -30,-30,  0,  0,  0,  0,-30,-30,
      -50,-30,-30,-30,-30,-30,-30,-50
    ]
  };

  // ─── Helpers board ───────────────────────────────────────────────
  function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  function applyMoveToBoard(board, move) {
    const nb = board.map(row => row.map(p => p ? { ...p } : null));
    const piece = nb[move.from.r][move.from.c];
    nb[move.to.r][move.to.c] = move.promotion
      ? { color: piece.color, type: move.promotion } : piece;
    nb[move.from.r][move.from.c] = null;
    if (move.enPassant) nb[move.from.r][move.to.c] = null;
    if (move.castling === 'K') { nb[7][5] = nb[7][7]; nb[7][7] = null; }
    if (move.castling === 'Q') { nb[7][3] = nb[7][0]; nb[7][0] = null; }
    if (move.castling === 'k') { nb[0][5] = nb[0][7]; nb[0][7] = null; }
    if (move.castling === 'q') { nb[0][3] = nb[0][0]; nb[0][0] = null; }
    return nb;
  }

  function countMaterial(board) {
    let total = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type !== 'K') total += VAL[p.type];
      }
    return total;
  }

  function isEndgame(board) {
    return countMaterial(board) < 1800; // sub ~4 piese majore
  }

  // ─── Evaluare statică poziție (din perspectiva albului) ──────────
  function evaluate(board) {
    const endgame = isEndgame(board);
    let score = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;

        const pstIdx = p.color === 'w' ? r * 8 + c : (7 - r) * 8 + (7 - c);
        let pieceScore = VAL[p.type];

        if (p.type === 'K') {
          pieceScore += endgame ? PST.K_end[pstIdx] : PST.K_mid[pstIdx];
        } else {
          pieceScore += (PST[p.type] || [])[pstIdx] || 0;
        }

        score += p.color === 'w' ? pieceScore : -pieceScore;
      }
    }

    return score;
  }

  // ─── Ordonare mutări pentru alpha-beta (MVV-LVA) ────────────────
  function orderMoves(moves, board) {
    return moves.slice().sort((a, b) => {
      const score = m => {
        if (m.castling) return 80;
        if (m.promotion) return 70;
        const victim = m.enPassant ? { type: 'P' } : board[m.to.r][m.to.c];
        if (victim) {
          const atk = board[m.from.r][m.from.c];
          return 50 + VAL[victim.type] / 10 - VAL[atk.type] / 100;
        }
        return 0;
      };
      return score(b) - score(a);
    });
  }

  // ─── Snapshot / Restore pentru minimax ──────────────────────────
  // Salvăm și restaurăm starea completă a engine-ului între mutări.
  // Singura metodă sigură fără a modifica chess-engine.js.
  function saveState(engine) {
    return {
      fen: engine.getFEN(),
      history: engine.getMoveHistory().map(h => ({
        move: { ...h.move,
          from: { ...h.move.from },
          to: { ...h.move.to }
        }
      }))
    };
  }

  function restoreState(engine, snapshot) {
    engine.init(snapshot.fen);
    // FEN include tot (turn, castling, en passant) — nu trebuie replay
  }

  // ─── Negamax adâncime 1 (fără recursie ulterioară) ──────────────
  // Evaluează: propria mutare → cel mai bun răspuns adversar → evaluate.
  // Total: 2 niveluri de gândire, rapid în browser.
  function negamax(engine, alpha, beta) {
    // Deja la adâncime finală: evaluare statică
    if (engine.isGameOver()) {
      const board = engine.getBoard();
      const score = evaluate(board);
      return engine.getTurn() === 'w' ? score : -score;
    }

    const turn = engine.getTurn();
    const allMoves = engine.getAllLegalMoves(turn);
    if (allMoves.length === 0) return engine.isGameOver() ? -20000 : 0;

    const board = engine.getBoard();
    const ordered = orderMoves(allMoves, board);

    let best = -Infinity;
    for (const move of ordered) {
      if (engine.needsPromotion(move)) move.promotion = 'Q';

      const snap = saveState(engine);
      engine.applyMove(move);

      // Evaluare statică din perspectiva adversarului (negăm)
      const evalBoard = engine.getBoard();
      const rawScore = evaluate(evalBoard);
      // Scor din perspectiva curentului (înainte de mutare)
      const val = turn === 'w' ? rawScore : -rawScore;

      restoreState(engine, snap);

      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (alpha >= beta) break;
    }
    return best;
  }

  // ─── getBestMoveLevel2 ───────────────────────────────────────────
  // Logică: pentru fiecare mutare proprie, simulează cel mai bun
  // răspuns al adversarului și alege mutarea cu scorul net cel mai bun.
  function getBestMoveLevel2(engine) {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    if (allMoves.length === 1) {
      const m = allMoves[0];
      if (engine.needsPromotion(m)) m.promotion = 'Q';
      return m;
    }

    const board = engine.getBoard();
    const ordered = orderMoves(allMoves, board);
    const aiColor = engine.getTurn();

    let bestScore = -Infinity;
    let bestMove = ordered[0];

    for (const move of ordered) {
      if (engine.needsPromotion(move)) move.promotion = 'Q';

      // Aplică mutarea AI
      const snap1 = saveState(engine);
      engine.applyMove(move);

      let score;
      if (engine.isGameOver()) {
        // Mat imediat sau remiză
        const st = engine.getStatus();
        score = st === 'checkmate' ? 19000 : 0;
      } else {
        // Simulează cel mai bun răspuns adversar
        const oppMoves = engine.getAllLegalMoves(engine.getTurn());
        const oppBoard = engine.getBoard();
        const oppOrdered = orderMoves(oppMoves, oppBoard);

        let worstForAI = Infinity;
        for (const oppMove of oppOrdered) {
          if (engine.needsPromotion(oppMove)) oppMove.promotion = 'Q';
          const snap2 = saveState(engine);
          engine.applyMove(oppMove);

          const evalScore = evaluate(engine.getBoard());
          // Din perspectiva AI-ului
          const aiScore = aiColor === 'w' ? evalScore : -evalScore;

          restoreState(engine, snap2);

          if (aiScore < worstForAI) worstForAI = aiScore;
          // Early exit dacă adversarul găsește ceva catastrofal
          if (worstForAI < bestScore - 500) break;
        }
        score = worstForAI === Infinity ? evaluate(engine.getBoard()) : worstForAI;
        if (aiColor === 'b') score = -evaluate(engine.getBoard());
        score = oppMoves.length === 0 ? (engine.isGameOver() ? 19000 : 0) : worstForAI;
      }

      restoreState(engine, snap1);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // ═══════════════════════════════════════════════════════════════
  // NIVEL 1 — Comenzi și helpers
  // ═══════════════════════════════════════════════════════════════

  function captureNetValue(engine, move) {
    const board = engine.getBoard();
    const attacker = board[move.from.r][move.from.c];
    const victim = move.enPassant ? { type: 'P' } : board[move.to.r][move.to.c];
    if (!victim) return 0;
    const gain = VAL[victim.type] / 100;
    const cost = VAL[attacker.type] / 100;
    const nb = applyMoveToBoard(board, move);
    const defended = isSquareAttackedByFast(nb, move.to.r, move.to.c,
      attacker.color === 'w' ? 'b' : 'w');
    return defended ? gain - cost : gain;
  }

  function isSquareAttackedByFast(board, tr, tc, attackerColor) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.color !== attackerColor) continue;
        if (canAttackSquare(board, r, c, tr, tc, p.type, p.color)) return true;
      }
    return false;
  }

  function canAttackSquare(board, fr, fc, tr, tc, type, color) {
    const dr = tr - fr, dc = tc - fc;
    const absDr = Math.abs(dr), absDc = Math.abs(dc);
    switch (type) {
      case 'P': { const d = color === 'w' ? -1 : 1; return dr === d && absDc === 1; }
      case 'N': return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
      case 'B': return absDr === absDc && slidesClear(board, fr, fc, Math.sign(dr), Math.sign(dc), tr, tc);
      case 'R': return (dr === 0 || dc === 0) && slidesClear(board, fr, fc, Math.sign(dr), Math.sign(dc), tr, tc);
      case 'Q': return ((dr === 0 || dc === 0) || absDr === absDc) &&
                       slidesClear(board, fr, fc, Math.sign(dr), Math.sign(dc), tr, tc);
      case 'K': return absDr <= 1 && absDc <= 1;
    }
    return false;
  }

  function slidesClear(board, fr, fc, ddr, ddc, tr, tc) {
    let r = fr + ddr, c = fc + ddc;
    while (r !== tr || c !== tc) {
      if (!inBounds(r, c)) return false;
      if (board[r][c]) return false;
      r += ddr; c += ddc;
    }
    return true;
  }

  function quietScore(engine, move) {
    const board = engine.getBoard();
    const piece = board[move.from.r][move.from.c];
    let score = 0;
    if (move.castling) return 60 + Math.random() * 10;
    if (move.promotion) return 80;
    const toR = move.to.r, toC = move.to.c;
    const distCenter = Math.abs(3.5 - toR) + Math.abs(3.5 - toC);
    switch (piece.type) {
      case 'P':
        score += piece.color === 'w' ? (6 - toR) * 3 : toR * 3;
        if (toC >= 2 && toC <= 5) score += 4;
        break;
      case 'N': case 'B':
        if ((piece.color === 'w' && move.from.r === 7) ||
            (piece.color === 'b' && move.from.r === 0)) score += 10;
        score += Math.max(0, 8 - distCenter * 1.5);
        break;
      case 'R': score += 2; break;
      case 'Q':
        if (engine.getMoveHistory().length < 10) score -= 5;
        score += Math.max(0, 4 - distCenter);
        break;
      case 'K':
        if (engine.getMoveHistory().length < 30 && !move.castling) score -= 15;
        break;
    }
    score += Math.random() * 5;
    return score;
  }

  function getBestMoveLevel1(engine) {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    const board = engine.getBoard();
    const captures = [], quietMoves = [];
    for (const m of allMoves) {
      const isCapture = m.enPassant || board[m.to.r][m.to.c] !== null;
      if (isCapture) captures.push({ move: m, net: captureNetValue(engine, m) });
      else quietMoves.push(m);
    }
    const goodCaptures = captures.filter(c => c.net > 0);
    if (goodCaptures.length > 0) {
      goodCaptures.sort((a, b) => b.net - a.net);
      const best = goodCaptures[0].net;
      const tied = goodCaptures.filter(c => c.net === best);
      return tied[Math.floor(Math.random() * tied.length)].move;
    }
    const equalCaptures = captures.filter(c => c.net === 0);
    if (equalCaptures.length > 0 && Math.random() < 0.40)
      return equalCaptures[Math.floor(Math.random() * equalCaptures.length)].move;
    const candidateMoves = quietMoves.length > 0 ? quietMoves : allMoves.filter(m => {
      const net = captureNetValue(engine, m);
      return net >= -1;
    });
    const pool = candidateMoves.length > 0 ? candidateMoves : allMoves;
    const scored = pool.map(m => ({ move: m, score: quietScore(engine, m) }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(3, scored.length));
    const weights = [0.50, 0.30, 0.20];
    const r = Math.random();
    let cumul = 0;
    for (let i = 0; i < top.length; i++) {
      cumul += weights[i] || 0.20;
      if (r < cumul) return top[i].move;
    }
    return top[0].move;
  }

  // ─── API public ─────────────────────────────────────────────────
  function getBestMove(engine, level = 'beginner') {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    if (level === 'intermediate') return getBestMoveLevel2(engine);
    return getBestMoveLevel1(engine);
  }

  function getMoveWithDelay(engine, level = 'beginner', minMs, maxMs) {
    // Nivel 2 e mai greu — delay mai mare ca să pară că "gândește"
    const mn = minMs ?? (level === 'intermediate' ? 700 : 500);
    const mx = maxMs ?? (level === 'intermediate' ? 1500 : 1200);
    return new Promise(resolve => {
      const delay = mn + Math.random() * (mx - mn);
      setTimeout(() => resolve(getBestMove(engine, level)), delay);
    });
  }

  return { getBestMove, getMoveWithDelay };
})();
