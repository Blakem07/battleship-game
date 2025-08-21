export default class Ship {
  static VALID_NAMES = [
    "carrier",
    "battleship",
    "cruiser",
    "submarine",
    "destroyer",
  ];

  static VALID_LENGTHS = {
    carrier: 5,
    battleship: 4,
    cruiser: 3,
    submarine: 3,
    destroyer: 2,
  };

  #timesHit = 0;

  constructor(name) {
    this.name = name;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    const lowerCaseValue = value.toLowerCase();

    if (!Ship.VALID_NAMES.includes(lowerCaseValue)) {
      throw new Error("Error the ship name is invalid.");
    }

    this._name = lowerCaseValue;
    this._length = Ship.VALID_LENGTHS[lowerCaseValue];
  }

  get length() {
    return this._length;
  }

  get timesHit() {
    return this.#timesHit;
  }

  hit() {
    this.#timesHit++;
  }

  isSunk() {
    if (this.timesHit == this.length) {
      return true;
    } else {
      return false;
    }
  }
}
