import Ship from "../classes/Ship";
import Computer from "../classes/Computer";

describe("Computer Class Tests", () => {
  test("Computer is initialized with a Player and exposes its gameboard by reference", () => {
    const mockGameboard = {};
    const mockPlayer = { gameboard: mockGameboard };
    const computer = new Computer(mockPlayer);

    expect(computer.player).toBe(mockPlayer);
    expect(computer.gameboard).toBe(mockGameboard);
  });

  // Tests for attack method

  test("Computer.randomAttack method calls player.attack with and returns its results.", () => {
    const mockPlayer = { attack: jest.fn().mockReturnValue("attack result") };
    const computer = new Computer(mockPlayer);
    const mockOpponent = {};

    jest
      .spyOn(computer, "getRandomInt")
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(7);

    const result = computer.randomAttack(mockOpponent);

    expect(computer.getRandomInt).toHaveBeenCalledTimes(2);
    expect(computer.getRandomInt).toHaveBeenCalledWith(0, 9);
    expect(computer.player.attack).toHaveBeenCalledWith(mockOpponent, 3, 7);
    expect(result).toBe("attack result");
  });

  // Tests for tryPlaceShip

  test("Computer.tryPlaceShip calls player.placeShip with correct args.", () => {
    const mockPlayer = { placeShip: jest.fn().mockReturnValue(true) }; // force success
    const computer = new Computer(mockPlayer);

    jest.spyOn(computer, "getRandomInt");

    computer.tryPlaceShip(Ship.VALID_NAMES[0]);

    expect(computer.getRandomInt).toHaveBeenCalledTimes(2);
    expect(computer.getRandomInt).toHaveBeenCalledWith(0, 9);

    expect(mockPlayer.placeShip).toHaveBeenCalledTimes(1);

    expect(mockPlayer.placeShip).toHaveBeenCalledWith(
      expect.any(Number), // row
      expect.any(Number), // column
      Ship.VALID_NAMES[0],
      expect.any(String) // direction
    );
  });

  test("Computer.tryPlaceShip returns false after exceeding placement retries.", () => {
    const mockPlayer = {
      placeShip: jest.fn(() => {
        return false;
      }),
    };

    const computer = new Computer(mockPlayer);

    expect(computer.tryPlaceShip(Ship.VALID_NAMES[0])).toEqual(false);

    expect(mockPlayer.placeShip).toHaveBeenCalledTimes(
      Computer.MAX_SHIP_PLACEMENT_ATTEMPTS
    );
  });

  // Tests for placeShipsRandomly

  test("Computer.placeShipsRandomly ensures continuation of ship placement after an invalid position is generated", () => {
    const mockGameboard = { resetBoard: jest.fn() };

    const mockPlayer = {
      gameboard: mockGameboard,
      placeShip: jest.fn((row, col, shipName, direction) => {
        if (row === 10 && col === 8) {
          return false;
        }
      }),
    };

    const computer = new Computer(mockPlayer);

    jest
      .spyOn(computer, "getRandomInt")
      // First ship attempt (invalid horizontal placement)
      .mockReturnValueOnce(10) // rX = 10 (even, horizontal, invalid—out of bounds)
      .mockReturnValueOnce(8) // rY = 8 (column)

      // Retry with valid vertical placement
      .mockReturnValueOnce(3) // rX = 3 (odd, vertical)
      .mockReturnValueOnce(5) // rY = 5 (column)

      // Next ship (valid horizontal)
      .mockReturnValueOnce(2) // rX = 2 (even, horizontal)
      .mockReturnValueOnce(1) // rY = 1

      // Next ship (valid vertical)
      .mockReturnValueOnce(7) // rX = 7 (odd, vertical)
      .mockReturnValueOnce(4) // rY = 4

      // Last ship (valid horizontal)
      .mockReturnValueOnce(4) // rX = 4 (even, horizontal)
      .mockReturnValueOnce(0); // rY = 0

    computer.placeShipsRandomly();

    expect(mockPlayer.placeShip).toHaveBeenCalled();
    expect(mockPlayer.placeShip.mock.calls.length).toBeGreaterThan(5);
  });

  test("Computer.placeShipsRandomly retries and resets grid after failing one fleet placement", () => {
    const mockGameboard = { resetBoard: jest.fn() };
    const mockPlayer = { gameboard: mockGameboard, placeShip: jest.fn() };
    const computer = new Computer(mockPlayer);

    const spy = jest.spyOn(computer, "tryPlaceShip");

    for (let i = 0; i < Ship.VALID_NAMES.length; i++) {
      spy.mockReturnValueOnce(false); // Force failure for 5 ships (1 fleets)
    }

    for (let i = 0; i < Ship.VALID_NAMES.length; i++) {
      spy.mockReturnValueOnce(true); // Force success onwards
    }

    computer.placeShipsRandomly();

    expect(spy).toHaveBeenCalledTimes(Ship.VALID_NAMES.length * 2);
    expect(mockGameboard.resetBoard).toHaveBeenCalledTimes(2);

    // Check that the second resetBoard call happened after the first 5 tryPlaceShip calls
    expect(
      mockGameboard.resetBoard.mock.invocationCallOrder[1]
    ).toBeGreaterThan(
      spy.mock.invocationCallOrder[Ship.VALID_NAMES.length - 1]
    );
  });

  // Tests for getRandomInt

  test("Computer.getRandomInt returns an integer between two constraints.", () => {
    const mockPlayer = { Gameboard: {} };
    const computer = new Computer(mockPlayer);

    const lowerLimit = 0;
    const upperLimit = 10;

    const rand = computer.getRandomInt(lowerLimit, upperLimit);

    expect(Number.isInteger(rand)).toEqual(true);
    expect(rand).toBeGreaterThanOrEqual(lowerLimit);
    expect(rand).toBeLessThanOrEqual(upperLimit);
  });
});
