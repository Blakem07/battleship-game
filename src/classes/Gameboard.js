export default class Gameboard {
  static BOARD_ROWS = 3;
  static BOARD_COLS = 10;

  constructor() {
    this.grid = this.initGameboard();
  }

  initGameboard() {
    const grid = Array(Gameboard.BOARD_ROWS);

    for (let i = 0; i < Gameboard.BOARD_ROWS; i++) {
      grid[i] = Array(Gameboard.BOARD_COLS);
      for (let j = 0; j < Gameboard.BOARD_COLS; j++) {
        grid[i][j] = "";
      }
    }

    return grid;
  }
  /**
   * PlaceShipHorizontal.
   *
   * Places a ship on the board property within the gameboard instance.
   *
   * @param {number} column - Starting column (x-coordinate)
   * @param {number} row - Starting row (y-coordinate)
   * @param {number} length - Length of the ship
   */

  placeShipHorizontal(column, row, length) {
    for (let i = 0; i < length; i++) {
      this.grid[row][column + i] = "S";
    }
  }
}
