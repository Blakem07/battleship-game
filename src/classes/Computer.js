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
