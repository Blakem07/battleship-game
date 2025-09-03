export default class GameController {
  constructor(player, computer) {
    this.player = player;
    this.computer = computer;
    this.currentTurn = "player";
    this.gameOver = false;
  }
  /**
   * PlaceAllShips Method.
   *
   * Places all of the players and computers ships on the board.
   *
   * @param {Array<object>} - shipPositons (Beloning to the player).
   * @return {bool} - Returns true on success.
   */
  placeAllShips(shipPositions) {
    this.placePlayerShips(shipPositions);
    this.placeComputerShips("randomly");
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
