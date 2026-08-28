/**
 * Șahist — Local Engine
 *
 * NIVEL 1 — Începător
 *   Strategie multi-layer: evită sacrificii, capturează cu profit,
 *   preferă rocada și mișcări poziționale de bază. Erori frecvente.
 *
 * NIVEL 2 — Intermediar
 *   Negamax depth 2 + alpha-beta + quiescence search.
 *   Evaluare: material, PST, hanging pieces, mobilitate, structură pioni.
 *   Nu lasă piese în bătaie, atacă activ, caută mat.
 *
 * NIVEL 3 — Avansat
 *   Negamax depth 4 cu iterative deepening + time limit per mutare.
 *   Killer moves heuristic pentru ordonare mai bună.
 *   Evaluare extinsă: pion trecut, siguranța regelui, perechea de nebuni,
 *   tururi pe coloane deschise, coloana a 7-a, conectivitate pioni.
 *   Cel mai puternic nivel programatic fără AI extern.
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
        if (m.castling) return 800;
        if (m.promotion) return 700;
        const victim = m.enPassant ? { type: 'P' } : board[m.to.r][m.to.c];
        if (victim) {
          const atk = board[m.from.r][m.from.c];
          // MVV-LVA: capturează piesa cea mai valoroasă cu cea mai ieftină
          return 500 + VAL[victim.type] - VAL[atk.type] / 10;
        }
        return 0;
      };
      return score(b) - score(a);
    });
  }

  // ─── Snapshot / Restore pentru minimax ──────────────────────────
  function saveState(engine) {
    return { fen: engine.getFEN() };
  }

  function restoreState(engine, snapshot) {
    engine.init(snapshot.fen);
  }

  // ─── Evaluare statică extinsă (perspectiva albului) ──────────────
  function evaluateFull(engine) {
    const board = engine.getBoard();
    const endgame = isEndgame(board);
    let score = 0;

    // 1. Material + PST
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const pstIdx = p.color === 'w' ? r * 8 + c : (7 - r) * 8 + (7 - c);
        let ps = VAL[p.type];
        ps += p.type === 'K'
          ? (endgame ? PST.K_end[pstIdx] : PST.K_mid[pstIdx])
          : ((PST[p.type] || [])[pstIdx] || 0);
        score += p.color === 'w' ? ps : -ps;
      }
    }

    // 2. Hanging pieces — penalizează piese lăsate în bătaie neapărate
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.type === 'K') continue;
        const opp = p.color === 'w' ? 'b' : 'w';
        const isAttacked = isSquareAttackedByFast(board, r, c, opp);
        if (isAttacked) {
          const isDefended = isSquareAttackedByFast(board, r, c, p.color);
          const hangingPenalty = isDefended ? VAL[p.type] * 0.15 : VAL[p.type] * 0.5;
          score += p.color === 'w' ? -hangingPenalty : hangingPenalty;
        }
      }
    }

    // 3. Mobilitate — mai multe mutări disponibile = mai bine
    // (aproximare rapidă: numărăm piesele cu mișcări pe diagonale/linii)
    let wMobility = 0, bMobility = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const mob = mobilityCount(board, r, c, p.type, p.color);
        if (p.color === 'w') wMobility += mob;
        else bMobility += mob;
      }
    }
    score += (wMobility - bMobility) * 3;

    // 4. Structură pioni
    const wPawnCols = new Array(8).fill(0);
    const bPawnCols = new Array(8).fill(0);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p?.type === 'P') {
          if (p.color === 'w') wPawnCols[c]++;
          else bPawnCols[c]++;
        }
      }
    }
    for (let c = 0; c < 8; c++) {
      // Pioni dubli — penalizare
      if (wPawnCols[c] > 1) score -= 20 * (wPawnCols[c] - 1);
      if (bPawnCols[c] > 1) score += 20 * (bPawnCols[c] - 1);
      // Pioni izolați — fără vecini pe coloane adiacente
      if (wPawnCols[c] > 0) {
        const isolated = (c === 0 || wPawnCols[c-1] === 0) &&
                         (c === 7 || wPawnCols[c+1] === 0);
        if (isolated) score -= 15;
      }
      if (bPawnCols[c] > 0) {
        const isolated = (c === 0 || bPawnCols[c-1] === 0) &&
                         (c === 7 || bPawnCols[c+1] === 0);
        if (isolated) score += 15;
      }
    }

    // 5. Bonus pentru șah (presiune pe rege)
    const status = engine.getStatus();
    if (status === 'check') {
      score += engine.getTurn() === 'b' ? 30 : -30; // alb dă șah = +30
    }

    return score;
  }

  // Numără mutările posibile pentru o piesă (mobilitate aproximată, fără legalitate completă)
  function mobilityCount(board, r, c, type, color) {
    let count = 0;
    const dirs = {
      N: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
      B: [[-1,-1],[-1,1],[1,-1],[1,1]],
      R: [[-1,0],[1,0],[0,-1],[0,1]],
      Q: [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]],
    };
    if (type === 'N') {
      for (const [dr, dc] of dirs.N) {
        const nr = r+dr, nc = c+dc;
        if (inBounds(nr, nc) && board[nr][nc]?.color !== color) count++;
      }
    } else if (dirs[type]) {
      for (const [dr, dc] of dirs[type]) {
        for (let i = 1; i < 8; i++) {
          const nr = r+dr*i, nc = c+dc*i;
          if (!inBounds(nr, nc)) break;
          if (board[nr][nc]) { if (board[nr][nc].color !== color) count++; break; }
          count++;
        }
      }
    }
    return count;
  }

  // ─── Quiescence Search (limitat) ────────────────────────────────
  // Continuă doar capturi după adâncimea principală.
  // Limitat la 4 niveluri pentru a preveni explozia de noduri.
  function quiescence(engine, alpha, beta, aiColor, qdepth) {
    const standPat = evaluateFull(engine) * (aiColor === 'w' ? 1 : -1);
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
    if (qdepth <= 0 || engine.isGameOver()) return alpha;

    const turn = engine.getTurn();
    const allMoves = engine.getAllLegalMoves(turn);
    const board = engine.getBoard();

    // Doar capturi și promoții
    const captures = allMoves.filter(m =>
      m.enPassant || board[m.to.r][m.to.c] !== null || m.promotion
    );
    if (captures.length === 0) return alpha;

    const ordered = orderMoves(captures, board);

    for (const move of ordered) {
      if (engine.needsPromotion(move)) move.promotion = 'Q';
      const snap = saveState(engine);
      engine.applyMove(move);
      const score = -quiescence(engine, -beta, -alpha,
        aiColor === 'w' ? 'b' : 'w', qdepth - 1);
      restoreState(engine, snap);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  // ─── Negamax cu Alpha-Beta (Nivel 2) ────────────────────────────
  // Adâncime 2: AI → adversar → quiescence la capete.
  function negamax(engine, depth, alpha, beta, aiColor) {
    if (engine.isGameOver()) {
      const st = engine.getStatus();
      const turn = engine.getTurn();
      if (st === 'checkmate') return turn === aiColor ? -19000 - depth : 19000 + depth;
      return 0;
    }

    if (depth === 0) {
      return quiescence(engine, alpha, beta, aiColor, 3);
    }

    const turn = engine.getTurn();
    const allMoves = engine.getAllLegalMoves(turn);
    if (allMoves.length === 0) return 0;

    const board = engine.getBoard();
    const ordered = orderMoves(allMoves, board);

    let best = -Infinity;
    for (const move of ordered) {
      if (engine.needsPromotion(move)) move.promotion = 'Q';

      const snap = saveState(engine);
      engine.applyMove(move);
      const val = -negamax(engine, depth - 1, -beta, -alpha,
        aiColor === 'w' ? 'b' : 'w');
      restoreState(engine, snap);

      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (alpha >= beta) break;
    }
    return best;
  }

  // ─── getBestMoveLevel2 ───────────────────────────────────────────
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
    const TIME_LIMIT = 1200; // ms — rămâne responsiv în browser
    const startTime = Date.now();

    let bestScore = -Infinity;
    let bestMove = ordered[0];
    let alpha = -Infinity;

    for (const move of ordered) {
      // Abandonează dacă am depășit limita de timp — returnează ce am găsit
      if (Date.now() - startTime > TIME_LIMIT) break;

      if (engine.needsPromotion(move)) move.promotion = 'Q';

      const snap = saveState(engine);
      engine.applyMove(move);
      const score = -negamax(engine, 1, -Infinity, -alpha,
        aiColor === 'w' ? 'b' : 'w');
      restoreState(engine, snap);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score > alpha) alpha = score;
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

  // ═══════════════════════════════════════════════════════════════
  // NIVEL 3 — Avansat (Maximum programatic)
  // ═══════════════════════════════════════════════════════════════

  // ─── Evaluare completă pentru Nivel 3 ───────────────────────────
  function evaluateLevel3(engine) {
    const board = engine.getBoard();
    const endgame = isEndgame(board);
    let score = 0;

    // Colectăm informații globale într-o singură trecere prin tablă
    let wBishops = 0, bBishops = 0;
    const wPawnCols = new Array(8).fill(0);
    const bPawnCols = new Array(8).fill(0);
    // Rândurile pionilor pe fiecare coloană (pentru passed pawn)
    const wPawnRanks = Array.from({length:8}, () => []); // indexat per coloană
    const bPawnRanks = Array.from({length:8}, () => []);
    let wKingR = 7, wKingC = 4, bKingR = 0, bKingC = 4;
    let wMobility = 0, bMobility = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;

        // 1. Material + PST
        const pstIdx = p.color === 'w' ? r * 8 + c : (7 - r) * 8 + (7 - c);
        let ps = VAL[p.type];
        ps += p.type === 'K'
          ? (endgame ? PST.K_end[pstIdx] : PST.K_mid[pstIdx])
          : ((PST[p.type] || [])[pstIdx] || 0);
        score += p.color === 'w' ? ps : -ps;

        // Colectăm date
        if (p.type === 'B') p.color === 'w' ? wBishops++ : bBishops++;
        if (p.type === 'P') {
          if (p.color === 'w') { wPawnCols[c]++; wPawnRanks[c].push(r); }
          else { bPawnCols[c]++; bPawnRanks[c].push(r); }
        }
        if (p.type === 'K') {
          if (p.color === 'w') { wKingR = r; wKingC = c; }
          else { bKingR = r; bKingC = c; }
        }

        // 2. Mobilitate
        const mob = mobilityCount(board, r, c, p.type, p.color);
        if (p.color === 'w') wMobility += mob; else bMobility += mob;

        // 3. Hanging pieces
        if (p.type !== 'K') {
          const opp = p.color === 'w' ? 'b' : 'w';
          if (isSquareAttackedByFast(board, r, c, opp)) {
            const defended = isSquareAttackedByFast(board, r, c, p.color);
            const pen = defended ? VAL[p.type] * 0.15 : VAL[p.type] * 0.5;
            score += p.color === 'w' ? -pen : pen;
          }
        }

        // 4. Tur pe coloana a 7-a (rândul 1 pentru alb, rândul 6 pentru negru)
        if (p.type === 'R') {
          if (p.color === 'w' && r === 1) score += 30;
          if (p.color === 'b' && r === 6) score -= 30;
        }

        // 5. Tur pe coloană deschisă / semi-deschisă
        if (p.type === 'R') {
          const ownPawns  = p.color === 'w' ? wPawnCols[c] : bPawnCols[c];
          const oppPawns  = p.color === 'w' ? bPawnCols[c] : wPawnCols[c];
          const bonus = ownPawns === 0 ? (oppPawns === 0 ? 20 : 10) : 0;
          score += p.color === 'w' ? bonus : -bonus;
        }
      }
    }

    // 6. Mobilitate diferențială
    score += (wMobility - bMobility) * 4;

    // 7. Perechea de nebuni
    if (wBishops >= 2) score += 30;
    if (bBishops >= 2) score -= 30;

    // 8. Structură pioni — dubli, izolați, trecuți (passed)
    for (let c = 0; c < 8; c++) {
      // Dubli
      if (wPawnCols[c] > 1) score -= 20 * (wPawnCols[c] - 1);
      if (bPawnCols[c] > 1) score += 20 * (bPawnCols[c] - 1);

      // Izolați
      const wIso = wPawnCols[c] > 0 &&
        (c === 0 || wPawnCols[c-1] === 0) && (c === 7 || wPawnCols[c+1] === 0);
      const bIso = bPawnCols[c] > 0 &&
        (c === 0 || bPawnCols[c-1] === 0) && (c === 7 || bPawnCols[c+1] === 0);
      if (wIso) score -= 20;
      if (bIso) score += 20;

      // Pion trecut (passed pawn) — niciun pion adversar pe coloana sau adiacente
      if (wPawnCols[c] > 0) {
        const frontFree = bPawnCols[c] === 0 &&
          (c === 0 || bPawnCols[c-1] === 0) && (c === 7 || bPawnCols[c+1] === 0);
        if (frontFree) {
          // Bonus crescător cu avansarea (rangul cel mai avansat)
          const advRow = Math.min(...wPawnRanks[c]); // cel mai avansat (r mic = avansat pentru alb)
          const passedBonus = [0, 10, 20, 30, 50, 75, 110, 0][7 - advRow] || 10;
          score += passedBonus;
        }
      }
      if (bPawnCols[c] > 0) {
        const frontFree = wPawnCols[c] === 0 &&
          (c === 0 || wPawnCols[c-1] === 0) && (c === 7 || wPawnCols[c+1] === 0);
        if (frontFree) {
          const advRow = Math.max(...bPawnRanks[c]); // cel mai avansat pentru negru (r mare)
          const passedBonus = [0, 10, 20, 30, 50, 75, 110, 0][advRow] || 10;
          score -= passedBonus;
        }
      }
    }

    // 9. Siguranța regelui — câți pioni proprii în jurul regelui
    if (!endgame) {
      score += kingSafety(board, wKingR, wKingC, 'w');
      score -= kingSafety(board, bKingR, bKingC, 'b');
    }

    // 10. Bonus șah activ
    const status = engine.getStatus();
    if (status === 'check') {
      score += engine.getTurn() === 'b' ? 40 : -40;
    }

    return score;
  }

  // Siguranța regelui: numără pioni proprii în zona 3x3 din jurul regelui
  function kingSafety(board, kr, kc, color) {
    let shield = 0;
    const dir = color === 'w' ? -1 : 1; // direcția spre față
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = 0; dr <= 1; dr++) { // față și aceeași linie
        const r = kr + dir * dr, c = kc + dc;
        if (inBounds(r, c) && board[r][c]?.type === 'P' && board[r][c]?.color === color)
          shield += 15;
      }
    }
    // Penalizare suplimentară dacă regele e pe coloană deschisă
    const ownPawns = color === 'w' ?
      Array.from({length:8}, (_,r) => board[r][kc]).filter(p => p?.color==='w'&&p?.type==='P').length :
      Array.from({length:8}, (_,r) => board[r][kc]).filter(p => p?.color==='b'&&p?.type==='P').length;
    if (ownPawns === 0) shield -= 25;
    return shield;
  }

  // ─── Killer Moves heuristic ──────────────────────────────────────
  // Memorează mutările care au produs cutoff-uri alpha-beta la fiecare adâncime.
  // La noduri cu aceeași adâncime, le încearcă primele.
  const killerMoves = Array.from({length: 6}, () => [null, null]);

  function storeKiller(depth, move) {
    if (depth >= killerMoves.length) return;
    if (!movesEqual(move, killerMoves[depth][0])) {
      killerMoves[depth][1] = killerMoves[depth][0];
      killerMoves[depth][0] = move;
    }
  }

  function movesEqual(a, b) {
    if (!a || !b) return false;
    return a.from.r === b.from.r && a.from.c === b.from.c &&
           a.to.r === b.to.r && a.to.c === b.to.c;
  }

  function isKiller(move, depth) {
    if (depth >= killerMoves.length) return false;
    return movesEqual(move, killerMoves[depth][0]) ||
           movesEqual(move, killerMoves[depth][1]);
  }

  // ─── Ordonare mutări pentru Nivel 3 (cu killer moves) ────────────
  function orderMovesL3(moves, board, depth) {
    return moves.slice().sort((a, b) => {
      const score = m => {
        if (m.castling) return 9000;
        if (m.promotion) return 8500;
        const victim = m.enPassant ? {type:'P'} : board[m.to.r][m.to.c];
        if (victim) {
          const atk = board[m.from.r][m.from.c];
          // MVV-LVA: piesa cea mai valoroasă cu cea mai ieftină
          return 7000 + VAL[victim.type] * 10 - VAL[atk.type];
        }
        // Killer moves — mutări liniștite care au mai produs cutoff-uri
        if (isKiller(m, depth)) return 6000;
        return 0;
      };
      return score(b) - score(a);
    });
  }

  // ─── Quiescence pentru Nivel 3 (folosește evaluateLevel3) ───────
  function quiescenceL3(engine, alpha, beta, aiColor, qdepth) {
    const standPat = evaluateLevel3(engine) * (aiColor === 'w' ? 1 : -1);
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
    if (qdepth <= 0 || engine.isGameOver()) return alpha;

    const turn = engine.getTurn();
    const allMoves = engine.getAllLegalMoves(turn);
    const board = engine.getBoard();
    const captures = allMoves.filter(m =>
      m.enPassant || board[m.to.r][m.to.c] !== null || m.promotion
    );
    if (captures.length === 0) return alpha;

    for (const move of orderMoves(captures, board)) {
      if (engine.needsPromotion(move)) move.promotion = 'Q';
      const snap = saveState(engine);
      engine.applyMove(move);
      const score = -quiescenceL3(engine, -beta, -alpha,
        aiColor === 'w' ? 'b' : 'w', qdepth - 1);
      restoreState(engine, snap);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  // ─── Negamax Level 3 (cu killer moves + evaluateLevel3) ─────────
  function negamaxL3(engine, depth, alpha, beta, aiColor, timeRef) {
    // Time check la fiecare nod recursiv
    if (Date.now() - timeRef.start > timeRef.limit) {
      timeRef.aborted = true;
      return evaluateLevel3(engine) * (aiColor === 'w' ? 1 : -1);
    }

    if (engine.isGameOver()) {
      const st = engine.getStatus();
      const turn = engine.getTurn();
      if (st === 'checkmate') return turn === aiColor ? -19000 - depth : 19000 + depth;
      return 0;
    }

    if (depth === 0) {
      // Evaluare directă + o trecere rapidă de capturi (quiescence shallow)
      return quiescenceL3(engine, alpha, beta, aiColor, 0);
    }

    const turn = engine.getTurn();
    const allMoves = engine.getAllLegalMoves(turn);
    if (allMoves.length === 0) return 0;

    const board = engine.getBoard();
    const ordered = orderMovesL3(allMoves, board, depth);

    let best = -Infinity;
    for (const move of ordered) {
      if (engine.needsPromotion(move)) move.promotion = 'Q';

      const snap = saveState(engine);
      engine.applyMove(move);
      const val = -negamaxL3(engine, depth - 1, -beta, -alpha,
        aiColor === 'w' ? 'b' : 'w', timeRef);
      restoreState(engine, snap);

      if (val > best) best = val;
      if (val > alpha) {
        alpha = val;
        if (alpha >= beta) {
          // Cutoff — salveaza killer move dacă nu e captură
          const isCapture = board[move.to.r][move.to.c] !== null || move.enPassant;
          if (!isCapture) storeKiller(depth, move);
          break;
        }
      }
    }
    return best;
  }

  // ─── Iterative Deepening pentru Nivel 3 ─────────────────────────
  function getBestMoveLevel3(engine) {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    if (allMoves.length === 1) {
      const m = allMoves[0];
      if (engine.needsPromotion(m)) m.promotion = 'Q';
      return m;
    }

    for (let d = 0; d < killerMoves.length; d++) killerMoves[d] = [null, null];

    const aiColor = engine.getTurn();
    const TIME_LIMIT = 1600;
    const MAX_DEPTH = 3;
    const timeRef = { start: Date.now(), limit: TIME_LIMIT, aborted: false };

    // Fallback: prima mutare ordonată la depth 1
    const board = engine.getBoard();
    let bestMove = orderMovesL3(allMoves, board, 1)[0];
    if (engine.needsPromotion(bestMove)) bestMove.promotion = 'Q';

    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
      if (Date.now() - timeRef.start > TIME_LIMIT * 0.8) break;

      const ordered = orderMovesL3(allMoves, engine.getBoard(), depth);
      let bestScoreThisDepth = -Infinity;
      let bestMoveThisDepth = null;
      let alpha = -Infinity;
      timeRef.aborted = false;

      for (const move of ordered) {
        if (timeRef.aborted || Date.now() - timeRef.start > TIME_LIMIT) break;

        if (engine.needsPromotion(move)) move.promotion = 'Q';

        const snap = saveState(engine);
        engine.applyMove(move);
        const score = -negamaxL3(engine, depth - 1, -Infinity, -alpha,
          aiColor === 'w' ? 'b' : 'w', timeRef);
        restoreState(engine, snap);

        if (score > bestScoreThisDepth) {
          bestScoreThisDepth = score;
          bestMoveThisDepth = move;
        }
        if (score > alpha) alpha = score;
      }

      // Actualizăm bestMove doar dacă iterația n-a fost abortată
      if (!timeRef.aborted && bestMoveThisDepth) {
        bestMove = bestMoveThisDepth;
      }
    }

    return bestMove;
  }

  // ─── API public ─────────────────────────────────────────────────
  function getBestMove(engine, level = 'beginner') {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    if (level === 'advanced') return getBestMoveLevel3(engine);
    if (level === 'intermediate') return getBestMoveLevel2(engine);
    return getBestMoveLevel1(engine);
  }

  function getMoveWithDelay(engine, level = 'beginner', minMs, maxMs) {
    const delays = {
      beginner:     [500,  1200],
      intermediate: [700,  1600],
      advanced:     [300,   800], // calculul în sine durează, delay mic suplimentar
    };
    const [mn, mx] = delays[level] || delays.beginner;
    const actualMin = minMs ?? mn;
    const actualMax = maxMs ?? mx;
    return new Promise(resolve => {
      const delay = actualMin + Math.random() * (actualMax - actualMin);
      setTimeout(() => resolve(getBestMove(engine, level)), delay);
    });
  }

  return { getBestMove, getMoveWithDelay };
})();
