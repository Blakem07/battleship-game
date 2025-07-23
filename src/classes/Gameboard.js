export default class Gameboard {
  static BOARD_ROWS = 3;
  static BOARD_COLS = 10;

  constructor() {
    this.board = this.initGameboard();
  }

  initGameboard() {
    const board = Array(Gameboard.BOARD_ROWS);

    for (let i = 0; i < Gameboard.BOARD_ROWS; i++) {
      board[i] = Array(Gameboard.BOARD_COLS);
      for (let j = 0; j < Gameboard.BOARD_COLS; j++) {
        board[i][j] = "";
      }
    }

    return board;
  }
}
