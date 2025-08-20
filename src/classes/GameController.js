export default class GameController {
  constructor(player, computer) {
    this.player = player;
    this.computer = computer;
    this.currentTurn = "player";
    this.gameOver = false;
  }
  
  /**
   * placeAllShips method.
   * 
   * This method places all ships for the player based on ship
   * positions passed to it by the UI.
   * 
   * @param {Array} - shipPositions passed from UI
  */
  placeAllShips(shipPositions) {
    shipPositions.forEach((shipPosition) => {
      this.player.placeShip(shipPosition);
    });
  }
}
