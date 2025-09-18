import Ship from "../classes/Ship";
import Gameboard from "../classes/Gameboard";
import Player from "../classes/Player";
import Computer from "../classes/Computer";
import GameController from "../classes/GameController";

import { validShipPositions } from "../classes/constants.js";

describe("GameController Class Tests", () => {
  let player;
  let computerPlayer;
  let computer;
  let gameController;

  let setupGameSpy;
  let playerReportShipStatusSpy;
  let computerReportShipStatusSpy;
  let playRoundSpy;
  let takeTurnSpy;
  let placePlayerShipsSpy;
  let placeComputerShipsSpy;
  let getDefaultAttackPositionSpy;
  let waitForFiveShipsSpy;

  let uiMock;
  let displayWinnerMock;
  let mockGetPlayerShipPositions;
  let mockGetPlayerAttackPosition;
  let markCellBasedOnHitMock;

  beforeEach(() => {
    player = new Player(new Gameboard());
    computerPlayer = new Player(new Gameboard());
    computer = new Computer(computerPlayer);
    gameController = new GameController(player, computer);

    setupGameSpy = jest.spyOn(gameController, "setupGame");
    playerReportShipStatusSpy = jest.spyOn(
      gameController.player.gameboard,
      "reportShipStatus"
    );
    computerReportShipStatusSpy = jest.spyOn(
      gameController.computer.gameboard,
      "reportShipStatus"
    );
    playRoundSpy = jest.spyOn(gameController, "playRound");
    takeTurnSpy = jest.spyOn(gameController, "takeTurn");
    placePlayerShipsSpy = jest.spyOn(gameController, "placePlayerShips");
    placeComputerShipsSpy = jest.spyOn(gameController, "placeComputerShips");
    getDefaultAttackPositionSpy = jest.spyOn(
      gameController,
      "getDefaultAttackPosition"
    );
    waitForFiveShipsSpy = jest.spyOn(gameController, "waitForFiveShips");

    displayWinnerMock = jest.fn();
    uiMock = { playerShipPositions: [], playerAttackPosition: null };
    mockGetPlayerShipPositions = jest.fn(() => {
      return uiMock.playerShipPositions;
    });
    getValidPlayerShipPositionsMock = jest.fn(() => {
      return validShipPositions;
    });
    mockGetPlayerAttackPosition = jest.fn(() => uiMock.playerAttackPosition);
    markCellBasedOnHitMock = jest.fn();

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  test("GameController is initialized with references to Player and Computer.", () => {
    const mockPlayer = {};
    const mockComputer = {};

    const gameController = new GameController(mockPlayer, mockComputer);

    expect(gameController.player).toBe(mockPlayer);
    expect(gameController.computer).toBe(mockComputer);
  });

  // Tests for waitForFiveShips

  test("GameController.waitForFiveShips waits and returns playerShipPositions once 5 have been recorded.", async () => {
    const waitPromise = gameController.waitForFiveShips(
      mockGetPlayerShipPositions
    );

    for (let i = 0; i < 5; i++) {
      uiMock.playerShipPositions.push({ name: "mockShip" });

      jest.advanceTimersByTime(500); // Fast-forward time by 500ms
      await Promise.resolve(); // Wait for javascript to catch up
    }

    const result = await waitPromise;

    // Check that the result matches the expected final state
    expect(result).toEqual(uiMock.playerShipPositions);
  });

  // waitForPlayerAttack

  test("GameController.waitForPlayerAttack waits and returns playerAttackPosition once the attack is recorded.", async () => {
    const waitPromise = gameController.waitForPlayerAttack(
      mockGetPlayerAttackPosition
    );

    // Simulate player attack input after some "time"
    setTimeout(() => {
      uiMock.playerAttackPosition = { row: 3, col: 5 };
    }, 300);

    // Fast-forward the timers to trigger setInterval checks and the setTimeout above
    jest.advanceTimersByTime(500);

    const result = await waitPromise;

    expect(result).toEqual({ row: 3, col: 5 });
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

  // Tests for playGame

  test("GameController.playGame is passed a getShipPlayerPositions dependency injection and calls setupGame with it.", async () => {
    waitForFiveShipsSpy.mockResolvedValue(validShipPositions);

    playRoundSpy.mockImplementation(() => {
      gameController.gameOver = true; // Prevents infinite loop
      return Promise.resolve(); // Important for async compatibility
    });

    await gameController.playGame(
      getValidPlayerShipPositionsMock,
      mockGetPlayerAttackPosition,
      displayWinnerMock
    );

    expect(setupGameSpy).toHaveBeenCalledTimes(1);
    expect(setupGameSpy).toHaveBeenCalledWith(getValidPlayerShipPositionsMock);
  });

  test("GameController.playGame calls playRound repeatedly until game is over (with dependency injection", async () => {
    waitForFiveShipsSpy.mockResolvedValue(validShipPositions);

    let callCount = 0;
    playRoundSpy.mockImplementation(() => {
      callCount++;
      if (callCount === 5) {
        gameController.gameOver = true;
        return Promise.resolve();
      } // Imitates while loop
    });

    await gameController.playGame(
      getValidPlayerShipPositionsMock,
      mockGetPlayerAttackPosition,
      displayWinnerMock,
      markCellBasedOnHitMock
    );

    expect(playRoundSpy).toHaveBeenCalledWith(
      mockGetPlayerAttackPosition,
      markCellBasedOnHitMock
    );
    expect(playRoundSpy).toHaveBeenCalledTimes(5);
  });

  test("GameController.playGame calls the declare winner dependency injection once the game is over.", async () => {
    waitForFiveShipsSpy.mockResolvedValue(validShipPositions);

    playRoundSpy.mockImplementation(() => {
      gameController.gameOver = true; // Prevents infinite loop
      return Promise.resolve();
    });

    await gameController.playGame(
      getValidPlayerShipPositionsMock,
      mockGetPlayerAttackPosition,
      displayWinnerMock
    );

    expect(setupGameSpy).toHaveBeenCalledTimes(1);
    expect(playRoundSpy).toHaveBeenCalledTimes(1);
    expect(displayWinnerMock).toHaveBeenCalledTimes(1);
    expect(displayWinnerMock).toHaveBeenCalledWith(gameController.winner);
  });

  // Tests for resetGame

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
    waitForFiveShipsSpy.mockResolvedValue(validShipPositions); // Prevents timeout from polling

    const resetGameSpy = jest.spyOn(gameController, "resetGame");
    // Mock placeAllShips to do nothing
    jest.spyOn(gameController, "placeAllShips").mockImplementation(() => {});
    // Pass a dummy function to avoid error calling getPlayerShipPositions()
    const dummyGetPositions = () => [];

    gameController.setupGame(dummyGetPositions);

    expect(resetGameSpy).toHaveBeenCalledTimes(1);
  });

  test("GameController.setupGame calls placeAllShips with playerShipPositions retrieved from dependency injection.", async () => {
    waitForFiveShipsSpy.mockResolvedValue(validShipPositions); // Prevents timeout from polling

    const placeAllShipsSpy = jest
      .spyOn(gameController, "placeAllShips")
      .mockImplementation(() => {});

    await gameController.setupGame(getValidPlayerShipPositionsMock);

    expect(placeAllShipsSpy).toHaveBeenCalledTimes(1);
    expect(placeAllShipsSpy).toHaveBeenCalledWith(validShipPositions);
  });

  // Tests for isGameOver

  test("GameController.isGameOver sets gameOver to true when all of a player's fleet has been sunk.", () => {
    expect(gameController.gameOver).toBe(false);

    computerReportShipStatusSpy.mockReturnValue(true);

    const result = gameController.isGameOver();

    expect(result).toEqual(true);
    expect(playerReportShipStatusSpy).toHaveBeenCalledTimes(1);
    expect(computerReportShipStatusSpy).toHaveBeenCalledTimes(1);
    expect(gameController.gameOver).toBe(true);
  });

  test("GameController.isGameOver correctly assigns the winner to the player.", () => {
    expect(gameController.winner).toEqual(null);

    computerReportShipStatusSpy.mockReturnValueOnce(true); // Computer fleet DESTROYED
    playerReportShipStatusSpy.mockReturnValue(false); // Player fleet OK

    gameController.isGameOver();

    expect(gameController.winner).toEqual("player");
  });

  test("GameController.isGameOver correctly assigns the winner to the computer.", () => {
    expect(gameController.winner).toEqual(null);

    computerReportShipStatusSpy.mockReturnValueOnce(false); // Computer OK
    playerReportShipStatusSpy.mockReturnValue(true); // Player fleet DESTROYED

    gameController.isGameOver();

    expect(gameController.winner).toEqual("computer");
  });

  // Tests for takeTurn

  test("GameController.takeTurn calls player's attack with correct arguments", () => {
    const mockOpponent = gameController.computer;
    const [row, col] = [0, 0];

    const playerAttackSpy = jest.spyOn(gameController.player, "attack");

    gameController.takeTurn({ row: row, col: col });

    expect(playerAttackSpy).toHaveBeenCalledTimes(1);
    expect(playerAttackSpy).toHaveBeenCalledWith(mockOpponent, row, col);
  });

  test("GameController.takeTurn calls computer's randomAttack with correct arguments", () => {
    const mockOpponent = gameController.player;

    const randomAttackSpy = jest.spyOn(gameController.computer, "randomAttack");

    gameController.currentTurn = "computer";
    gameController.takeTurn({ markCellBasedOnHit: markCellBasedOnHitMock });

    expect(randomAttackSpy).toHaveBeenCalledTimes(1);
    expect(randomAttackSpy).toHaveBeenCalledWith(mockOpponent);
  });

  test("GameController.takeTurn alterates current turn.", () => {
    const firstTurn = gameController.currentTurn;
    gameController.takeTurn({ row: 0, col: 0 });
    const secondTurn = gameController.currentTurn;

    expect(firstTurn).toBe("player");
    expect(secondTurn).toBe("computer");
  });

  test("GameController.takeTurn exists before executing attacks when the game is over.", () => {
    const playerAttackSpy = jest.spyOn(gameController.player, "attack");
    gameController.gameOver = true;

    gameController.takeTurn(0, 0);

    expect(playerAttackSpy).not.toHaveBeenCalled();
  });

  // Tests for playRound

  test("GameController.playRound checks if the game is over before and in between player turns", async () => {
    const isGameOverSpy = jest.spyOn(gameController, "isGameOver");

    await gameController.playRound({
      markCellBasedOnHit: markCellBasedOnHitMock,
    });

    expect(isGameOverSpy).toHaveBeenCalledTimes(2);
    expect(takeTurnSpy).toHaveBeenCalledTimes(2);

    expect(isGameOverSpy.mock.invocationCallOrder[0]).toBeLessThan(
      takeTurnSpy.mock.invocationCallOrder[0]
    );
    expect(isGameOverSpy.mock.invocationCallOrder[1]).toBeLessThan(
      takeTurnSpy.mock.invocationCallOrder[1]
    );
  });

  test("GameController.playRound calls takeTurn for the player.", async () => {
    await gameController.playRound({
      markCellBasedOnHit: markCellBasedOnHitMock,
    });

    expect(takeTurnSpy).toHaveBeenCalledTimes(2);
  });

  test("GameController.play round calls takeTurn for the computer.", async () => {
    await gameController.playRound({
      markCellBasedOnHit: markCellBasedOnHitMock,
    });

    expect(takeTurnSpy).toHaveBeenCalledTimes(2);
    expect(takeTurnSpy).toHaveBeenNthCalledWith(2, {
      markCellBasedOnHit: markCellBasedOnHitMock,
    });
  });

  test("GameController.playRound calls getDefaultAttackPosition when no DI is provided", async () => {
    await gameController.playRound({
      markCellBasedOnHit: markCellBasedOnHitMock,
    });

    expect(getDefaultAttackPositionSpy).toHaveBeenCalledTimes(1);
    expect(takeTurnSpy).toHaveBeenCalledTimes(2);
  });

  // Tests for getDefaultAttackPosition

  test("GameController.getDefaultAttackPosition returns a valid default attack position within board boundaries", () => {
    const { row, col } = gameController.getDefaultAttackPosition();

    expect(typeof row).toBe("number");
    expect(typeof col).toBe("number");
    expect(row).toBeGreaterThanOrEqual(0);
    expect(col).toBeGreaterThanOrEqual(0);
    expect(row).toBeLessThan(Gameboard.BOARD_ROWS);
    expect(col).toBeLessThan(Gameboard.BOARD_COLS);
  });
});
