import Ship from "./Ship";

export default class Computer {
  static MAX_FLEET_PLACEMENT_ATTEMPTS = 5;
  static MAX_SHIP_PLACEMENT_ATTEMPTS = 100;
  static PLACEMENT_METHODS = ["randomly"];

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
   * Handles the ship placement of the entire fleet by calling tryPlaceShip
   * with random arguments.
   *
   * @return {bool} - True on success, else false.
   */
  placeShipsRandomly() {
    const gameboard = this.player.gameboard;
    let fleetPlaced = false;
    let attempts = 0;

    while (!fleetPlaced && attempts < Computer.MAX_FLEET_PLACEMENT_ATTEMPTS) {
      gameboard.resetBoard();
      let shipsPlaced = 0;

      Ship.VALID_NAMES.forEach((shipName) => {
        const isSuccessful = this.tryPlaceShip(shipName);

        if (isSuccessful) {
          shipsPlaced++;
        }
      });

      if (shipsPlaced == Ship.VALID_NAMES.length) {
        fleetPlaced = true;
      } else {
        attempts++; // Increment per failed fleet placement
      }
    }

    return fleetPlaced;
  }

  /**
   * tryPlaceShip method.
   *
   * Called during placeShipsRandommly for ship placement.
   *
   * @param {string} shipName
   * @return {bool} True on success, else false.
   */
  tryPlaceShip(shipName) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < Computer.MAX_SHIP_PLACEMENT_ATTEMPTS) {
      let rX = this.getRandomInt(0, 10);
      let rY = this.getRandomInt(0, 10);
      let direction = Math.random() < 0.5 ? "horizontal" : "vertical";

      const isSuccessful = this.player.placeShip(rX, rY, shipName, direction);

      if (isSuccessful) {
        placed = true;
      } else {
        attempts++;
      }
    }

    return placed;
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
