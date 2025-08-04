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

// Tests for PlaceShipHorizontal method.

test("Gameboard places hoizontal ships correctly", () => {
  const gameboard = new Gameboard();

  const column = 5;
  const row = 1;
  const length = 5;

  // Place a ship of length 5 at row 1, column 5, horizontally
  gameboard.placeShipHorizontal(column, row, length);

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

  gameboard.placeShipHorizontal(column, row, length);

  expect(() => {
    gameboard.placeShipHorizontal(column, row, length);
  }).toThrow();
});

test("Gameboard throws error if the specified column and row position is invalid", () => {
  const gameboard = new Gameboard();

  const column = 22;
  const row = 45;
  const length = 5;

  // Expect an error when an invalid position is passed to the method
  expect(() => {
    gameboard.placeShipHorizontal(column, row, length);
  }).toThrow();
});

test("Gameboard throws error if the ship placed does not fit horizontally", () => {
  const gameboard = new Gameboard();

  const column = 9;
  const row = 0;
  const length = 5;

  // Expect an error when placing a ship starting at column 9 on a 10x10 board, as it would go out of bounds
  expect(() => {
    gameboard.placeShipHorizontal(column, row, length);
  }).toThrow();
});

test("Gameboard grid indexes succesfully hold references to the new ship object", () => {
  const gameboard = new Gameboard();

  const column = 0;
  const row = 0;
  const length = 5;

  const ship = new Ship(length);

  gameboard.placeShipHorizontal(column, row, length);

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

  expect(gameboard.recieveAttack(column, row, length)).toBe(true);
});
