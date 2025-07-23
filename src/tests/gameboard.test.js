import Gameboard from "../classes/Gameboard";

test("Gameboard initializes with correct dimensions", () => {
  const gameboard = new Gameboard(); // assumes board is created in the constructor

  // Check number of rows
  expect(gameboard.grid.length).toBe(Gameboard.BOARD_ROWS);

  // Check number of columns in each row
  for (let row of gameboard.grid) {
    expect(row.length).toBe(Gameboard.BOARD_COLS);
  }
});

test("Gameboard places hoizontal ships correctly", () => {
  const gameboard = new Gameboard();

  const column = 5;
  const row = 1;
  const length = 5;

  // Place a ship of length 5 at row 1, column 5, horizontally
  gameboard.placeShipHorizontal(column, row, length);

  // Assert that the ship has been placed on the correct coordinates
  for (let i = 0; i < length; i++) {
    expect(gameboard.grid[row][column + i]).toBe("S");
  }
});
