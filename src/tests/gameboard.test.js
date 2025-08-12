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

// Tests for placeShip method.

test("Gameboard places horizontal ships correctly", () => {
  const gameboard = new Gameboard();

  const row = 1;
  const column = 5;
  const length = 5;

  // Place a ship of length 5 at row 1, column 5, horizontally
  gameboard.placeShip(row, column, length, "carrier");

  let ship = new Ship(length);

  // Assert that the ship has been placed on the correct coordinates
  for (let i = 0; i < length; i++) {
    expect(gameboard.grid[row][column + i]).toStrictEqual(ship);
  }
});

test("Ensure thes ships are placed vertically by checking each grid reference is the same.", () => {
  const gameboard = new Gameboard();

  const row = 0;
  const column = 2;
  const length = 5;

  gameboard.placeShip(row, column, length, "carrier", "vertical");

  const ship = gameboard.grid[row][column];

  for (let i = 0; i < length; i++) {
    expect(gameboard.grid[row + i][column]).not.toBe(null);
    expect(gameboard.grid[row + i][column]).toBe(ship);
  }
});

test("Gameboard throws error if specified postion already has a ship.", () => {
  const gameboard = new Gameboard();

  const column = 0;
  const row = 0;
  const length = 5;

  gameboard.placeShip(row, column, length, "carrier");

  expect(() => {
    gameboard.placeShip(row, column, length, "carrier");
  }).toThrow();
});

test("Gameboard throws error if the specified column and row position is invalid", () => {
  const gameboard = new Gameboard();

  const column = 22;
  const row = 45;
  const length = 5;

  // Expect an error when an invalid position is passed to the method
  expect(() => {
    gameboard.placeShip(row, column, length, "carrier");
  }).toThrow();
});

test("Gameboard throws error if the ship placed does not fit horizontally", () => {
  const gameboard = new Gameboard();

  const column = 9;
  const row = 0;
  const length = 5;

  // Expect an error when placing a ship starting at column 9 on a 10x10 board, as it would go out of bounds
  expect(() => {
    gameboard.placeShip(row, column, length, "carrier");
  }).toThrow();
});

test("Gameboard's placeShip rejects names not from the valid list", () => {
  const column = 0;
  const row = 0;

  const invalidNames = [
    "", // empty string
    "carrier ", // trailing space
    "battleship1", // typo
    "sub-marine", // invalid format
    null,
    undefined,
    123,
    {},
  ];

  invalidNames.forEach((invalidName) => {
    let gameboard = new Gameboard();

    expect(() => {
      gameboard.placeShip(row, column, 5, invalidName);
    }).toThrow();
  });
});

test("Gameboard's placeShip accepts names from the valid list", () => {
  const column = 0;
  const row = 0;

  const validNames = [
    "carrier",
    "battleship",
    "cruiser",
    "submarine",
    "destroyer",
  ];

  validNames.forEach((validName) => {
    let gameboard = new Gameboard();

    expect(() => {
      gameboard.placeShip(row, column, 5, validName);
    }).not.toThrow();
  });
});

test("Gameboard grid indexes succesfully hold references to the new ship object", () => {
  const gameboard = new Gameboard();

  const column = 0;
  const row = 0;
  const length = 5;

  const ship = new Ship(length);

  gameboard.placeShip(row, column, length, "carrier");

  for (let i = column; i < column + length; i++) {
    expect(gameboard.grid[row][i]).toStrictEqual(ship);
  }
});

test("Gameboard's placeShipHorizonal adds ships to a ships dictionary after being placed.", () => {
  const gameboard = new Gameboard();

  gameboard.placeShip(0, 0, 5, "carrier"); // Carrier
  gameboard.placeShip(1, 0, 4, "battleship"); // Battleship
  gameboard.placeShip(2, 0, 3, "cruiser"); // Cruiser
  gameboard.placeShip(3, 0, 3, "submarine"); // Submarine
  gameboard.placeShip(4, 0, 2, "destroyer"); // Destroyer

  expect(gameboard.ships["carrier"].length).toBe(5);
  expect(gameboard.ships["battleship"].length).toBe(4);
  expect(gameboard.ships["cruiser"].length).toBe(3);
  expect(gameboard.ships["submarine"].length).toBe(3);
  expect(gameboard.ships["destroyer"].length).toBe(2);
});

// Tests for ReceiveAttackMethod.

test("Gameboard successfully determines the attack hit a ship.", () => {
  const gameboard = new Gameboard();

  const column = 0;
  const row = 0;
  const length = 5;

  gameboard.placeShip(column, row, length, "carrier");

  expect(gameboard.receiveAttack(column, row)).toBe(true);
});

test("Gameboard records the coordinates of a missed attack its missedAttack property", () => {
  const gameboard = new Gameboard();

  const row = 3;
  const column = 2;

  expect(gameboard.receiveAttack(row, column)).toBe(false);
  expect(gameboard.missedAttacks[`${row},${column}`]).toStrictEqual(true);
});

test("Gameboard checks and prevents repeat attacks in the same cell.", () => {
  const gameboard = new Gameboard();

  const row = 3;
  const column = 2;
  const length = 5;

  gameboard.placeShip(row, column, length, "carrier");
  gameboard.receiveAttack(row, column);

  expect(() => {
    gameboard.receiveAttack(row, column);
  }).toThrow();
});

// Tests for report ship status method.

test("Gameboard's reportShipStatus method returns true when all of their ships have been sunk.", () => {
  const gameboard = new Gameboard();

  const row = 5;
  const column = 4;
  const length = 5;

  gameboard.placeShip(row, column, length, "carrier");

  for (let i = 0; i <= length; i++) {
    gameboard.receiveAttack(row, column + i);
  }

  expect(gameboard.reportShipStatus()).toBe(true);
});

test("Gameboard's reportShipStatus method returns false if no ships are sunk", () => {
  const gameboard = new Gameboard();

  const row = 5;
  const column = 4;
  const length = 5;

  gameboard.placeShip(row, column, length, "carrier");

  expect(gameboard.reportShipStatus()).toBe(false);
});

test("Gameboard's reportShipStatus method returns false if some ships have been sunk.", () => {
  const gameboard = new Gameboard();

  gameboard.placeShip(0, 0, 5, "carrier");
  gameboard.placeShip(1, 0, 4, "battleship");
  gameboard.placeShip(2, 0, 3, "cruiser");

  for (let i = 0; i <= 5; i++) {
    gameboard.receiveAttack(1, 0 + i);
    gameboard.receiveAttack(2, 0 + i);
  }

  expect(gameboard.reportShipStatus()).toBe(false);
});

test("Gameboard's reportShipStatus method throws error if called without ships being placed on the board.", () => {
  const gameboard = new Gameboard();

  expect(() => {
    gameboard.reportShipStatus();
  }).toThrow();
});
