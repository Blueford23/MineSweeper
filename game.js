class gCell {
  constructor() {
    this.minesAround = 0;
    this.isShown = false;
    this.isMine = false;
    this.isFlagged = false;
  }
}

let Mine = 'X';
let HiddenCell = '*';
let flag = '?';

let gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  minePressed: false,
  levels: [
    { title: 'Beginner', size: 4, minesLimit: 2 },
    { title: 'Medium', size: 8, minesLimit: 12 },
    { title: 'Expert', size: 12, minesLimit: 30 },
  ],
};

let gBoard;
let gScore = 0;

function init(levelIndex = 0) {
  gBoard = buildBoard(levelIndex);
  renderBoard(gBoard);
}

function buildBoard(levelIndex) {
  let level = gGame.levels[levelIndex];
  let mineCount = 0;
  let mat = [];
  for (var i = 0; i < level.size; i++) {
    mat[i] = [];
    for (var j = 0; j < level.size; j++) {
      mat[i][j] = new gCell();
      if (level.minesLimit > mineCount) {
        mat[i][j].isMine = getIsMine(0.3);
        mineCount += mat[i][j].isMine ? 1 : 0;
      }
    }
  }
  return mat;
}

function renderBoard(board) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      var cell = renderCell(board[i][j]);
      var className = 'cell';
      let id = 'cell' + i + '-' + j;
      strHTML += '<td class="' + className + '"' + ' id="' + id + '"';
      strHTML = strHTML.concat('onClick="cellClicked(this,', i, ',', j, ')"');
      strHTML += '> ' + cell + ' </td>';
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector('.board-container');
  elContainer.innerHTML = strHTML;
}

function renderCell(cell) {
  return cell.isShown ? (cell.isMine ? Mine : cell.minesAround) : HiddenCell;
}

function cellClicked(elCell, i, j) {
  const cell = gBoard[i][j];
  if (!gGame.isOn) {
  }
  if (cell.isShown) return;
  if (cell.isMine) {
    gGame.minePressed = true;
  } else {
    cell.minesAround = getMinesNegsAround(gBoard, i, j);
  }
  cell.isShown = !cell.isShown;
  elCell.innerText = renderCell(cell);
  console.log(elCell, i, j);
}

function cellMarked(elCell) {}

function checkGameOver() {}

function setMinesNegsCount(board) {}

function getMinesNegsAround(board, iIndex, jIndex) {
  let count = 0;
  for (var i = iIndex - 1; i <= iIndex + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = jIndex - 1; j <= jIndex + 1; j++) {
      if (j < 0 || j > board[0].length - 1) continue;
      if (i === iIndex && j === jIndex) continue;
      var cell = board[i][j];
      count += cell.isMine ? 1 : 0;
    }
  }
  return count;
}

function getVisCell(i, j) {
  let elCell = document.querySelector('#cell' + i + '-' + j);
  return elCell;
}

function getIsMine(odds = 0.5) {
  return Math.random() < odds ? true : false;
}

init();
