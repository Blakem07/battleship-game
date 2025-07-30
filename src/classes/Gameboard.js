export default class Gameboard {
  static BOARD_ROWS = 10;
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
   * PlaceShipHorizontal method.
   *
   * Places a ship on the board property within the gameboard instance.
   *
   * @param {number} column - Starting column (x-coordinate)
   * @param {number} row - Starting row (y-coordinate)
   * @param {number} length - Length of the ship
   */

  placeShipHorizontal(column, row, length) {
    const spaceLeft = Gameboard.BOARD_COLS - column;

    if (
      column < 0 ||
      column > Gameboard.BOARD_COLS ||
      row < 0 ||
      row > Gameboard.BOARD_ROWS
    ) {
      throw new Error("The ship has been placed in an out of bounds position.");
    }

    for (let i = column; i < column + length; i++) {
      if (this.grid[row][i] == "S") {
        throw new Error(`A ship already occupies row: ${row} column: ${i}`);
      }
    }

    if (length > spaceLeft) {
      throw new Error(
        "Not enough horizontal space left for the ship to be placed."
      );
    }
    for (let i = 0; i < length; i++) {
      this.grid[row][column + i] = "S";
    }
  }

  /**
   * RecieveAttack method.
   *
   * Takes a pair of coordinates and determines whether or not
   * a ship has been hit.
   *
   * @param {number} column - Starting column (x-coordinate)
   * @param {number} row - Starting row (y-coordinate)
   * @return {bool} - Returns true if a ship has been hit
   */
  recieveAttack(column, row) {
    if (this.grid[column][row] == "S") {
      return true;
    }
  }
}
