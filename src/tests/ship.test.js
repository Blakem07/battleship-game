import Ship from "../classes/Ship";

test("Ship initialization fails with invalid length", () => {
  const invalidLengths = [1, 0, 6, 10, -3];
  invalidLengths.forEach((length) => {
    expect(() => new Ship(length)).toThrow();
  });
});

test("Ship gets hit, incrementing timesHit by 1", () => {
  const ship = new Ship();
  const initialTimesHit = ship.timesHit;
  ship.hit();
  expect(ship.timesHit).toBe(initialTimesHit + 1);
});

test("Ship has sunk if, times hit == length", () => {
  const ship = new Ship();
  ship.timesHit = ship.length;
  expect(ship.isSunk()).toBe(true);
});

test("Ship is not sunk if, times hit < length", () => {
  const ship = new Ship();
  ship.timesHit = ship.length - 1;
  expect(ship.isSunk()).toBe(false);
});
