export default class GameController {
  constructor(player, computer) {
    this.player = player;
    this.computer = computer;
    this.currentTurn = "player";
    this.gameOver = false;
    this.winner = null;
  }

  /**
   * Repeatedly checks the player's ship positions every 500ms until 5 or more ships have been placed.
   * Once the condition is met, the polling stops and the function resolves with the final ship positions.
   *
   * @param {Function} getPlayerShipPositions - A function that returns the current array of player ship positions.
   * @returns {Promise<Array>} A promise that resolves with the ship positions once 5 or more are recorded.
   */
  waitForFiveShips(getPlayerShipPositions) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const positions = getPlayerShipPositions();

        if (positions.length >= 5) {
          clearInterval(interval);
          resolve(positions);
        }
      }, 500);
    });
  }

  async waitForPlayerAttack(getPlayerAttackPosition) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const position = getPlayerAttackPosition();

        if (
          position &&
          typeof position === "object" &&
          Number.isInteger(position.row) &&
          Number.isInteger(position.col)
        ) {
          clearInterval(interval);
          resolve(position);
        }
      }, 100);
    });
  }

  /**
   * Returns a default attack position used when no player input is available.
   * Currently hardcoded to the top-left corner (0, 0).
   * This is used as a fallback in test environments or non-interactive scenarios.
   *
   * @returns {{ row: number, col: number }} A default attack coordinate.
   */
  getDefaultAttackPosition() {
    return { row: 0, col: 0 };
  }

  /**
   * Starts the game.
   *
   * @param {Function} getPlayerShipPositions - UI Dependency Injection
   * @param {Function} getPlayerAttackPositon - UI Dependency Injection
   * @param {Function} displayWinner - UI Dependency Injection
   * @param {function} markCellBasedOnHit - UI DI used to mark cells on an attack.
   */
  async playGame(
    getPlayerShipPositions,
    getPlayerAttackPositon,
    displayWinner,
    markCellBasedOnHit
  ) {
    await this.setupGame(getPlayerShipPositions);

    while (!this.gameOver) {
      await this.playRound({
        getPlayerAttackPosition: getPlayerAttackPositon,
        markCellBasedOnHit: markCellBasedOnHit,
      });
    }

    displayWinner(this.winner);
  }

  /**
   * Resets game state variables, ensuring game is ready to replay.
   */
  resetGame() {
    this.currentTurn = "player";
    this.gameOver = false;
    this.winner = null;

    this.player.gameboard.resetBoard();
    this.computer.gameboard.resetBoard();
  }

  /**
   * Sets up the gameplay loop by reseting game state
   * variables and placing ships.
   *
   * @param {Function} getPlayerShipPositions UI Dependency Injection
   */
  async setupGame(getPlayerShipPositions) {
    // Reset game state variables.
    this.resetGame();
    // Get Player input from UI and PlaceAllShips using their ship positions
    const playerShipPostions = await this.waitForFiveShips(
      getPlayerShipPositions
    );
    this.placeAllShips(playerShipPostions);
  }

  /**
   * Determines whether the game if over by checking
   * if any fleet has been sunk.
   */
  isGameOver() {
    const isComputerFleetSunk = this.computer.gameboard.reportShipStatus();
    const isPlayerFleetSunk = this.player.gameboard.reportShipStatus();

    if (isComputerFleetSunk || isPlayerFleetSunk) this.gameOver = true;

    if (isComputerFleetSunk) {
      this.winner = "player";
    } else if (isPlayerFleetSunk) {
      this.winner = "computer";
    }

    return this.gameOver;
  }

  /**
   * Executes a full round of gameplay consisting of one player attack
   * followed by one computer attack. Updates the game state accordingly.
   *
   * - Skips execution if the game is already over.
   * - Waits for player's input (via injected UI method) or defaults to a fallback.
   * - Applies hit/miss logic and updates the board using the injected UI handler.
   *
   * @param {Object} params
   * @param {Function} params.getPlayerAttackPosition - UI dependency to get player's attack input.
   * @param {Function} params.markCellBasedOnHit - UI dependency used to update the board with hit/miss.
   *
   * @returns {Promise<void>}
   */
  async playRound({
    getPlayerAttackPosition: getPlayerAttackPosition,
    markCellBasedOnHit: markCellBasedOnHit,
  }) {
    if (this.isGameOver()) return;

    // Player's attack
    const playerAttackPosition =
      typeof getPlayerAttackPosition === "function"
        ? await this.waitForPlayerAttack(getPlayerAttackPosition)
        : this.getDefaultAttackPosition();

    const { row, col } = playerAttackPosition;
    this.takeTurn({
      row: row,
      col: col,
      markCellBasedOnHit: markCellBasedOnHit,
    });

    if (this.isGameOver()) return;

    // Computer's attack
    this.takeTurn({ markCellBasedOnHit: markCellBasedOnHit });
  }

  /**
   * Handles the logic for a player's or computer's turn.
   * Executes an attack based on the current turn,
   * then alternates the turn.
   *
   * @param {number} [row] - The row coordinate of the attack (player only).
   * @param {number} [col] - The column coordinate of the attack (player only).
   * @param {function} markCellBasedOnHit - UI DI used to mark cells on an attack.
   */
  takeTurn({ row: row, col: col, markCellBasedOnHit: markCellBasedOnHit }) {
    const player = this.player;
    const computer = this.computer;

    if (this.gameOver) return;

    computer.gameboard.printGrid();

    const opponent =
      this.currentTurn === "player" ? this.computer : this.player;
    const opponentType = this.currentTurn === "player" ? "computer" : "player";

    if (this.currentTurn == "player") {
      const opponentHit = player.attack(opponent, row, col);
      markCellBasedOnHit(row, col, opponentType, opponentHit);
    } else if (this.currentTurn == "computer") {
      const { playerHit, row, col } = computer.randomAttack(opponent);
      markCellBasedOnHit(row, col, opponentType, playerHit);
    }

    this.currentTurn = this.currentTurn === "player" ? "computer" : "player";
  }

  /**
   * placeAllShips Method.
   *
   * Places all of the player's and computer's ships on the board.
   *
   * @param {Array<object>} shipPositions - An array of ship positions for the player.
   * @return {Boolean} - Returns true if all ships are placed successfully, false otherwise.
   */
  placeAllShips(shipPositions) {
    let success = true;

    if (!this.placePlayerShips(shipPositions)) {
      success = false;
    }

    if (!this.placeComputerShips("randomly")) {
      success = false;
    }

    return success;
  }

  /**
   * Places all ships for the player based on positions from the UI.
   *
   * @param {Array<Object>} shipPositions - Array of ship position objects.
   * @returns {boolean} True if all ships placed successfully, otherwise false.
   */
  placePlayerShips(shipPositions) {
    const validKeys = ["row", "col", "shipName", "direction"];

    for (const shipPosition of shipPositions) {
      if (
        typeof shipPosition !== "object" ||
        shipPosition === null ||
        !validKeys.every((key) => key in shipPosition)
      ) {
        throw new Error("Error, one of the ship positions has invalid keys");
      }
    }

    for (const shipPosition of shipPositions) {
      const result = this.player.placeShip(
        shipPosition["row"],
        shipPosition["col"],
        shipPosition["shipName"],
        shipPosition["direction"]
      );

      if (!result) {
        return false; // This now exits placePlayerShips immediately
      }
    }

    return true;
  }
  /**
   * PlaceComputerShips Method.
   *
   * Calls a method in Computer handling all ship placement.
   *
   * @param {String} - Method name
   * @return {Boolean} True if on success else false.
   */
  placeComputerShips(methodName) {
    methodName = `placeShips${this.capitalize(methodName)}`;

    if (typeof this.computer[methodName] === "function") {
      return this.computer[methodName]();
    } else {
      throw new Error(`Invalid method: ${methodName}`);
    }
  }

  capitalize(methodName) {
    return methodName.charAt(0).toUpperCase() + methodName.slice(1);
  }
}
