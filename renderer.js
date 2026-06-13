const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turn');
const resetBtn = document.getElementById('reset');

let board = Array(9).fill(null);
let turn = 'X';
let gameOver = false;

function renderBoard() {
  boardEl.innerHTML = '';
  board.forEach((cell, idx) => {
    const div = document.createElement('div');
    div.className = 'cell' + (cell || '');
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
}

function onCellClick(e) {
  const i = Number(e.currentTarget.dataset.idx);
  if (gameOver || board[i]) return;
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
    if (board[a] && board[a] === board[b1] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'draw';
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

renderBoard();
