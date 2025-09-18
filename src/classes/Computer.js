import Ship from "./Ship";

export default class Computer {
  static MAX_FLEET_PLACEMENT_ATTEMPTS = 5;
  static MAX_SHIP_PLACEMENT_ATTEMPTS = 100;
  static PLACEMENT_METHODS = ["randomly"];

  constructor(player) {
    this.player = player;
    this.gameboard = this.player.gameboard;
  }

  /**
   * Executes a random attack on the opponent.
   *
   * Generates a random row and column (0–9) and calls the player's attack
   * method using those coordinates against the provided opponent.
   *
   * @param {object} opponent - The target of the attack.
   * @returns {{ row: number, col: number, playerHit: * }} - The attack coordinates and the result of player.attack().
   */
  randomAttack(opponent) {
    const row = this.getRandomInt(0, 9);
    const col = this.getRandomInt(0, 9);

    const playerHit = this.player.attack(opponent, row, col);
    return { row, col, playerHit };
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
    const gameboard = this.gameboard;
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
      let rX = this.getRandomInt(0, 9);
      let rY = this.getRandomInt(0, 9);
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
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
