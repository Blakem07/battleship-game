import Ship from "./Ship.js";

export const validShipPositions = [
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
