export default class Ship {
  constructor(length = 5) {
    this.length = length;
    this.timesHit = 0;
  }

  hit() {
    this.timesHit += 1;
  }

  isSunk() {
    if (this.timesHit == this.length) {
      return true;
    } else {
      return false;
    }
  }
}
