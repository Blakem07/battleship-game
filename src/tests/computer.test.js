import Ship from "../classes/Ship";
import Computer from "../classes/Computer";

describe("Computer Class Tests", () => {
  test("Computer Class intialized with an instance of player.", () => {
    const mockPlayer = {};
    const computer = new Computer(mockPlayer);

    expect(computer.player).toBe(mockPlayer);
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
    expect(computer.getRandomInt).toHaveBeenCalledWith(0, 10);
    expect(computer.player.attack).toHaveBeenCalledWith(mockOpponent, 3, 7);
    expect(result).toBe("attack result");
  });

  // Tests for placeShipsRandomly

  test("Computer.placeShipsRandomly calls player.placeShip for all 5 types of ship with correct args.", () => {
    const mockPlayer = { placeShip: jest.fn() };
    const computer = new Computer(mockPlayer);

    jest.spyOn(computer, "getRandomInt");

    computer.placeShipsRandomly();

    expect(computer.getRandomInt).toHaveBeenCalledTimes(10);
    expect(computer.getRandomInt).toHaveBeenCalledWith(0, 10);

    const shipNames = Ship.VALID_NAMES;

    expect(mockPlayer.placeShip).toHaveBeenCalledTimes(5);

    shipNames.forEach((shipName, index) => {
      expect(mockPlayer.placeShip).toHaveBeenNthCalledWith(
        index + 1, // call number
        expect.any(Number), // row
        expect.any(Number), // column
        shipName, // ship name
        expect.any(String) // direction
      );
    });
  });

  test("Computer.placeShipsRandomly ensures continuation of ship placement after an invalid position is generated", () => {
    const mockPlayer = {
      placeShip: jest.fn((row, col, shipName, direction) => {
        if (row === 10 && col === 8) {
          throw new Error("Out of bounds");
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

  test("Computer.placeShipsRandomly throws an error after failing to place a ship after exceeding maximum retries.", () => {
    const mockPlayer = {
      placeShip: jest.fn(() => {
        throw new Error("Out of bounds");
      }),
    };

    const computer = new Computer(mockPlayer);

    expect(() => computer.placeShipsRandomly()).toThrow(
      "Failed to place ship:"
    );

    expect(mockPlayer.placeShip).toHaveBeenCalledTimes(
      Computer.MAX_SHIP_PLACEMENT_ATTEMPTS
    );
  });

  // Tests for getRandomInt

  test("Computer.getRandomInt returns a number between two constraints.", () => {
    const computer = new Computer();

    const lowerLimit = 0;
    const upperLimit = 10;

    expect(computer.getRandomInt(upperLimit, lowerLimit)).toBeGreaterThan(
      lowerLimit
    );

    expect(computer.getRandomInt(upperLimit, lowerLimit)).toBeLessThan(
      upperLimit
    );
  });
});
