export default class Player {
  constructor(gameboard) {
    this.gameboard = gameboard;
  }

  attack(opponent, row, column) {
    return opponent.gameboard.receiveAttack(row, column);
  }
}
