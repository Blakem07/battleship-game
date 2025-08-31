import Gameboard from "../classes/Gameboard";
import Ship from "../classes/Ship";

describe("Gameboard Class Tests", () => {
  test("Gameboard initializes with correct dimensions", () => {
    const gameboard = new Gameboard(); // assumes board is created in the constructor
    const grid = gameboard.getGrid();

    // Check number of rows
    expect(grid.length).toBe(Gameboard.BOARD_ROWS);

    // Check number of columns in each row
    for (let row of grid) {
      expect(row.length).toBe(Gameboard.BOARD_COLS);
    }
  });

  // Tests for ResetBoard

  test("Gameboard.resetBoard resets the gameboards properties to their default values.", () => {
    const gameboard = new Gameboard();
    const gridBeforeMutation = gameboard.getGrid();

    gameboard.placeShip(0, 0, Ship.VALID_NAMES[0]); // Placed Ship
    gameboard.receiveAttack(0, 0); // Landed attack
    gameboard.receiveAttack(9, 9); // Missed attack

    expect(gameboard.getGrid()).not.toEqual(gridBeforeMutation);
    expect(gameboard.getMissedAttacks()).not.toEqual({});
    expect(gameboard.getLandedAttacks()).not.toEqual({});
    expect(gameboard.getShips()).not.toEqual({});

    gameboard.resetBoard();

    expect(gameboard.getGrid()).toEqual(gridBeforeMutation);
    expect(gameboard.getMissedAttacks()).toEqual({});
    expect(gameboard.getLandedAttacks()).toEqual({});
    expect(gameboard.getShips()).toEqual({});
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

  test("Gameboard.placeShip places horizontal ships correctly", () => {
    const gameboard = new Gameboard(Ship.VALID_NAMES[0]);

    const row = 1;
    const column = 5;
    const length = Ship.VALID_LENGTHS[Ship.VALID_NAMES[0]];

    // Place a ship of length 5 at row 1, column 5, horizontally
    gameboard.placeShip(row, column, Ship.VALID_NAMES[0], "horizontal");

    const grid = gameboard.getGrid();
    let ship = grid[1][5];

    // Traverse though the grid using the length of the ship, asserting that each ref is the same
    for (let i = 0; i < length; i++) {
      expect(grid[row][column + i]).toStrictEqual(ship);
    }
  });

  test("Gameboard.placeShip throws error if the specified column and row position is invalid", () => {
    const gameboard = new Gameboard();

    const column = 22;
    const row = 45;
    const length = 5;

    // Expect an error when an invalid position is passed to the method
    expect(() => {
      gameboard.placeShip(row, column, length, "carrier");
    }).toThrow();
  });

  test("Gameboard.placeShip throws an error when passed an invalid direction.", () => {
    const gameboard = new Gameboard();

    expect(() => {
      gameboard.placeShip(0, 0, 5, "carrier", "Sideways");
    }).toThrow("Error an invalid direction has been passed to placeShip");
  });

  test("Ensure the ships are placed vertically by checking each grid reference is the same.", () => {
    const gameboard = new Gameboard();

    const row = 0;
    const column = 2;
    const length = Ship.VALID_LENGTHS[Ship.VALID_NAMES[0]];

    gameboard.placeShip(row, column, Ship.VALID_NAMES[0], "vertical");

    const grid = gameboard.getGrid();

    const ship = grid[row][column];

    for (let i = 0; i < length; i++) {
      expect(grid[row + i][column]).not.toBe(null);
      expect(grid[row + i][column]).toStrictEqual(ship);
    }
  });

  test("Gameboard.placeShip throws error if specified postion already has a ship.", () => {
    const gameboard = new Gameboard();

    const column = 0;
    const row = 0;

    gameboard.placeShip(row, column, Ship.VALID_NAMES[0]);

    expect(() => {
      gameboard.placeShip(row, column, length, Ship.VALID_NAMES[0]);
    }).toThrow();
  });

  test("Gameboard.placeShip throws error if the ship placed does not fit horizontally", () => {
    const gameboard = new Gameboard();

    const column = 9;
    const row = 0;
    const length = 5;

    // Expect an error when placing a ship starting at column 9 on a 10x10 board, as it would go out of bounds
    expect(() => {
      gameboard.placeShip(row, column, length, "carrier");
    }).toThrow();
  });

  test("Gameboard.placeShip rejects names not from the valid list", () => {
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

  test("Gameboard.placeShip ensures grid indexes hold references to new ship object", () => {
    const gameboard = new Gameboard();

    const column = 0;
    const row = 0;
    const length = Ship.VALID_LENGTHS[Ship.VALID_NAMES];

    gameboard.placeShip(row, column, Ship.VALID_NAMES[0]);

    const grid = gameboard.getGrid();
    const ship = grid[row][column];

    for (let i = column; i < column + length; i++) {
      expect(grid[row][i]).toStrictEqual(ship);
    }
  });

  test("Gameboard.placeShip adds ships to a ships dictionary", () => {
    const gameboard = new Gameboard();

    gameboard.placeShip(0, 0, Ship.VALID_NAMES[0], "horizontal"); // Carrier
    gameboard.placeShip(1, 0, Ship.VALID_NAMES[1], "horizontal"); // Battleship
    gameboard.placeShip(2, 0, Ship.VALID_NAMES[2], "horizontal"); // Cruiser
    gameboard.placeShip(3, 0, Ship.VALID_NAMES[3], "horizontal"); // Submarine
    gameboard.placeShip(4, 0, Ship.VALID_NAMES[4], "horizontal"); // Destroyer

    const ships = gameboard.getShips();

    expect(ships[0].length).toBe(5);
    expect(ships[1].length).toBe(4);
    expect(ships[2].length).toBe(3);
    expect(ships[3].length).toBe(3);
    expect(ships[4].length).toBe(2);
  });

  // Tests for ReceiveAttackMethod.

  test("Gameboard.recieveAttack successfully determines the attack hit a ship.", () => {
    const gameboard = new Gameboard();

    const column = 0;
    const row = 0;

    gameboard.placeShip(column, row, Ship.VALID_NAMES[0]);

    expect(gameboard.receiveAttack(column, row)).toBe(true);
  });

  test("Gameboard.recieveAttack records the coordinates of a missed attack its missedAttack property", () => {
    const gameboard = new Gameboard();
    const row = 3;
    const column = 2;
    expect(gameboard.receiveAttack(row, column)).toBe(false);

    const missedAttacks = gameboard.getMissedAttacks();
    expect(missedAttacks[`${row},${column}`]).toStrictEqual(true);
  });

  test("Gameboard.recieveAttack checks prevents repeat attacks in same cell", () => {
    const gameboard = new Gameboard();

    const row = 3;
    const column = 2;

    gameboard.placeShip(row, column, Ship.VALID_NAMES[0]);
    gameboard.receiveAttack(row, column);

    expect(() => {
      gameboard.receiveAttack(row, column);
    }).toThrow();
  });

  // Tests for report ship status method.

  test("Gameboard.reportShipStatus method returns true when all of their ships have been sunk.", () => {
    const gameboard = new Gameboard();

    const row = 5;
    const column = 4;
    const length = Ship.VALID_LENGTHS[Ship.VALID_NAMES[0]];

    gameboard.placeShip(row, column, Ship.VALID_NAMES[0]);

    for (let i = 0; i <= length; i++) {
      gameboard.receiveAttack(row, column + i);
    }

    expect(gameboard.reportShipStatus()).toBe(true);
  });

  test("Gameboard.reportShipStatus method returns false if no ships are sunk", () => {
    const gameboard = new Gameboard();

    const row = 5;
    const column = 4;

    gameboard.placeShip(row, column, Ship.VALID_NAMES[0]);

    expect(gameboard.reportShipStatus()).toBe(false);
  });

  test("Gameboard.reportShipStatus method returns false if some ships have been sunk.", () => {
    const gameboard = new Gameboard();

    gameboard.placeShip(0, 0, Ship.VALID_NAMES[0]);
    gameboard.placeShip(1, 0, Ship.VALID_NAMES[1]);
    gameboard.placeShip(2, 0, Ship.VALID_NAMES[2]);

    for (let i = 0; i <= 5; i++) {
      gameboard.receiveAttack(1, 0 + i);
      gameboard.receiveAttack(2, 0 + i);
    }

    expect(gameboard.reportShipStatus()).toBe(false);
  });

  test("Gameboard.reportShipStatus method throws error if called without ships being placed on the board.", () => {
    const gameboard = new Gameboard();

    expect(() => {
      gameboard.reportShipStatus();
    }).toThrow();
  });

  // Tests for get grid

  test("Gameboard.getGrid returns deep clone of grid which cannot mutate the original.", () => {
    const gameboard = new Gameboard();

    let initialGrid = gameboard.getGrid();
    initialGrid[0][0] = "changed";

    const updatedGrid = gameboard.getGrid();
    expect(updatedGrid[0][0]).toBe(null);
  });
});

test("Gameboard.getGrid returns the correct structure of the 10x10 grid.", () => {
  const gameboard = new Gameboard();

  let clonedGrid = gameboard.getGrid();

  for (const row of clonedGrid) {
    expect(row.length).toBe(10);
    for (const col of row) {
      expect(col === null || typeof col === "object").toBe(true);
    }
  }
});

test("Gameboard.getGrid reflects the current state of the grid.", () => {
  const gameboard = new Gameboard();
  gameboard.placeShip(0, 0, Ship.VALID_NAMES[0], "horizontal");
  const clonedGrid = gameboard.getGrid();

  expect(typeof clonedGrid[0][0]).toBe("object");
});

// Tests for get ships

test("Gameboard.getShips returns an array of cloned ships.", () => {
  const gameboard = new Gameboard();

  gameboard.placeShip(0, 0, Ship.VALID_NAMES[0], "horizontal");
  gameboard.placeShip(1, 0, Ship.VALID_NAMES[1], "horizontal");
  gameboard.placeShip(2, 0, Ship.VALID_NAMES[2], "horizontal");
  gameboard.placeShip(3, 0, Ship.VALID_NAMES[3], "horizontal");
  gameboard.placeShip(4, 0, Ship.VALID_NAMES[4], "horizontal");

  const ships = gameboard.getShips();

  // Check array shape
  expect(Array.isArray(ships)).toBe(true);
  expect(ships.length).toBe(5);

  // Test public interface
  expect(ships[0].timesHit).toBe(0);
  ships[0].hit();
  expect(ships[0].timesHit).toBe(1);
});

test("Gameboard.getShips returns an empty array when no ships have been placed.", () => {
  const gameboard = new Gameboard();
  const ships = gameboard.getShips();

  expect(ships).toEqual([]);
});

// Tests for GetMissedAttacks

test("Gameboard.getMissed attacks returns a deep clone of #missedAttacks.", () => {
  const gameboard = new Gameboard();
  gameboard.receiveAttack(1, 1);

  const missedAttacks = gameboard.getMissedAttacks();
  expect(missedAttacks["1,1"]).toEqual(true);

  // Checks Shape
  expect(Array.isArray(missedAttacks)).toBe(false);
  expect(typeof missedAttacks).toBe("object");
  expect(missedAttacks).not.toBeNull();
  expect(Object.keys(missedAttacks).length).toEqual(1);

  // Checks immutability of gameboard.#missedAttacks
  delete missedAttacks["1,1"];
  const mutatedMissedAttacks = gameboard.getMissedAttacks();
  expect(mutatedMissedAttacks["1,1"]).toEqual(true);
});

test("Gameboard.getMissed attacks return an empty dictionary when no attacks have been missed", () => {
  const gameboard = new Gameboard();
  const missedAttacks = gameboard.getMissedAttacks();
  expect(missedAttacks).toEqual({});
});

// Tests for GetShipAt

test("Gameboard.getShipAt returns a reference to the ship object.", () => {
  const gameboard = new Gameboard();
  gameboard.placeShip(0, 0, Ship.VALID_NAMES[0], "horizontal");

  const ship = gameboard.getShipAt(0, 0);

  // Check shape
  expect(typeof ship).toBe("object");
  expect(ship.name).toBe(Ship.VALID_NAMES[0]);

  // Check mutation
  expect(ship.timesHit).toBe(0);
  ship.hit();
  const mutatedShip = gameboard.getShipAt(0, 0);
  expect(mutatedShip.timesHit).toBe(1);
});

test("Gameboard.getShipAt returns null when there is no ship at the index", () => {
  const gameboard = new Gameboard();
  const ship = gameboard.getShipAt(0, 0);

  expect(ship).toEqual(null);
});
