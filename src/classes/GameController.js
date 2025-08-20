export default class GameController {
  constructor(player, computer) {
    this.player = player;
    this.computer = computer;
    this.currentTurn = "player";
    this.gameOver = false;
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
    const validKeys = ["row", "col", "length", "shipName", "direction"];

    shipPositions.forEach((shipPosition) => {
      if (
        typeof shipPosition !== "object" ||
        shipPosition === null ||
        !validKeys.every((key) => key in shipPosition)
      ) {
        throw new Error("Error, one of the ship positions has invalid keys");
      }

      this.player.placeShip(shipPosition);
    });
  }
}
