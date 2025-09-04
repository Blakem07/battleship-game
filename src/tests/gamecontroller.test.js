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

  let placePlayerShipsSpy;
  let placeComputerShipsSpy;

  beforeEach(() => {
    player = new Player(new Gameboard());
    computerPlayer = new Player(new Gameboard());
    computer = new Computer(computerPlayer);
    gameController = new GameController(player, computer);

    placePlayerShipsSpy = jest.spyOn(gameController, "placePlayerShips");
    placeComputerShipsSpy = jest.spyOn(gameController, "placeComputerShips");

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

  test("GameController.placeAllShips returns true on success.", () => {
    placePlayerShipsSpy.mockReturnValue(true);
    placeComputerShipsSpy.mockReturnValue(true);

    expect(gameController.placeAllShips()).toEqual(true);
  });

  test("GameController.placeAllShips returns false on failure.", () => {
    placePlayerShipsSpy.mockReturnValueOnce(true);
    placeComputerShipsSpy.mockReturnValueOnce(false);

    expect(gameController.placeAllShips()).toEqual(false);

    placePlayerShipsSpy.mockReturnValueOnce(false);
    placeComputerShipsSpy.mockReturnValueOnce(false);

    expect(gameController.placeAllShips()).toEqual(false);
  });

  // Tests for resetBoard

  test("GameController.resetGame resets current turn, gameover, winner and also calls reset board for both boards.", () => {
    const computerResetBoardSpy = jest.spyOn(
      gameController.computer.gameboard,
      "resetBoard"
    );
    const playerResetBoardSpy = jest.spyOn(
      gameController.player.gameboard,
      "resetBoard"
    );

    gameController.currentTurn = "computer";
    gameController.gameOver = true;
    gameController.winner = "player";

    gameController.resetGame();

    // GameController Props
    expect(gameController.currentTurn).toEqual("player");
    expect(gameController.gameOver).toBe(false);
    expect(gameController.winner).toEqual(null);

    // Gameboard Props
    expect(computerResetBoardSpy).toHaveBeenCalledTimes(1);
    expect(playerResetBoardSpy).toHaveBeenCalledTimes(1);
  });

  // Tests for setup.
  test("GameController.setupGame resets game state variables by calling resetGame.", () => {
    const resetGameSpy = jest.spyOn(gameController, "resetGame");
    // Mock placeAllShips to do nothing
    jest.spyOn(gameController, "placeAllShips").mockImplementation(() => {});
    // Pass a dummy function to avoid error calling getPlayerShipPositions()
    const dummyGetPositions = () => [];

    gameController.setupGame(dummyGetPositions);

    expect(resetGameSpy).toHaveBeenCalledTimes(1);
  });

  test("GameController.setupGame calls placeAllShips with playerShipPositions retrieved from dependency injection.", () => {
    const placeAllShipsSpy = jest
      .spyOn(gameController, "placeAllShips")
      .mockImplementation(() => {});
    const mockPlayerShipPositions = { some: "positions" };
    const mockGetPlayerShipPositions = jest.fn(() => mockPlayerShipPositions);

    gameController.setupGame(mockGetPlayerShipPositions);

    expect(placeAllShipsSpy).toHaveBeenCalledTimes(1);
    expect(placeAllShipsSpy).toHaveBeenCalledWith(mockPlayerShipPositions);
  });

  // Tests for takeTurn

  test("GameController.takeTurn calls player's attack with correct arguments", () => {
    const mockOpponent = gameController.computer;
    const [row, col] = [0, 0];

    const playerAttackSpy = jest.spyOn(gameController.player, "attack");

    gameController.takeTurn(row, col);

    expect(playerAttackSpy).toHaveBeenCalledTimes(1);
    expect(playerAttackSpy).toHaveBeenCalledWith(mockOpponent, row, col);
  });

  test("GameController.takeTurn calls computer's randomAttack with correct arguments", () => {
    const mockOpponent = gameController.player;

    const randomAttackSpy = jest.spyOn(gameController.computer, "randomAttack");

    gameController.currentTurn = "computer";
    gameController.takeTurn();

    expect(randomAttackSpy).toHaveBeenCalledTimes(1);
    expect(randomAttackSpy).toHaveBeenCalledWith(mockOpponent);
  });

  // Tests for playRound

  test("GameController.playRound calls takeTurn for the player.", () => {
    const mockPlayerAttackPosition = [0, 1];
    const mockGetPlayerAttackPosition = jest.fn(() => mockPlayerAttackPosition);

    const takeTurnSpy = jest
      .spyOn(gameController, "takeTurn")
      .mockImplementation(() => {});

    gameController.playRound(mockGetPlayerAttackPosition);

    expect(mockGetPlayerAttackPosition).toHaveBeenCalledTimes(1); // Dependency injection, passing player attack position
    expect(takeTurnSpy).toHaveBeenCalledTimes(1);
    expect(takeTurnSpy).toHaveBeenCalledWith(
      gameController.computer, // Opponent
      mockPlayerAttackPosition[0], // Row
      mockPlayerAttackPosition[1] // Col
    );
  });
});
