import Ship from "./Ship";

export default class Gameboard {
  static BOARD_ROWS = 10;
  static BOARD_COLS = 10;

  constructor() {
    this.grid = this.initGameboard();
    this.missedAttacks = {};
    this.landedAttacks = {};
    this.ships = {};
  }

  initGameboard() {
    const grid = Array(Gameboard.BOARD_ROWS);

    for (let i = 0; i < Gameboard.BOARD_ROWS; i++) {
      grid[i] = Array(Gameboard.BOARD_COLS);
      for (let j = 0; j < Gameboard.BOARD_COLS; j++) {
        grid[i][j] = null;
      }
    }

    return grid;
  }

  /**
   * IsValidCoordinate method.
   *
   * Checks whether a coordinate exists within the grid.
   */
  isValidCoordinate(row, column) {
    return (
      typeof row === "number" &&
      typeof column === "number" &&
      row >= 0 &&
      column >= 0 &&
      column < this.grid.length &&
      row < this.grid[column].length
    );
  }

  //

  /**
   * PlaceShipHorizontal method.
   *
   * Places a ship on the board property within the gameboard instance and
   *  adds them to the ships dictionary.
   *
   * @param {number} column - Starting column (x-coordinate)
   * @param {number} row - Starting row (y-coordinate)
   * @param {number} length - Length of the ship
   * @param {string} shipName - Name of the ship
   */

  placeShipHorizontal(row, column, length, shipName) {
    const spaceLeft = Gameboard.BOARD_COLS - column;

    if (!this.isValidCoordinate(row, column)) {
      throw new Error("The ship has been placed in an out of bounds position.");
    }

    for (let i = column; i < column + length; i++) {
      if (this.grid[row][i] !== null) {
        throw new Error(`A ship already occupies row: ${row} column: ${i}`);
      }
    }

    if (length > spaceLeft) {
      throw new Error(
        "Not enough horizontal space left for the ship to be placed."
      );
    }

    const validNames = [
      "carrier",
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
    ];

    if (!validNames.includes(shipName)) {
      throw new Error("The ship name passed as an arugment is invalid.");
    }

    let ship = new Ship(length);

    for (let i = 0; i < length; i++) {
      this.grid[row][column + i] = ship;
    }

    this.ships[shipName] = ship;
  }

  /**
   * ReceiveAttack method.
   *
   * Takes a pair of coordinates and determines whether or not
   * a ship has been hit.
   *
   * Has the hit ship call the hit function or records
   * the coordinates of the missed shot to prevent repeat attacks.
   *
   * @param {number} column - Starting column (x-coordinate)
   * @param {number} row - Starting row (y-coordinate)
   * @return {bool} - Returns true if a ship has been hit
   */
  receiveAttack(row, column) {
    const key = `${row},${column}`;

    if (!this.isValidCoordinate(row, column)) {
      throw new Error(
        "This is invalid as the given position is out of bounds."
      );
    }

    if (this.landedAttacks[key]) {
      throw new Error(
        "Invalid attack, this position has been attacked before."
      );
    }

    if (this.grid[row][column] !== null) {
      this.grid[row][column].hit();
      this.landedAttacks[key] = true;
      return true;
    } else {
      this.missedAttacks[key] = true;
      return false;
    }
  }

  /**
   * ReportShipStatus method.
   *
   * Reports whether or not all of their ships have been sunk.
   *
   * @return {boolean} - Returns true if all ships have been sunk, false otherwise.
   */
  reportShipStatus() {
    if (Object.keys(this.ships).length <= 0) {
      throw new Error(
        "Error, reportShipStatus has been called but no ships have been placed on the board."
      );
    }

    for (let ship in this.ships) {
      if (!this.ships[ship].isSunk()) {
        return false;
      }
    }
    return true;
  }
}
