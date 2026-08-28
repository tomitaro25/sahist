/**
 * Șahist — Chess Engine
 * Complete move validation, FEN parsing, game state management
 * Modular: imported by index.html and future modules
 */

'use strict';

const ChessEngine = (() => {

  // ─── Constants ──────────────────────────────────────────────────────────────
  const PIECES = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
  };

  const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const FILES = ['a','b','c','d','e','f','g','h'];
  const RANKS = ['8','7','6','5','4','3','2','1']; // top to bottom in display

  // ─── State ───────────────────────────────────────────────────────────────────
  let board = [];        // 8x8 array, null or {color:'w'|'b', type:'K'|'Q'|'R'|'B'|'N'|'P'}
  let turn = 'w';
  let castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
  let enPassantSquare = null; // e.g. {r:2, c:4}
  let halfMoveClock = 0;
  let fullMoveNumber = 1;
  let moveHistory = [];   // array of move objects
  let gameStatus = 'playing'; // 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
  let capturedPieces = { w: [], b: [] };

  // ─── FEN ─────────────────────────────────────────────────────────────────────
  function parseFEN(fen) {
    const parts = fen.trim().split(' ');
    const rows = parts[0].split('/');
    board = [];
    for (let r = 0; r < 8; r++) {
      board[r] = [];
      let c = 0;
      for (const ch of rows[r]) {
        if (/\d/.test(ch)) {
          for (let i = 0; i < parseInt(ch); i++) board[r][c++] = null;
        } else {
          const color = ch === ch.toUpperCase() ? 'w' : 'b';
          board[r][c++] = { color, type: ch.toUpperCase() };
        }
      }
    }
    turn = parts[1] || 'w';
    const cr = parts[2] || '-';
    castlingRights = {
      wK: cr.includes('K'), wQ: cr.includes('Q'),
      bK: cr.includes('k'), bQ: cr.includes('q')
    };
    const ep = parts[3];
    enPassantSquare = (ep && ep !== '-') ? algebraicToRC(ep) : null;
    halfMoveClock = parseInt(parts[4]) || 0;
    fullMoveNumber = parseInt(parts[5]) || 1;
    moveHistory = [];
    capturedPieces = { w: [], b: [] };
    gameStatus = 'playing';
  }

  function toFEN() {
    let fen = '';
    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) { empty++; }
        else {
          if (empty) { fen += empty; empty = 0; }
          fen += p.color === 'w' ? p.type : p.type.toLowerCase();
        }
      }
      if (empty) fen += empty;
      if (r < 7) fen += '/';
    }
    const ep = enPassantSquare ? rcToAlgebraic(enPassantSquare.r, enPassantSquare.c) : '-';
    const cr = [
      castlingRights.wK ? 'K' : '',
      castlingRights.wQ ? 'Q' : '',
      castlingRights.bK ? 'k' : '',
      castlingRights.bQ ? 'q' : ''
    ].join('') || '-';
    fen += ` ${turn} ${cr} ${ep} ${halfMoveClock} ${fullMoveNumber}`;
    return fen;
  }

  // ─── Coordinate Helpers ──────────────────────────────────────────────────────
  function algebraicToRC(sq) {
    return { r: 8 - parseInt(sq[1]), c: sq.charCodeAt(0) - 97 };
  }

  function rcToAlgebraic(r, c) {
    return FILES[c] + (8 - r);
  }

  function inBounds(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  // ─── Move Generation ─────────────────────────────────────────────────────────
  function getPseudoLegalMoves(r, c, boardState) {
    const piece = boardState[r][c];
    if (!piece) return [];
    const moves = [];
    const { color, type } = piece;
    const dir = color === 'w' ? -1 : 1;

    const addIfValid = (tr, tc) => {
      if (!inBounds(tr, tc)) return false;
      const target = boardState[tr][tc];
      if (target && target.color === color) return false;
      moves.push({ from: {r, c}, to: {r: tr, c: tc} });
      return !target; // return true if square was empty (for sliding pieces)
    };

    switch (type) {
      case 'P': {
        // Forward
        const fr = r + dir;
        if (inBounds(fr, c) && !boardState[fr][c]) {
          moves.push({ from: {r, c}, to: {r: fr, c} });
          // Double push from starting rank
          const startRank = color === 'w' ? 6 : 1;
          const dr = r + 2 * dir;
          if (r === startRank && !boardState[dr][c]) {
            moves.push({ from: {r, c}, to: {r: dr, c}, doublePush: true });
          }
        }
        // Captures
        for (const dc of [-1, 1]) {
          const tc = c + dc;
          if (!inBounds(fr, tc)) continue;
          const target = boardState[fr][tc];
          if (target && target.color !== color) {
            moves.push({ from: {r, c}, to: {r: fr, c: tc} });
          }
          // En passant
          if (enPassantSquare && fr === enPassantSquare.r && tc === enPassantSquare.c) {
            moves.push({ from: {r, c}, to: {r: fr, c: tc}, enPassant: true });
          }
        }
        break;
      }
      case 'N': {
        const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for (const [dr, dc] of knightMoves) addIfValid(r+dr, c+dc);
        break;
      }
      case 'B': {
        for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
          for (let i = 1; i < 8; i++) { if (!addIfValid(r+dr*i, c+dc*i)) break; }
        }
        break;
      }
      case 'R': {
        for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          for (let i = 1; i < 8; i++) { if (!addIfValid(r+dr*i, c+dc*i)) break; }
        }
        break;
      }
      case 'Q': {
        for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) {
          for (let i = 1; i < 8; i++) { if (!addIfValid(r+dr*i, c+dc*i)) break; }
        }
        break;
      }
      case 'K': {
        for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
          addIfValid(r+dr, c+dc);
        }
        // Castling (pseudo-legal, checked fully in getLegalMoves)
        if (color === 'w' && r === 7 && c === 4) {
          if (castlingRights.wK && !boardState[7][5] && !boardState[7][6]) {
            moves.push({ from: {r:7,c:4}, to: {r:7,c:6}, castling: 'K' });
          }
          if (castlingRights.wQ && !boardState[7][3] && !boardState[7][2] && !boardState[7][1]) {
            moves.push({ from: {r:7,c:4}, to: {r:7,c:2}, castling: 'Q' });
          }
        }
        if (color === 'b' && r === 0 && c === 4) {
          if (castlingRights.bK && !boardState[0][5] && !boardState[0][6]) {
            moves.push({ from: {r:0,c:4}, to: {r:0,c:6}, castling: 'k' });
          }
          if (castlingRights.bQ && !boardState[0][3] && !boardState[0][2] && !boardState[0][1]) {
            moves.push({ from: {r:0,c:4}, to: {r:0,c:2}, castling: 'q' });
          }
        }
        break;
      }
    }
    return moves;
  }

  function isSquareAttackedBy(r, c, attackerColor, boardState) {
    // Check all opponent pieces for attacks on this square
    for (let pr = 0; pr < 8; pr++) {
      for (let pc = 0; pc < 8; pc++) {
        const p = boardState[pr][pc];
        if (!p || p.color !== attackerColor) continue;
        const moves = getPseudoLegalMoves(pr, pc, boardState);
        if (moves.some(m => m.to.r === r && m.to.c === c)) return true;
      }
    }
    return false;
  }

  function findKing(color, boardState) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (boardState[r][c]?.color === color && boardState[r][c]?.type === 'K')
          return { r, c };
    return null;
  }

  function isInCheck(color, boardState) {
    const kingPos = findKing(color, boardState);
    if (!kingPos) return false;
    return isSquareAttackedBy(kingPos.r, kingPos.c, color === 'w' ? 'b' : 'w', boardState);
  }

  function applyMoveToBoard(move, boardState) {
    const newBoard = boardState.map(row => row.map(p => p ? {...p} : null));
    const piece = newBoard[move.from.r][move.from.c];
    newBoard[move.to.r][move.to.c] = piece;
    newBoard[move.from.r][move.from.c] = null;

    // En passant capture
    if (move.enPassant) {
      const capturedPawnRow = move.from.r; // same row as moving pawn
      newBoard[capturedPawnRow][move.to.c] = null;
    }

    // Castling: move rook
    if (move.castling === 'K') { newBoard[7][5] = newBoard[7][7]; newBoard[7][7] = null; }
    if (move.castling === 'Q') { newBoard[7][3] = newBoard[7][0]; newBoard[7][0] = null; }
    if (move.castling === 'k') { newBoard[0][5] = newBoard[0][7]; newBoard[0][7] = null; }
    if (move.castling === 'q') { newBoard[0][3] = newBoard[0][0]; newBoard[0][0] = null; }

    // Promotion
    if (move.promotion) {
      newBoard[move.to.r][move.to.c] = { color: piece.color, type: move.promotion };
    }

    return newBoard;
  }

  function getLegalMoves(r, c) {
    const piece = board[r][c];
    if (!piece || piece.color !== turn) return [];
    const pseudo = getPseudoLegalMoves(r, c, board);
    return pseudo.filter(move => {
      // Castling: check intermediate squares not attacked
      if (move.castling) {
        const opponent = turn === 'w' ? 'b' : 'w';
        const kingRow = turn === 'w' ? 7 : 0;
        // King must not be in check, and must not pass through attacked squares
        if (isInCheck(turn, board)) return false;
        const midCol = move.castling === 'K' || move.castling === 'k' ? 5 : 3;
        const midBoard = applyMoveToBoard({ from: {r:kingRow, c:4}, to: {r:kingRow, c:midCol} }, board);
        if (isSquareAttackedBy(kingRow, midCol, opponent, midBoard)) return false;
      }
      const newBoard = applyMoveToBoard(move, board);
      return !isInCheck(turn, newBoard);
    });
  }

  function getAllLegalMoves(color) {
    const allMoves = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (board[r][c]?.color === color) {
          const moves = getLegalMoves(r, c);
          allMoves.push(...moves);
        }
    return allMoves;
  }

  // ─── Move Application ─────────────────────────────────────────────────────────
  function applyMove(move) {
    const piece = board[move.from.r][move.from.c];
    const captured = board[move.to.r][move.to.c];

    // Track captured pieces
    if (captured) capturedPieces[captured.color].push(captured.type);
    if (move.enPassant) {
      const epCaptured = { color: turn === 'w' ? 'b' : 'w', type: 'P' };
      capturedPieces[epCaptured.color].push('P');
    }

    board = applyMoveToBoard(move, board);

    // Update castling rights
    if (piece.type === 'K') {
      if (turn === 'w') { castlingRights.wK = false; castlingRights.wQ = false; }
      else { castlingRights.bK = false; castlingRights.bQ = false; }
    }
    if (piece.type === 'R') {
      if (move.from.r === 7 && move.from.c === 7) castlingRights.wK = false;
      if (move.from.r === 7 && move.from.c === 0) castlingRights.wQ = false;
      if (move.from.r === 0 && move.from.c === 7) castlingRights.bK = false;
      if (move.from.r === 0 && move.from.c === 0) castlingRights.bQ = false;
    }

    // En passant square
    enPassantSquare = move.doublePush ? {
      r: move.from.r + (turn === 'w' ? -1 : 1),
      c: move.from.c
    } : null;

    // Half-move clock
    halfMoveClock = (piece.type === 'P' || captured || move.enPassant) ? 0 : halfMoveClock + 1;

    // Move history
    const notation = buildNotation(move, piece, captured);
    moveHistory.push({ move, piece: {...piece}, captured: captured ? {...captured} : null, notation });

    if (turn === 'b') fullMoveNumber++;
    turn = turn === 'w' ? 'b' : 'w';

    // Update game status
    updateGameStatus();

    return notation;
  }

  function buildNotation(move, piece, captured) {
    const fromSq = rcToAlgebraic(move.from.r, move.from.c);
    const toSq = rcToAlgebraic(move.to.r, move.to.c);
    if (move.castling === 'K' || move.castling === 'k') return 'O-O';
    if (move.castling === 'Q' || move.castling === 'q') return 'O-O-O';
    const pieceChar = piece.type === 'P' ? '' : piece.type;
    const captureChar = (captured || move.enPassant) ? 'x' : '';
    const fromFile = piece.type === 'P' && captureChar ? fromSq[0] : '';
    const promoChar = move.promotion ? '=' + move.promotion : '';
    return `${pieceChar}${fromFile}${captureChar}${toSq}${promoChar}`;
  }

  function updateGameStatus() {
    const legalMoves = getAllLegalMoves(turn);
    const inCheck = isInCheck(turn, board);
    if (legalMoves.length === 0) {
      gameStatus = inCheck ? 'checkmate' : 'stalemate';
    } else if (inCheck) {
      gameStatus = 'check';
    } else if (halfMoveClock >= 100) {
      gameStatus = 'draw';
    } else {
      gameStatus = 'playing';
    }
  }

  // ─── Promotion ───────────────────────────────────────────────────────────────
  function needsPromotion(move) {
    const piece = board[move.from.r][move.from.c];
    if (!piece || piece.type !== 'P') return false;
    return (piece.color === 'w' && move.to.r === 0) || (piece.color === 'b' && move.to.r === 7);
  }

  // ─── Public API ──────────────────────────────────────────────────────────────
  function init(fen = INITIAL_FEN) {
    parseFEN(fen);
    updateGameStatus();
  }

  /**
   * Variantă de init pentru căutare internă (minimax/snapshot-restore).
   * Restaurează poziția din FEN dar PĂSTREAZĂ capturedPieces și moveHistory
   * din sesiunea de joc reală — acestea nu trebuie să fie afectate de
   * calculele interne ale engine-ului.
   */
  function initForSearch(fen, savedCaptured, savedHistory) {
    const cr = capturedPieces; // backup
    const mh = moveHistory;    // backup
    parseFEN(fen);
    // Restaurează datele reale dacă sunt furnizate
    if (savedCaptured) capturedPieces = savedCaptured;
    else capturedPieces = cr;
    if (savedHistory) moveHistory = savedHistory;
    else moveHistory = mh;
    updateGameStatus();
  }

  function getBoard() { return board; }
  function getTurn() { return turn; }
  function getStatus() { return gameStatus; }
  function getMoveHistory() { return moveHistory; }
  function getCapturedPieces() { return capturedPieces; }
  function getFEN() { return toFEN(); }
  function getEnPassantSquare() { return enPassantSquare; }
  function isGameOver() { return ['checkmate', 'stalemate', 'draw'].includes(gameStatus); }

  return {
    init, initForSearch, getBoard, getTurn, getStatus, getFEN,
    getLegalMoves, getAllLegalMoves, applyMove, needsPromotion,
    getMoveHistory, getCapturedPieces, getEnPassantSquare, isGameOver,
    rcToAlgebraic, algebraicToRC, PIECES, INITIAL_FEN
  };
})();
