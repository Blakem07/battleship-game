export default class Ship {
  constructor(length = 5) {
    this.length = length;
    this.timesHit = 0;
  }

  get length() {
    return this._length;
  }

  set length(value) {
    if (value < 2 || value > 5) {
      throw new Error("Invalid length: must be between 2 and 5.");
    }
    this._length = value;
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
