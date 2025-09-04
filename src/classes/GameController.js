export default class GameController {
  constructor(player, computer) {
    this.player = player;
    this.computer = computer;
    this.currentTurn = "player";
    this.gameOver = false;
    this.winner = null;
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
  setupGame(getPlayerShipPositions) {
    // Reset game state variables.
    this.resetGame();
    // Get Player input from UI and PlaceAllShips using their ship positions
    const playerShipPostions = getPlayerShipPositions();
    this.placeAllShips(playerShipPostions);
  }

  isGameOver() {
    const hasPlayerWon = this.computer.gameboard.reportShipStatus();
    const hasComputerWon = this.player.gameboard.reportShipStatus();

    if (hasPlayerWon || hasComputerWon) this.gameOver = true;
  }

  /**
   * Plays one turn (player and computer firing shots)
   * and updates game state.
   *
   * @param {Function} getPlayerAttackPositon - UI Dependency Injection
   */
  playRound(getPlayerAttackPositon) {
    if (this.isGameOver()) return;

    // Player's attack
    const [row, col] = getPlayerAttackPositon();
    this.takeTurn(row, col);

    if (this.isGameOver()) return;

    // Computer's attack
    this.takeTurn();
  }

  /**
   * Handles the logic for a player's or computer's turn.
   * Executes an attack based on the current turn,
   * then alternates the turn.
   *
   * @param {number} [row] - The row coordinate of the attack (player only).
   * @param {number} [col] - The column coordinate of the attack (player only).
   */
  takeTurn(row, col) {
    const player = this.player;
    const computer = this.computer;

    if (this.gameOver) return;

    const opponent =
      this.currentTurn === "player" ? this.computer : this.player;

    if (this.currentTurn == "player") {
      player.attack(opponent, row, col);
    } else if (this.currentTurn == "computer") {
      computer.randomAttack(opponent);
    }

    this.currentTurn = this.currentTurn === "player" ? "computer" : "player";
  }

  /**
   * PlaceAllShips Method.
   *
   * Places all of the players and computers ships on the board.
   *
   * @param {Array<object>} - shipPositons (belonging to the player).
   * @return {Boolean} - Returns true on success, else false.
   */
  placeAllShips(shipPositions) {
    return (
      this.placePlayerShips(shipPositions) &&
      this.placeComputerShips("randomly")
    );
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
