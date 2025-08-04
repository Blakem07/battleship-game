import Gameboard from "../classes/Gameboard";
import Ship from "../classes/Ship";

test("Gameboard initializes with correct dimensions", () => {
  const gameboard = new Gameboard(); // assumes board is created in the constructor

  // Check number of rows
  expect(gameboard.grid.length).toBe(Gameboard.BOARD_ROWS);

  // Check number of columns in each row
  for (let row of gameboard.grid) {
    expect(row.length).toBe(Gameboard.BOARD_COLS);
  }
});

// Tests for isValidCoordinate

test("Valid coordinates inside grid", () => {
  const gameboard = new Gameboard();

  expect(gameboard.isValidCoordinate(0, 0)).toBe(true);
  expect(gameboard.isValidCoordinate(1, 1)).toBe(true);
});

test("Invalid coordinates", () => {
  const gameboard = new Gameboard();

  expect(gameboard.isValidCoordinate(100, 100)).toBe(false);
  expect(gameboard.isValidCoordinate(20, 20)).toBe(false);
});

test("invalid coordinates: wrong types", () => {
  const gameboard = new Gameboard();

  expect(gameboard.isValidCoordinate("1", 0)).toBe(false);
  expect(gameboard.isValidCoordinate(null, 0)).toBe(false);
  expect(gameboard.isValidCoordinate(undefined, 0)).toBe(false);
  expect(gameboard.isValidCoordinate(NaN, 1)).toBe(false);
});

// Tests for PlaceShipHorizontal method.

test("Gameboard places hoizontal ships correctly", () => {
  const gameboard = new Gameboard();

  const row = 1;
  const column = 5;

  const length = 5;

  // Place a ship of length 5 at row 1, column 5, horizontally
  gameboard.placeShipHorizontal(row, column, length);

  let ship = new Ship(length);

  // Assert that the ship has been placed on the correct coordinates
  for (let i = 0; i < length; i++) {
    expect(gameboard.grid[row][column + i]).toStrictEqual(ship);
  }
});

test("Gameboard throws error if specified postion already has a ship.", () => {
  const gameboard = new Gameboard();

  const column = 0;
  const row = 0;
  const length = 5;

  gameboard.placeShipHorizontal(row, column, length);

  expect(() => {
    gameboard.placeShipHorizontal(row, column, length);
  }).toThrow();
});

test("Gameboard throws error if the specified column and row position is invalid", () => {
  const gameboard = new Gameboard();

  const column = 22;
  const row = 45;
  const length = 5;

  // Expect an error when an invalid position is passed to the method
  expect(() => {
    gameboard.placeShipHorizontal(row, column, length);
  }).toThrow();
});

test("Gameboard throws error if the ship placed does not fit horizontally", () => {
  const gameboard = new Gameboard();

  const column = 9;
  const row = 0;
  const length = 5;

  // Expect an error when placing a ship starting at column 9 on a 10x10 board, as it would go out of bounds
  expect(() => {
    gameboard.placeShipHorizontal(row, column, length);
  }).toThrow();
});

test("Gameboard grid indexes succesfully hold references to the new ship object", () => {
  const gameboard = new Gameboard();

  const column = 0;
  const row = 0;
  const length = 5;

  const ship = new Ship(length);

  gameboard.placeShipHorizontal(row, column, length);

  for (let i = column; i < column + length; i++) {
    expect(gameboard.grid[row][i]).toStrictEqual(ship);
  }
});

// Tests for RecieveAttackMethod.

test("Gameboard successfully determines the attack hit a ship.", () => {
  const gameboard = new Gameboard();

  const column = 0;
  const row = 0;
  const length = 5;

  gameboard.placeShipHorizontal(column, row, length);

  expect(gameboard.recieveAttack(column, row)).toBe(true);
});

test("Gameboard records the coordinates of a missed attack its missedAttack property", () => {
  const gameboard = new Gameboard();

  const row = 3;
  const column = 2;

  expect(gameboard.recieveAttack(row, column)).toBe(false);
  expect(gameboard.missedAttacks[`${row},${column}`]).toStrictEqual(true);
});

test("Gameboard checks and prevents repeat attacks in the same cell.", () => {
  const gameboard = new Gameboard();

  const row = 3;
  const column = 2;
  const length = 5;

  gameboard.placeShipHorizontal(row, column, length);
  gameboard.recieveAttack(row, column);

  expect(() => {
    gameboard.recieveAttack(row, column);
  }).toThrow();
});
