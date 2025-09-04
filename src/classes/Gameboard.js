import Ship from "./Ship";

export default class Gameboard {
  static BOARD_ROWS = 10;
  static BOARD_COLS = 10;

  #grid;
  #missedAttacks;
  #landedAttacks;
  #ships;

  constructor() {
    this.#grid = this.initGameboard();
    this.#missedAttacks = {};
    this.#landedAttacks = {};
    this.#ships = {};
  }

  initGameboard() {
    const grid = Array(Gameboard.BOARD_ROWS)
      .fill(null)
      .map(() => {
        return Array(Gameboard.BOARD_COLS).fill(null);
      });

    return grid;
  }

  /**
   * ResetBoard Method.
   *
   * Resets all gameboard properties to default values.
   */
  resetBoard() {
    this.#grid = this.initGameboard();
    this.#missedAttacks = {};
    this.#landedAttacks = {};
    this.#ships = {};
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
      column < Gameboard.BOARD_COLS &&
      row < Gameboard.BOARD_ROWS
    );
  }
  //

  /**
   * PlaceShip method.
   *
   * Places a ship on the board property within the gameboard instance and
   *  adds them to the ships dictionary.
   *
   * @param {number} column - Starting column (x-coordinate)
   * @param {number} row - Starting row (y-coordinate)
   * @param {number} length - Length of the ship
   * @param {string} shipName - Name of the ship
   * @param {string} direction - Horizontal or vertical placement
   * @return {bool} - True on success, else false.
   */

  placeShip(row, column, shipName, direction = "horizontal") {
    const length = Ship.VALID_LENGTHS[shipName];

    const isValid = this.verifyShipPlacement(
      row,
      column,
      shipName,
      direction,
      length
    );

    if (!isValid) {
      return false;
    }

    let ship = new Ship(shipName);

    for (let i = 0; i < length; i++) {
      if (direction.toLowerCase() == "horizontal") {
        this.#grid[row][column + i] = ship;
      } else if (direction.toLowerCase() == "vertical") {
        this.#grid[row + i][column] = ship;
      }
    }

    this.#ships[shipName] = ship;

    return true;
  }

  /**
   * VerifyShipPlacement Helper Method.
   *
   * Verifies a ship can be placed on the gameboard correctly.
   *
   * @param {number} row - Starting row (y-coordinate)
   * @param {number} column - Starting column (x-coordinate)
   * @param {number} length - Length of the ship
   * @param {string} shipName - Name of the ship
   * @param {string} direction - Horizontal or vertical placement
   * @param {string} length - Length of ship
   * @return {bool} - True on success, else false
   */
  verifyShipPlacement(row, column, shipName, direction, length) {
    const dir = direction.toLowerCase();
    const horizontalSpaceLeft = Gameboard.BOARD_COLS - column;
    const verticalSpaceLeft = Gameboard.BOARD_ROWS - row;

    if (length !== Ship.VALID_LENGTHS[shipName]) {
      throw new Error("Error ship length does not match");
    }

    if (!this.isValidCoordinate(row, column)) {
      throw new Error(
        `The ship has been placed in an out of bounds position: Row:${row} Col:${column}`
      );
    }

    if (dir !== "horizontal" && dir !== "vertical") {
      throw new Error(
        "Error an invalid direction has been passed to placeShip"
      );
    }

    if (!Ship.VALID_NAMES.includes(shipName)) {
      throw new Error("The ship name passed as an arugment is invalid.");
    }

    // Expected Failures

    if (
      (dir === "horizontal" && length > horizontalSpaceLeft) ||
      (dir === "vertical" && length > verticalSpaceLeft)
    ) {
      return false;
    }

    for (let i = column; i < column + length; i++) {
      if (this.#grid[row][i] !== null) {
        return false; // Positon already occupied
      }
    }

    return true;
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
        `Invalid coordinate: (${row}, ${column}) is outside the board bounds.`
      );
    }

    if (this.#landedAttacks[key]) {
      throw new Error(
        "Invalid attack, this position has been attacked before."
      );
    }

    if (this.#grid[row][column] !== null) {
      this.#grid[row][column].hit();
      this.#landedAttacks[key] = true;
      return true;
    } else {
      this.#missedAttacks[key] = true;
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
    if (Object.keys(this.#ships).length <= 0) {
      throw new Error(
        "Error, reportShipStatus has been called but no ships have been placed on the board."
      );
    }

    for (let ship in this.#ships) {
      if (!this.#ships[ship].isSunk()) {
        return false;
      }
    }
    return true;
  }

  /**
   * get grid Getter.
   *
   * Returns a deep clone of this.#grid
   *
   * @return {array<Object>} - Deep clone of grid.
   */
  get grid() {
    return this.#grid.map((row) => {
      return row.map((col) => {
        return structuredClone(col);
      });
    });
  }

  /**
   * get ships Getter.
   *
   * Returns an array of deeply cloned ship objects.
   *
   * @return {Array<objects>} - Array of cloned ships.
   */
  get ships() {
    const shipsArray = [];

    if (!this.#ships) {
      return []; // return empty array if ships storage is undefined
    }

    Object.values(this.#ships).map((ship) => {
      shipsArray.push(ship.clone());
    });

    return shipsArray;
  }

  /**
   * get missedAttacks Getter.
   *
   * Returns a deep clone dictionary containing the missed attacks.
   *
   * @returns {Dictionary} - Deep clone of missed attacks.
   */
  get missedAttacks() {
    return structuredClone(this.#missedAttacks);
  }

  /**
   * get landedAttacks Getter.
   *
   * Returns a deep immutable clone of the #landedAttacks dictionary.
   *
   * @returns {Dictionary} - Deep clone of landed attacks.
   */
  get landedAttacks() {
    return structuredClone(this.#landedAttacks);
  }

  /**
   * GetShipAt Method.
   *
   * Returns a reference to the ship at a specific index
   * within the grid.
   *
   * @returns {Ship} - Ship Reference
   */
  getShipAt(row, col) {
    return this.#grid[row][col];
  }
}
