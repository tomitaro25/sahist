/**
 * Șahist — Local Engine (Nivele 1–5)
 *
 * Nivel 1–2: Începător — heuristic cu greșeli deliberate
 * Nivel 3–5: Intermediar — negamax + alpha-beta + SEE + quiescence
 *
 * API public: getBestMove(engine, level), getMoveWithDelay(engine, level)
 * level: număr 1–5
 */

'use strict';

const LocalEngine = (() => {

  // ─── Valori piese (centipawns) ───────────────────────────────────
  const VAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

  // ─── Tabele poziționale PST ──────────────────────────────────────
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
    K_mid: [
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,
      -10,-20,-20,-20,-20,-20,-20,-10,
       20, 20,  0,  0,  0,  0, 20, 20,
       20, 30, 10,  0,  0, 10, 30, 20
    ],
    K_end: [
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

  // ─── Helpers de bază ────────────────────────────────────────────
  function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

  function countMaterial(board) {
    let total = 0;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type !== 'K') total += VAL[p.type];
      }
    return total;
  }

  function isEndgame(board) { return countMaterial(board) < 1800; }

  function applyMoveToBoard(board, move) {
    const nb = board.map(row => row.map(p => p ? {...p} : null));
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

  // ─── Atac / Apărare ─────────────────────────────────────────────
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

  function isSquareAttackedByFast(board, tr, tc, attackerColor) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.color !== attackerColor) continue;
        if (canAttackSquare(board, r, c, tr, tc, p.type, p.color)) return true;
      }
    return false;
  }

  // ─── Static Exchange Evaluation (SEE) ───────────────────────────
  function see(board, toR, toC, targetVal, fromR, fromC, attackerVal, color) {
    let gain = targetVal;
    const nb = board.map(r => r.map(p => p ? {...p} : null));
    nb[toR][toC] = nb[fromR][fromC];
    nb[fromR][fromC] = null;
    const opp = color === 'w' ? 'b' : 'w';
    let minVal = Infinity, minR = -1, minC = -1;
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = nb[r][c];
        if (!p || p.color !== opp) continue;
        if (canAttackSquare(nb, r, c, toR, toC, p.type, p.color)) {
          if (VAL[p.type] < minVal) { minVal = VAL[p.type]; minR = r; minC = c; }
        }
      }
    if (minR >= 0) {
      const oppGain = see(nb, toR, toC, attackerVal, minR, minC, minVal, opp);
      gain -= Math.max(0, oppGain);
    }
    return gain;
  }

  function seeMove(board, move) {
    const attacker = board[move.from.r][move.from.c];
    const victim = move.enPassant ? {type:'P'} : board[move.to.r][move.to.c];
    if (!victim) return 0;
    return see(board, move.to.r, move.to.c, VAL[victim.type],
               move.from.r, move.from.c, VAL[attacker.type], attacker.color);
  }

  // ─── Ordonare mutări ────────────────────────────────────────────
  function orderMoves(moves, board, depth) {
    return moves.slice().sort((a, b) => {
      const score = m => {
        if (m.castling) return 9000;
        if (m.promotion) return 8500;
        const victim = m.enPassant ? {type:'P'} : board[m.to.r][m.to.c];
        if (victim) {
          const sv = seeMove(board, m);
          return sv >= 0 ? 7000 + sv : 3000 + sv;
        }
        if (depth !== undefined && isKiller(m, depth)) return 6000;
        return 0;
      };
      return score(b) - score(a);
    });
  }

  // ─── Snapshot / Restore ──────────────────────────────────────────
  function saveState(engine) {
    const cap = engine.getCapturedPieces();
    return {
      fen: engine.getFEN(),
      captured: { w: [...cap.w], b: [...cap.b] }
    };
  }

  function restoreState(engine, snapshot) {
    engine.initForSearch(snapshot.fen, snapshot.captured, null);
  }

  // ─── Evaluare statică (PST + material) ──────────────────────────
  function evaluate(board) {
    const endgame = isEndgame(board);
    let score = 0;
    for (let r = 0; r < 8; r++)
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
    return score;
  }

  // ─── Evaluare completă (L3+) ─────────────────────────────────────
  function evaluateFull(engine) {
    const board = engine.getBoard();
    const endgame = isEndgame(board);
    let score = 0;
    let wBishops = 0, bBishops = 0;
    const wPawnCols = new Array(8).fill(0);
    const bPawnCols = new Array(8).fill(0);
    const wPawnRanks = Array.from({length:8}, () => []);
    const bPawnRanks = Array.from({length:8}, () => []);
    let wKingR = 7, wKingC = 4, bKingR = 0, bKingC = 4;
    let wMobility = 0, bMobility = 0;

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

        if (p.type === 'B') p.color === 'w' ? wBishops++ : bBishops++;
        if (p.type === 'P') {
          if (p.color === 'w') { wPawnCols[c]++; wPawnRanks[c].push(r); }
          else { bPawnCols[c]++; bPawnRanks[c].push(r); }
        }
        if (p.type === 'K') {
          if (p.color === 'w') { wKingR = r; wKingC = c; }
          else { bKingR = r; bKingC = c; }
        }

        // Mobilitate
        const mob = mobilityCount(board, r, c, p.type, p.color);
        if (p.color === 'w') wMobility += mob; else bMobility += mob;

        // Hanging pieces cu SEE
        if (p.type !== 'K') {
          const opp = p.color === 'w' ? 'b' : 'w';
          if (isSquareAttackedByFast(board, r, c, opp)) {
            let minAtkVal = Infinity, minAtkR = -1, minAtkC = -1;
            for (let ar = 0; ar < 8; ar++) for (let ac = 0; ac < 8; ac++) {
              const ap = board[ar][ac];
              if (ap && ap.color === opp && canAttackSquare(board, ar, ac, r, c, ap.type, ap.color)) {
                if (VAL[ap.type] < minAtkVal) { minAtkVal = VAL[ap.type]; minAtkR = ar; minAtkC = ac; }
              }
            }
            if (minAtkR >= 0) {
              const seeLoss = see(board, r, c, VAL[p.type], minAtkR, minAtkC, minAtkVal, opp);
              if (seeLoss > 0) {
                const pen = seeLoss * 0.85;
                score += p.color === 'w' ? -pen : pen;
              }
            }
          }
        }

        // Tur coloana a 7-a
        if (p.type === 'R') {
          if (p.color === 'w' && r === 1) score += 30;
          if (p.color === 'b' && r === 6) score -= 30;
        }

        // Tur pe coloană deschisă
        if (p.type === 'R') {
          const own  = p.color === 'w' ? wPawnCols[c] : bPawnCols[c];
          const opp2 = p.color === 'w' ? bPawnCols[c] : wPawnCols[c];
          const bonus = own === 0 ? (opp2 === 0 ? 20 : 10) : 0;
          score += p.color === 'w' ? bonus : -bonus;
        }
      }
    }

    // Mobilitate
    score += (wMobility - bMobility) * 4;

    // Perechea de nebuni
    if (wBishops >= 2) score += 30;
    if (bBishops >= 2) score -= 30;

    // Structură pioni
    for (let c = 0; c < 8; c++) {
      if (wPawnCols[c] > 1) score -= 20 * (wPawnCols[c] - 1);
      if (bPawnCols[c] > 1) score += 20 * (bPawnCols[c] - 1);
      const wIso = wPawnCols[c] > 0 &&
        (c === 0 || wPawnCols[c-1] === 0) && (c === 7 || wPawnCols[c+1] === 0);
      const bIso = bPawnCols[c] > 0 &&
        (c === 0 || bPawnCols[c-1] === 0) && (c === 7 || bPawnCols[c+1] === 0);
      if (wIso) score -= 20;
      if (bIso) score += 20;
      // Pion trecut
      if (wPawnCols[c] > 0) {
        const ff = bPawnCols[c] === 0 &&
          (c === 0 || bPawnCols[c-1] === 0) && (c === 7 || bPawnCols[c+1] === 0);
        if (ff && wPawnRanks[c].length > 0) {
          const adv = Math.min(...wPawnRanks[c]);
          score += [0,10,20,30,50,75,110,0][7-adv] || 10;
        }
      }
      if (bPawnCols[c] > 0) {
        const ff = wPawnCols[c] === 0 &&
          (c === 0 || wPawnCols[c-1] === 0) && (c === 7 || wPawnCols[c+1] === 0);
        if (ff && bPawnRanks[c].length > 0) {
          const adv = Math.max(...bPawnRanks[c]);
          score -= [0,10,20,30,50,75,110,0][adv] || 10;
        }
      }
    }

    // Siguranța regelui
    if (!endgame) {
      score += kingSafety(board, wKingR, wKingC, 'w');
      score -= kingSafety(board, bKingR, bKingC, 'b');
    }

    // Bonus șah
    const status = engine.getStatus();
    if (status === 'check') score += engine.getTurn() === 'b' ? 40 : -40;

    return score;
  }

  function kingSafety(board, kr, kc, color) {
    let shield = 0;
    const dir = color === 'w' ? -1 : 1;
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = 0; dr <= 1; dr++) {
        const r = kr + dir * dr, c = kc + dc;
        if (inBounds(r, c) && board[r][c]?.type === 'P' && board[r][c]?.color === color)
          shield += 15;
      }
    }
    const col = Array.from({length:8}, (_,r) => board[r][kc])
                     .filter(p => p?.color === color && p?.type === 'P').length;
    if (col === 0) shield -= 25;
    return shield;
  }

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

  // ─── Killer moves ────────────────────────────────────────────────
  const killerMoves = Array.from({length:6}, () => [null, null]);

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

  // ─── Quiescence Search ───────────────────────────────────────────
  function quiescence(engine, alpha, beta, aiColor, qdepth) {
    const standPat = evaluateFull(engine) * (aiColor === 'w' ? 1 : -1);
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
      const score = -quiescence(engine, -beta, -alpha,
        aiColor === 'w' ? 'b' : 'w', qdepth - 1);
      restoreState(engine, snap);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  // ─── Negamax cu alpha-beta + killer moves ────────────────────────
  function negamax(engine, depth, alpha, beta, aiColor, timeRef) {
    if (timeRef && Date.now() - timeRef.start > timeRef.limit) {
      timeRef.aborted = true;
      return evaluateFull(engine) * (aiColor === 'w' ? 1 : -1);
    }
    if (engine.isGameOver()) {
      const st = engine.getStatus();
      const turn = engine.getTurn();
      if (st === 'checkmate') return turn === aiColor ? -19000 - depth : 19000 + depth;
      return 0;
    }
    if (depth === 0) return quiescence(engine, alpha, beta, aiColor, 0);

    const turn = engine.getTurn();
    const allMoves = engine.getAllLegalMoves(turn);
    if (allMoves.length === 0) return 0;
    const board = engine.getBoard();
    const ordered = orderMoves(allMoves, board, depth);
    let best = -Infinity;

    for (const move of ordered) {
      if (engine.needsPromotion(move)) move.promotion = 'Q';
      const snap = saveState(engine);
      engine.applyMove(move);
      const val = -negamax(engine, depth - 1, -beta, -alpha,
        aiColor === 'w' ? 'b' : 'w', timeRef);
      restoreState(engine, snap);
      if (val > best) best = val;
      if (val > alpha) {
        alpha = val;
        if (alpha >= beta) {
          const isCapture = board[move.to.r][move.to.c] !== null || move.enPassant;
          if (!isCapture) storeKiller(depth, move);
          break;
        }
      }
    }
    return best;
  }

  // ─── Scor pozițional pentru mutări liniștite (L1-L2) ─────────────
  function captureNetValue(engine, move) {
    const board = engine.getBoard();
    const attacker = board[move.from.r][move.from.c];
    const victim = move.enPassant ? {type:'P'} : board[move.to.r][move.to.c];
    if (!victim) return 0;
    const nb = applyMoveToBoard(board, move);
    const opp = attacker.color === 'w' ? 'b' : 'w';
    const defended = isSquareAttackedByFast(nb, move.to.r, move.to.c, opp);
    return defended ? (VAL[victim.type] - VAL[attacker.type]) / 100
                    : VAL[victim.type] / 100;
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

  // ═══════════════════════════════════════════════════════════════
  // NIVEL 1–2: Începător (heuristic)
  // ═══════════════════════════════════════════════════════════════
  function getBestMoveL1(engine, intensity) {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    const board = engine.getBoard();

    // La intensity 1: 25% mutări complet aleatorie (greșeli reale)
    const errorChance = intensity === 1 ? 0.25 : 0.10;
    if (Math.random() < errorChance)
      return allMoves[Math.floor(Math.random() * allMoves.length)];

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

    const equalThreshold = intensity === 1 ? 0.25 : 0.40;
    const equalCaptures = captures.filter(c => c.net === 0);
    if (equalCaptures.length > 0 && Math.random() < equalThreshold)
      return equalCaptures[Math.floor(Math.random() * equalCaptures.length)].move;

    const pool = quietMoves.length > 0 ? quietMoves
      : allMoves.filter(m => captureNetValue(engine, m) >= -1);
    const scored = (pool.length > 0 ? pool : allMoves)
      .map(m => ({ move: m, score: quietScore(engine, m) }));
    scored.sort((a, b) => b.score - a.score);

    // intensity 1: top 5 uniforme; intensity 2: top 3 ponderat 50/30/20
    const topN = intensity === 1 ? Math.min(5, scored.length) : Math.min(3, scored.length);
    const top = scored.slice(0, topN);
    if (intensity === 1) return top[Math.floor(Math.random() * top.length)].move;
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
  // NIVEL 3–5: Intermediar local (negamax + iterative deepening)
  // ═══════════════════════════════════════════════════════════════
  function getBestMoveL3(engine, intensity) {
    const allMoves = engine.getAllLegalMoves(engine.getTurn());
    if (allMoves.length === 0) return null;
    if (allMoves.length === 1) {
      const m = allMoves[0];
      if (engine.needsPromotion(m)) m.promotion = 'Q';
      return m;
    }

    for (let d = 0; d < killerMoves.length; d++) killerMoves[d] = [null, null];

    const aiColor = engine.getTurn();
    const configs = {
      3: { maxDepth: 2, timeLimit: 800  },
      4: { maxDepth: 2, timeLimit: 1200 },
      5: { maxDepth: 3, timeLimit: 1600 },
    };
    const { maxDepth, timeLimit } = configs[intensity] || configs[5];
    const timeRef = { start: Date.now(), limit: timeLimit, aborted: false };

    let bestMove = orderMoves(allMoves, engine.getBoard(), 1)[0];
    if (engine.needsPromotion(bestMove)) bestMove.promotion = 'Q';

    for (let depth = 1; depth <= maxDepth; depth++) {
      if (Date.now() - timeRef.start > timeLimit * 0.8) break;
      const ordered = orderMoves(allMoves, engine.getBoard(), depth);
      let bestScore = -Infinity, bestThis = null, alpha = -Infinity;
      timeRef.aborted = false;

      for (const move of ordered) {
        if (timeRef.aborted || Date.now() - timeRef.start > timeLimit) break;
        if (engine.needsPromotion(move)) move.promotion = 'Q';
        const snap = saveState(engine);
        engine.applyMove(move);
        const score = -negamax(engine, depth - 1, -Infinity, -alpha,
          aiColor === 'w' ? 'b' : 'w', timeRef);
        restoreState(engine, snap);
        if (score > bestScore) { bestScore = score; bestThis = move; }
        if (score > alpha) alpha = score;
      }
      if (!timeRef.aborted && bestThis) bestMove = bestThis;
    }
    return bestMove;
  }

  // ─── API public ──────────────────────────────────────────────────
  /**
   * level: număr 1–5
   * 1–2 → heuristic (Începător)
   * 3–5 → negamax (Intermediar local)
   */
  function getBestMove(engine, level) {
    const n = typeof level === 'number' ? Math.max(1, Math.min(5, level)) : 2;
    if (n <= 2) return getBestMoveL1(engine, n);
    return getBestMoveL3(engine, n);
  }

  function getMoveWithDelay(engine, level, minMs, maxMs) {
    const n = typeof level === 'number' ? Math.max(1, Math.min(5, level)) : 2;
    const delayMap = [null, [300,800], [400,1000], [500,1100], [600,1300], [700,1600]];
    const [mn, mx] = delayMap[n] || [500,1200];
    return new Promise(resolve => {
      const delay = (minMs ?? mn) + Math.random() * ((maxMs ?? mx) - (minMs ?? mn));
      setTimeout(() => resolve(getBestMove(engine, level)), delay);
    });
  }

  return { getBestMove, getMoveWithDelay };
})();
