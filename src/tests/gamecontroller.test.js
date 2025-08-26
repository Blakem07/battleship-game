import Ship from "../classes/Ship";
import GameController from "../classes/GameController";

describe("GameController Class Tests", () => {
  test("GameController is initialized with references to Player and Computer.", () => {
    const mockPlayer = {};
    const mockComputer = {};

    const gameController = new GameController(mockPlayer, mockComputer);

    expect(gameController.player).toBe(mockPlayer);
    expect(gameController.computer).toBe(mockComputer);
  });

  // Tests for GameController.placePlayerShips

  test("GameController.placePlayerShips calls player.placeShips 5 times with correct args.", () => {
    const mockPlayer = { placeShip: jest.fn() };
    const mockComputer = {};

    const gameController = new GameController(mockPlayer, mockComputer);

    const shipPositions = [
      {
        row: 0,
        col: 0,
        shipName: Ship.VALID_NAMES[0],
        direction: "horizontal",
      }, // occupies (0,0) to (0,4)
      {
        row: 2,
        col: 0,
        shipName: Ship.VALID_NAMES[1],
        direction: "vertical",
      }, // occupies (2,0) to (5,0)
      {
        row: 5,
        col: 2,
        shipName: Ship.VALID_NAMES[2],
        direction: "horizontal",
      }, // occupies (5,2) to (5,4)
      {
        row: 7,
        col: 5,
        shipName: Ship.VALID_NAMES[3],
        direction: "vertical",
      }, // occupies (7,5) to (9,5)
      {
        row: 9,
        col: 7,
        shipName: Ship.VALID_NAMES[4],
        direction: "horizontal",
      }, // occupies (9,7) to (9,8)
    ];

    gameController.placePlayerShips(shipPositions);

    expect(mockPlayer.placeShip).toHaveBeenCalledTimes(5);

    shipPositions.forEach((ship, index) => {
      expect(mockPlayer.placeShip).toHaveBeenNthCalledWith(index + 1, ship);
    });
  });

  test("GameController.placePlayerShips throws error when shipPositions is invalid or malformed", () => {
    const mockPlayer = { placeShip: jest.fn() };
    const mockComputer = {};

    const gameController = new GameController(mockPlayer, mockComputer);

    const invalidShipPositions = [
      {
        row: 0,
        col: 0,
        shipName: "carrier",
        direction: "horizontal",
      },
      { row: 0, length: 5, shipName: "carrier", direction: "horizontal" },
      {},
      null,
      "Ship Position",
    ];

    expect(() => {
      gameController.placePlayerShips(invalidShipPositions);
    }).toThrow("Error, one of the ship positions has invalid keys");
  });

  // Tests for GameController.placeAllShips

  test("GameController.placeAllShips places all Player and Computer Ships correctly on the board.", () => {
    /***
     * TODO: WORK IN PROGRESS....
     * - Verify placePlayerShips is called with the correct input[x].
     * - Verify placeComputerShips is called with the correct input[x]
     * - Write a method in gameboard to return all placed ships.
     *        a. So that we can check that the number of ships place is correct.
     * - Check all positions are within bounds.
     * - Ensure no overlap
     */
    const gameController = new GameController();
    const shipPositions = [
      {
        row: 0,
        col: 0,
        shipName: "carrier",
        direction: "horizontal",
      }, // occupies (0,0) to (0,4)
      {
        row: 2,
        col: 0,
        shipName: "battleship",
        direction: "vertical",
      }, // occupies (2,0) to (5,0)
      {
        row: 5,
        col: 2,
        shipName: "destroyer",
        direction: "horizontal",
      }, // occupies (5,2) to (5,4)
      {
        row: 7,
        col: 5,
        shipName: "submarine",
        direction: "vertical",
      }, // occupies (7,5) to (9,5)
      {
        row: 9,
        col: 7,
        shipName: "patrol",
        direction: "horizontal",
      }, // occupies (9,7) to (9,8)
    ];
    const placePlayerShipsSpy = jest.spyOn(gameController, "placePlayerShips");
    const placeShipsRandomlySpy = jest.spyOn(
      gameController.computer,
      "placeShipsRandomly"
    ); // Computer

    gameController.placeAllShips(shipPositions);

    shipPositions.forEach((position, index) => {
      expect(placePlayerShipsSpy).toHaveBeenNthCalledWith(index + 1, position);
    });
    expect(placeShipsRandomlySpy).toHaveBeenCalledTimes(1);
  });
});
