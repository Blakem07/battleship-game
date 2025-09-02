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
   * placePlayerShips method.
   *
   * This method places all ships for the player based on ship
   * positions passed to it by the UI.
   *
   * @param {Array} - shipPositions passed from UI
   */
  placePlayerShips(shipPositions) {
    const validKeys = ["row", "col", "shipName", "direction"];

    shipPositions.forEach((shipPosition) => {
      if (
        typeof shipPosition !== "object" ||
        shipPosition === null ||
        !validKeys.every((key) => key in shipPosition)
      ) {
        throw new Error("Error, one of the ship positions has invalid keys");
      }

      this.player.placeShip(
        shipPosition["row"],
        shipPosition["col"],
        shipPosition["shipName"],
        shipPosition["direction"]
      );
    });
  }
  /**
   * PlaceComputerShips Method.
   *
   * Calls a method in Computer handling all ship placement.
   *
   * @param {string} - Method name
   * @return {*} - Calls Computer. placement method*
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
