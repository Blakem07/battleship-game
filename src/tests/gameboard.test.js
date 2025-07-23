import Gameboard from "../classes/Gameboard";

test("Gameboard initializes with correct dimensions", () => {
  const gameboard = new Gameboard(); // assumes board is created in the constructor

  // Check number of rows
  expect(gameboard.board.length).toBe(Gameboard.BOARD_ROWS);

  // Check number of columns in each row
  for (let row of gameboard.board) {
    expect(row.length).toBe(Gameboard.BOARD_COLS);
  }
});
