class gCell {
  constructor() {
    this.minesAround = 0;
    this.isShown = false;
    this.isMine = false;
    this.isFlagged = false;
  }
}

class Level {
  title;
  size;
  mineLimit;
  constructor(title, size, mineLimit) {
    this.title = title;
    this.size = size;
    this.mineLimit = mineLimit;
  }
  get ShowsToWin() {
    return this.size ** 2 - this.mineLimit;
  }
}

let Mine = 'X';
let HiddenCell = '*';
let flag = '?';

let gGame = {
  isOn: false,
  shownCount: 0,
  minesOnBoard: 0,
  minesMarked: 0,
  score: 0,
  secsPassed: 0,
  levelSelectedIndex: 0,
  levels: [new Level('Beginner', 4, 2), new Level('Medium', 8, 12), new Level('Expert', 12, 30)],
  get CurrentLevel() {
    return this.levels[this.levelSelectedIndex];
  },
};

let gBoard;
let gScore = 0;

function init(levelIndex = 0) {
  gGame.levelSelectedIndex = levelIndex;
  gGame.isOn = false;
  gGame.minesMarked = gGame.score = gGame.secsPassed = gGame.shownCount = gGame.minesOnBoard = 0;
  gBoard = buildBoard();
  renderBoard(gBoard);
}

function buildBoard() {
  let level = gGame.CurrentLevel;
  let mat = [];
  for (var i = 0; i < level.size; i++) {
    mat[i] = [];
    for (var j = 0; j < level.size; j++) {
      mat[i][j] = new gCell();
    }
  }
  return mat;
}

function placeMines(board, iSafe, jSafe) {
  function seedMines() {
    let mineCount = gGame.minesOnBoard;
    let minesInRow = 0;
    for (var i = 0; i < level.size; i++) {
      minesInRow = 0;
      for (var j = 0; j < level.size; j++) {
        const cell = board[i][j];
        if ((i === iSafe && j === jSafe) || cell.isMine || minesInRow === 3) continue;
        if (level.mineLimit > mineCount) {
          cell.isMine = getIsMine();
          const diff = board[i][j].isMine ? 1 : 0;
          mineCount += diff;
          minesInRow += diff;
        } else {
          return mineCount;
        }
      }
    }
    return mineCount;
  }
  let level = gGame.CurrentLevel;
  while (gGame.minesOnBoard < gGame.CurrentLevel.mineLimit) {
    gGame.minesOnBoard = seedMines();
  }
}

//#region Html
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
      strHTML = strHTML.concat('oncontextmenu="cellMarked(this,', i, ',', j, ')"');
      strHTML += '> ' + cell + ' </td>';
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector('.board-container');
  elContainer.innerHTML = strHTML;
}

function renderCell(cell) {
  return cell.isShown
    ? cell.isMine
      ? Mine
      : cell.minesAround || ''
    : cell.isFlagged
    ? flag
    : HiddenCell;
}

function getVisCell(i, j) {
  let elCell = document.querySelector('#cell' + i + '-' + j);
  return elCell;
}

function updateScore(diff = 1) {
  gGame.score += diff;
  let elScore = document.querySelector('#score');
  if (elScore) {
    elScore.innerText = gGame.score;
  }
}

function renderlevels(levels) {
  let strHTML='';
    for (var j = 0; j < levels.length; j++) {
      strHTML+= '<td>\n'
      strHTML += '<button ' +'onClick="resetBtnHit('+j+')" >' 
      var cell = levels[j].title + ' (' + (levels[j].size**2)+')';
      strHTML +=  cell + '</button> \n';
      strHTML += '</td> \n'
    }
  var elContainer = document.querySelector('.levelContainer');
  elContainer.innerHTML = strHTML;
}

//#endregion

//#region Event handlers
function cellClicked(elCell, i, j) {
  const cell = gBoard[i][j];
  if (cell.isShown) return;
  if (!gGame.isOn) {
    placeMines(gBoard, i, j);
    gGame.isOn = true;
  }
  if (cell.isMine) {
    HandleIfGameOver(true);
    return;
  }
  cell.minesAround = getMinesNegsAround(gBoard, i, j);

  revealCell(cell, i, j, elCell);

  if (!cell.isMine && cell.minesAround === 0) revealAdjCells(gBoard, i, j);

  updateScore(1);
  HandleIfGameOver(false);
}

function cellMarked(elCell, i, j) {
  const cell = gBoard[i][j];
  if (cell.isShown) return false;
  cell.isFlagged = !cell.isFlagged;
  elCell.innerText = renderCell(cell);
  let diff = cell.isFlagged ? 1 : -1;
  updateScore(diff);
  if (cell.isMine) gGame.minesMarked += diff;
  HandleIfGameOver(false);
  // return false to avoid context menu
  return false;
}

function resetBtnHit(lvlIndex = 0) {
  init(lvlIndex);
}
//#endregion

//#region Cell reveals
function revealCell(cell, i, j, elCell) {
  if (cell.isShown || cell.isFlagged) return;
  if (!elCell) elCell = getVisCell(i, j);

  cell.isShown = true;
  gGame.shownCount++;
  elCell.innerText = renderCell(cell);
  console.log(elCell, 'i:' + i, 'j:' + j, cell);
}

function revealAdjCells(board, iIndex, jIndex) {
  for (var i = iIndex - 1; i <= iIndex + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = jIndex - 1; j <= jIndex + 1; j++) {
      if (j < 0 || j > board[0].length - 1 || (i === iIndex && j === jIndex)) continue;
      const cell = board[i][j];
      if (cell.isMine || cell.isShown) continue;
      // if no neighbors reveal proper cells around the cell
      cell.minesAround = getMinesNegsAround(board, i, j);
      updateScore(1);
      revealCell(cell, i, j);
      if (cell.minesAround === 0) revealAdjCells(board, i, j);
    }
  }
}

function revealEveryCell(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      const cell = board[i][j];

      if (!cell.isShown && cell.minesAround === 0)
        cell.minesAround = getMinesNegsAround(gBoard, i, j);
      if (!cell.isMine) cell.isFlagged = false;
      revealCell(cell, i, j);
    }
  }
}
//#endregion

function HandleIfGameOver(isMine) {
  if (isMine) {
    revealEveryCell(gBoard);
    alert('Gameover you hit a mine');
  } else {
    const cellsDiff = gGame.CurrentLevel.ShowsToWin - gGame.shownCount;
    if (gGame.minesMarked === gGame.minesOnBoard && cellsDiff === 0) {
      alert('you win');
    }
  }
}

function getMinesNegsAround(board, iIndex, jIndex) {
  let count = 0;
  for (var i = iIndex - 1; i <= iIndex + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = jIndex - 1; j <= jIndex + 1; j++) {
      if (j < 0 || j > board[0].length - 1 || (i === iIndex && j === jIndex)) continue;
      var cell = board[i][j];
      count += cell.isMine ? 1 : 0;
    }
  }
  return count;
}

function getIsMine() {
  odds = 0.25;
  return Math.random() < odds ? true : false;
}

document.addEventListener("DOMContentLoaded", function() {
  alert("Am I working right?");
  init(1);
renderlevels(gGame.levels);
});



