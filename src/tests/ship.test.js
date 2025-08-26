import Ship from "../classes/Ship";

describe("Ship Class Tests", () => {
  test("Ship Class initialization fails with invalid length", () => {
    const invalidLengths = [1, 0, 6, 10, -3];
    invalidLengths.forEach((length) => {
      expect(() => new Ship(length)).toThrow();
    });
  });

  test("Ship Class intializes with valid name and lengths", () => {
    const validNames = [
      "carrier",
      "battleship",
      "cruiser",
      "submarine",
      "destroyer",
    ];

    const validLengths = {
      carrier: 5,
      battleship: 4,
      cruiser: 3,
      submarine: 3,
      destroyer: 2,
    };

    validNames.forEach((name) => {
      let ship = new Ship(name);
      expect(ship.name).toBe(name);
      expect(ship.length).toBe(validLengths[name]);
    });
  });

  test("Ship Class gets hit, incrementing timesHit by 1", () => {
    const ship = new Ship(Ship.VALID_NAMES[0]);
    const initialTimesHit = ship.timesHit;
    ship.hit();
    expect(ship.timesHit).toBe(initialTimesHit + 1);
  });

  test("Ship Class has sunk if, times hit == length", () => {
    const ship = new Ship(Ship.VALID_NAMES[0]);
    for (let i = 0; i < ship.length; i++) {
      ship.hit();
    }
    expect(ship.isSunk()).toBe(true);
  });

  test("Ship Class is not sunk if, times hit < length", () => {
    const ship = new Ship(Ship.VALID_NAMES[0]);
    expect(ship.isSunk()).toBe(false);
  });

  // Tests for ship.clone

  test("Ship.clone returns an object deep equal to the original.", () => {
    const ship = new Ship(Ship.VALID_NAMES[0]);
    const clone = ship.clone();

    expect(clone).toEqual(ship);
  });

  test("Ship.clone returns a ship of a different instance, so mutating does not affect origial.", () => {
    const ship = new Ship(Ship.VALID_NAMES[0]);
    const clone = ship.clone();

    expect(clone).not.toBe(ship);
  });

  test("Ship.clone mutating the clone does not affect the original.", () => {
    const ship = new Ship(Ship.VALID_NAMES[0]);
    const clone = ship.clone();

    clone.hit(); // if accessible or use setter/method
    expect(clone.timesHit).toBe(1);
    expect(ship.timesHit).not.toBe(1);
  });
});
