import Ship from "./Ship";

export default class Computer {
  static MAX_SHIP_PLACEMENT_ATTEMPTS = 100;

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
    Ship.VALID_NAMES.forEach((shipName) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < Computer.MAX_SHIP_PLACEMENT_ATTEMPTS) {
        let rX = this.getRandomInt(0, 10);
        let rY = this.getRandomInt(0, 10);
        let direction = rX % 2 === 0 ? "horizontal" : "vertical";

        try {
          this.player.placeShip(rX, rY, shipName, direction);
          placed = true; // success — exit loop
        } catch (error) {
          attempts++;
        }
      }

      if (!placed) {
        throw new Error(
          `Failed to place ship: ${shipName} after ${Computer.MAX_SHIP_PLACEMENT_ATTEMPTS} attempts.`
        );
      }
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
