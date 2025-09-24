/**
 * Represents a player in the Battleship game.
 *
 * Encapsulates a gameboard and provides methods to:
 * - Attack an opponent's gameboard.
 * - Place ships on the player's own gameboard.
 *
 * This class acts as an interface between the game controller and the underlying gameboard,
 * abstracting gameboard operations behind player actions.
 */
export default class Player {
  constructor(gameboard) {
    this.gameboard = gameboard;
  }

  /**
   * Attack method.
   *
   * Executes an attack on the opponent's gameboard at the given coordinates.
   * This is a wrapper that delegates the attack to the opponent's gameboard,
   * allowing the controller to interact through the Player interface.
   *
   * @param {Player} opponent - The opposing player being attacked
   * @param {number} row - The row coordinate of the attack
   * @param {number} column - The column coordinate of the attack
   * @returns {*} Result from the opponent's gameboard.receiveAttack method
   */
  attack(opponent, row, column) {
    return opponent.gameboard.receiveAttack(row, column);
  }

  /**
   * PlaceShip method.
   *
   * Places a ship on the player's gameboard.
   * This is a wrapper method to delegate ship placement to the underlying gameboard.
   * Used during game setup to encapsulate gameboard access within the Player interface.
   *
   * @param {number} row - Starting row for the ship
   * @param {number} column - Starting column for the ship
   * @param {string} shipName - Identifier for the ship type
   * @param {string} direction - 'horizontal' or 'vertical'
   * @returns {*} Result from the gameboard's placeShip method
   */
  placeShip(row, column, shipName, direction) {
    return this.gameboard.placeShip(row, column, shipName, direction);
  }
}
