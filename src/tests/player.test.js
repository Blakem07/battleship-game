import Player from "../classes/Player";
import Gameboard from "../classes/Gameboard";
import Ship from "../classes/Ship";

describe("Player Class Tests", () => {
  test("Player Class initializes with a reference to their gameboard.", () => {
    const gameboard = new Gameboard();
    const player = new Player(gameboard);

    expect(player.gameboard).toBe(gameboard);
  });

  // Tests for attack method

  test("Player.attack method calls the opponents gameboard.receive attack with the correct args.", () => {
    const mockGameboard = {};
    const player = new Player(mockGameboard);

    const opponentMockGameboard = { receiveAttack: jest.fn() };
    const opponent = new Player(opponentMockGameboard);

    player.attack(opponent, 1, 1);

    expect(opponentMockGameboard.receiveAttack).toBeCalledWith(1, 1);
  });

  // Tests for placeShip method

  test("Player.placeShip method calls gameboard.placeShip with the correct args.", () => {
    const mockGameboard = { placeShip: jest.fn() };
    const player = new Player(mockGameboard);

    player.placeShip(0, 0, Ship.VALID_NAMES[0], "vertical");

    expect(mockGameboard.placeShip).toBeCalledWith(
      0,
      0,
      Ship.VALID_NAMES[0],
      "vertical"
    );
  });
});
