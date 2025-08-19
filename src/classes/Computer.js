export default class Computer {
  constructor(player) {
    this.player = player;
  }

  /**
   * randomAttack method.
   *
   * Calls player.attack with randomly generated numbers.
   *
   * @param {object} - Target of the attack.opponent
   * @returns {*} - Result of player.attack()
   */
  randomAttack(opponent) {
    const rX = this.getRandomInt(0, 10);
    const rY = this.getRandomInt(0, 10);

    return this.player.attack(opponent, rX, rY);
  }

  /**
   * placeShipsRandomly method.
   *
   * Handles the ship placement of the entire fleet using randomly generated numbers.
   *
   */
  placeShipsRandomly() {
    const shipNames = [
      "carrier",
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
    ];

    const shipLengths = {
      carrier: 5,
      battleship: 4,
      cruiser: 3,
      submarine: 3,
      destroyer: 2,
    };

    shipNames.forEach((shipName) => {
      let rX = this.getRandomInt(0, 10);
      let rY = this.getRandomInt(0, 10);
      let direction = rX % 2 === 0 ? "horizontal" : "vertical";

      this.player.placeShip(rX, rY, shipLengths[shipName], shipName, direction);
    });
  }

  /**
   * getRandomInt method.
   *
   * Returns a number between a min and a max.
   *
   * @param {number} - Mininum limit
   * @param {number} - Maximum limit
   * @return {number} - Random number.
   */
  getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
  }
}
