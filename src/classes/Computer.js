export default class Computer {
  constructor(player) {
    this.player = player;
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
