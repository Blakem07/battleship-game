import Ship from "./Ship";

/**
 * Represents the Battleship gameboard.
 *
 * Manages a 10x10 grid where ships are placed and attacks are recorded.
 * Provides functionality to:
 * - Initialize and reset the gameboard.
 * - Place ships with validation to avoid overlaps and out-of-bound placements.
 * - Receive attacks and track hits or misses.
 * - Report overall ship status (sunk or afloat).
 * - Expose safe, deep-cloned views of the board state to prevent external mutation.
 *
 * Encapsulates private data including ship positions, attack records, and ship instances.
 */
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

    // Horizontal overlap
    if (dir === "horizontal") {
      for (let c = column; c < column + length; c++) {
        if (this.#grid[row][c] !== null) {
          return false; // Position already occupied
        }
      }
    } else {
      // vertical
      for (let r = row; r < row + length; r++) {
        if (this.#grid[r][column] !== null) {
          return false; // Position already occupied
        }
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

    const alreadyAttacked =
      this.#landedAttacks[key] || this.#missedAttacks[key];

    if (alreadyAttacked) return null;

    if (this.#grid[row][column] !== null) {
      this.#grid[row][column].hit();
      this.#landedAttacks[key] = true;
      // console.log(this.ships);
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
    const ships = this.ships; // calls getter which returns cloned ships array

    if (ships.length === 0) return false;

    for (let ship of ships) {
      if (!ship.isSunk()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Getter for the grid.
   *
   * Returns a deep clone of the private #grid property.
   * Each element in the grid is cloned to prevent external mutation.
   * - If the element is an instance of Ship, it uses the Ship's clone method.
   * - Otherwise, it uses structuredClone to deep clone the element.
   *
   * @returns {Array<Array<Object|null>>} Deep clone of the grid.
   */
  get grid() {
    return this.#grid.map((row) => {
      return row.map((col) => {
        if (col != null && col instanceof Ship) return col.clone();
        else {
          return structuredClone(col);
        }
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
    if (!this.#ships) {
      return [];
    }
    return Object.values(this.#ships).map((ship) => ship.clone());
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

  printGrid() {
    let gridString = "";

    for (let row = 0; row < Gameboard.BOARD_ROWS; row++) {
      let rowString = "";
      for (let col = 0; col < Gameboard.BOARD_COLS; col++) {
        const ship = this.#grid[row][col];
        if (ship !== null) {
          rowString += "S "; // Mark as part of a ship
        } else {
          rowString += "~ "; // Empty space
        }
      }
      gridString += rowString.trim() + "\n";
    }

    console.log(gridString);
  }
}
