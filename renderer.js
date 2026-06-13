const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const resetBtn = document.getElementById('reset');
const modeEl = document.getElementById('mode');
const difficultyEl = document.getElementById('difficulty');
const aiSymbolEl = document.getElementById('aiSymbol');

let board = Array(9).fill(null);
let turn = 'X';
let gameOver = false;

function renderBoard() {
  boardEl.innerHTML = '';
  board.forEach((cell, idx) => {
    const div = document.createElement('div');
    div.className = 'cell';
    if (cell) div.classList.add(cell === 'X' ? 'x' : 'o');
    div.dataset.idx = idx;
    div.textContent = cell || '';
    if (!cell && !gameOver) {
      div.addEventListener('click', onCellClick);
    } else {
      div.classList.add('disabled');
    }
    boardEl.appendChild(div);
  });
  turnEl.textContent = turn;

  // If single-player and it's AI's turn, let AI move
  if (!gameOver && modeEl.value === 'single' && turn === aiSymbolEl.value) {
    // small delay for UX
    setTimeout(() => aiMakeMove(), 250);
  }
}

function onCellClick(e) {
  const i = Number(e.currentTarget.dataset.idx);
  if (gameOver || board[i]) return;

  // If single-player and player clicked when it's AI's symbol, ignore
  if (modeEl.value === 'single' && turn === aiSymbolEl.value) return;

  board[i] = turn;
  const winner = checkWinner(board);
  if (winner) {
    gameOver = true;
    showResult(winner === 'draw' ? 'Draw!' : (winner + ' wins!'));
  } else {
    turn = turn === 'X' ? 'O' : 'X';
  }
  renderBoard();
}

function checkWinner(b) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b1,c] of lines) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  if (b.every(Boolean)) return 'draw';
  return null;
}

function showResult(text) {
  document.getElementById('status').textContent = text;
}

resetBtn.addEventListener('click', () => {
  board = Array(9).fill(null);
  turn = 'X';
  gameOver = false;
  document.getElementById('status').innerHTML = 'Turn: <span id="turn">X</span>';
  renderBoard();
});

// AI helpers
function availableMoves(b) {
  return b.map((v,i) => v ? null : i).filter(v => v !== null);
}

function randomMove(b) {
  const moves = availableMoves(b);
  return moves[Math.floor(Math.random()*moves.length)];
}

function mediumMove(b, ai) {
  // win if possible
  for (const m of availableMoves(b)) {
    const copy = b.slice(); copy[m] = ai;
    if (checkWinner(copy) === ai) return m;
  }
  // block opponent
  const opp = ai === 'X' ? 'O' : 'X';
  for (const m of availableMoves(b)) {
    const copy = b.slice(); copy[m] = opp;
    if (checkWinner(copy) === opp) return m;
  }
  return randomMove(b);
}

function minimax(b, player, ai, depthLimit = Infinity) {
  const winner = checkWinner(b);
  if (winner === ai) return {score: 10};
  if (winner && winner !== 'draw') return {score: -10};
  if (winner === 'draw') return {score: 0};
  if (depthLimit === 0) return {score: 0};

  const moves = availableMoves(b);
  const scores = [];

  for (const m of moves) {
    const copy = b.slice();
    copy[m] = player;
    const nextPlayer = player === 'X' ? 'O' : 'X';
    const result = minimax(copy, nextPlayer, ai, depthLimit - 1);
    scores.push({move: m, score: result.score});
  }

  // If current player is AI, pick max score
  const isAiTurn = (player === ai);
  let best = isAiTurn ? -Infinity : Infinity;
  let bestMove = null;
  for (const s of scores) {
    if (isAiTurn) {
      if (s.score > best) { best = s.score; bestMove = s.move; }
    } else {
      if (s.score < best) { best = s.score; bestMove = s.move; }
    }
  }
  return {move: bestMove, score: best};
}

function aiMakeMove() {
  if (gameOver) return;
  const ai = aiSymbolEl.value;
  const diff = difficultyEl.value;
  let move = null;
  if (diff === 'easy') move = randomMove(board);
  else if (diff === 'medium') move = mediumMove(board, ai);
  else {
    // hard: full minimax
    const depthLimit = 9; // full search
    const res = minimax(board, ai, ai, depthLimit);
    move = res.move;
    if (move === null || move === undefined) move = randomMove(board);
  }

  if (move !== null && move !== undefined) {
    board[move] = ai;
    const winner = checkWinner(board);
    if (winner) {
      gameOver = true;
      showResult(winner === 'draw' ? 'Draw!' : (winner + ' wins!'));
    } else {
      turn = turn === 'X' ? 'O' : 'X';
    }
    renderBoard();
  }
}

// Initialize UI state and render
// If single-player and AI is X (goes first), let it play on start
function init() {
  renderBoard();
  if (modeEl.value === 'single' && aiSymbolEl.value === 'X') {
    setTimeout(() => aiMakeMove(), 300);
  }
}

modeEl.addEventListener('change', () => init());
difficultyEl.addEventListener('change', () => {});
aiSymbolEl.addEventListener('change', () => init());

init();
