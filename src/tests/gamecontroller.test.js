import Ship from "../classes/Ship";
import Gameboard from "../classes/Gameboard";
import Player from "../classes/Player";
import Computer from "../classes/Computer";
import GameController from "../classes/GameController";

describe("GameController Class Tests", () => {
  let player;
  let computerPlayer;
  let computer;
  let gameController;
  let validShipPositions;

  beforeEach(() => {
    player = new Player(new Gameboard());
    computerPlayer = new Player(new Gameboard());
    computer = new Computer(computerPlayer);
    gameController = new GameController(player, computer);

    validShipPositions = [
      {
        row: 0,
        col: 0,
        shipName: Ship.VALID_NAMES[0],
        direction: "horizontal",
      },
      {
        row: 2,
        col: 0,
        shipName: Ship.VALID_NAMES[1],
        direction: "vertical",
      },
      {
        row: 5,
        col: 2,
        shipName: Ship.VALID_NAMES[2],
        direction: "horizontal",
      },
      {
        row: 7,
        col: 5,
        shipName: Ship.VALID_NAMES[3],
        direction: "vertical",
      },
      {
        row: 9,
        col: 7,
        shipName: Ship.VALID_NAMES[4],
        direction: "horizontal",
      },
    ];
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("GameController is initialized with references to Player and Computer.", () => {
    const mockPlayer = {};
    const mockComputer = {};

    const gameController = new GameController(mockPlayer, mockComputer);

    expect(gameController.player).toBe(mockPlayer);
    expect(gameController.computer).toBe(mockComputer);
  });

  // Tests for GameController.placePlayerShips

  test("GameController.placePlayerShips calls player.placeShips 5 times with correct args.", () => {
    gameController.player = {
      placeShip: jest.fn().mockReturnValue(true),
    };

    const result = gameController.placePlayerShips(validShipPositions);

    expect(result).toEqual(true);
    expect(gameController.player.placeShip).toHaveBeenCalledTimes(5);

    validShipPositions.forEach((ship, index) => {
      expect(gameController.player.placeShip).toHaveBeenNthCalledWith(
        index + 1,
        ship["row"],
        ship["col"],
        ship["shipName"],
        ship["direction"]
      );
    });
  });

  test("GameController.placePlayerShips returns false on an expected failure.", () => {
    gameController.player = { placeShip: jest.fn() };

    // Failure on second placement
    for (let call = 0; call < Ship.VALID_NAMES.length; call++) {
      const returnValue = call === 1 ? false : true;
      gameController.player.placeShip.mockImplementationOnce(() => returnValue);
    }

    const result = gameController.placePlayerShips(validShipPositions);
    expect(result).toEqual(false);
  });

  test("GameController.placePlayerShips throws error when validShipPositions is invalid or malformed", () => {
    gameController.player = { placeShip: jest.fn() };

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

  // Tests for placeComputerShips

  test("GameController.placeComputerShips calls the correct placement method.", () => {
    Computer.PLACEMENT_METHODS.forEach((method) => {
      const methodName = `placeShips${gameController.capitalize(method)}`;
      jest.spyOn(computer, methodName).mockImplementation(() => {});
    });

    Computer.PLACEMENT_METHODS.forEach((method) => {
      const methodName = `placeShips${gameController.capitalize(method)}`;
      gameController.placeComputerShips(method);

      expect(computer[methodName]).toHaveBeenCalledTimes(1);
    });
  });

  test("GameController.placeComputerShips returns true on success.", () => {
    Computer.PLACEMENT_METHODS.forEach((method) => {
      const methodName = `placeShips${gameController.capitalize(method)}`;
      jest.spyOn(computer, methodName).mockReturnValue(true);
    });

    Computer.PLACEMENT_METHODS.forEach((method) => {
      expect(gameController.placeComputerShips(method)).toEqual(true);
    });
  });

  test("placeComputerShips returns false when placement method fails", () => {
    Computer.PLACEMENT_METHODS.forEach((method) => {
      const methodName = `placeShips${gameController.capitalize(method)}`;
      jest.spyOn(computer, methodName).mockReturnValue(false);
    });

    Computer.PLACEMENT_METHODS.forEach((method) => {
      expect(gameController.placeComputerShips(method)).toBe(false);
    });
  });

  test("GameController.placeComputerShips throws an error when Computer is called with an invalid function.", () => {
    expect(() =>
      gameController.placeComputerShips("notAPlacementMethod")
    ).toThrow(/Invalid method:/);
  });

  // Tests for GameController.placeAllShips
  /***
   * TODO: WORK IN PROGRESS....
   * - Verify placePlayerShips is called with the correct input[x].
   * - Verify placeComputerShips is called with the correct input[]
   * - Write a method in gameboard to return all placed ships.
   *        a. So that we can check that the number of ships place is correct.
   * - Check all positions are within bounds.
   * - Ensure no overlap
   */

  test("GameController.placeAllShips places all Player Ships correctly on the board.", () => {
    const placeShipSpy = jest.spyOn(player, "placeShip");

    gameController.placeAllShips(validShipPositions);

    validShipPositions.forEach((position, index) => {
      // Check if placeShip is called with proper args
      expect(placeShipSpy).toHaveBeenNthCalledWith(
        index + 1,
        ...Object.values(position)
      );

      // Check if ships are placed on board
      const row = position.row;
      const col = position.col;
      const ship = gameController.player.gameboard.getShipAt(row, col);
      const shipName = position.shipName;

      expect(ship.name).toEqual(shipName);
    });

    expect(placeShipSpy).toHaveBeenCalledTimes(validShipPositions.length);

    placeShipSpy.mockRestore();
  });

  test("GameController.placeAllShips places all Computer Ships correctly on the board.", () => {
    const gameboard = computerPlayer.gameboard;
    const placeShipSpy = jest.spyOn(computerPlayer, "placeShip");
    const tryPlaceShipSpy = jest.spyOn(computer, "tryPlaceShip");

    gameController.placeAllShips(validShipPositions);

    // Not fixed due to random placement retry loop
    expect(placeShipSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
    // Fixed as retry loop occurs within here
    expect(tryPlaceShipSpy).toHaveBeenCalledTimes(Ship.VALID_NAMES.length);
    expect(gameboard.ships.length).toBe(Ship.VALID_NAMES.length);

    placeShipSpy.mockRestore();
    tryPlaceShipSpy.mockRestore();
  });
});
