import { percentage, lowestMultiple, highestTotal, groupData, getSpread } from "../orders";
import { Order } from "types/order";

describe("percentage", () => {
  test("Valid percentage of integer", () => expect(percentage(1, 10)).toBe(10));
  test("Valid percentage of float", () => expect(percentage(0.5, 5)).toBe(10));
  test("Limit percentage to 2 decimal places", () => expect(percentage(1.5, 10000)).toBe(0.01));
});

describe("lowestMultiple", () => {
  test("Lowest multiple of 10", () => expect(lowestMultiple(1, 10)).toBe(0));
  test("Lowest multiple of 25", () => expect(lowestMultiple(33.5, 25)).toBe(25));
  test("Lowest multiple limited to 2 decimal places", () => expect(lowestMultiple(0.0052, 0.005)).toBe(0.01));
});

describe("highestTotal", () => {
  test("Valid Highest total", () => {
    const input: Array<Order> = [
      { price: 1, size: 1, total: 1 },
      { price: 1, size: 1, total: 2 },
      { price: 1, size: 1, total: 3 }
    ];
    expect(highestTotal(input)).toBe(3)
  });
  test("Highest total (no totals found)", () => {
    const input: Array<Order> = [
      { price: 1, size: 1 },
      { price: 1, size: 1 },
      { price: 1, size: 1 }
    ];
    expect(highestTotal(input)).toBe(0)
  });
  test("Highest total empty array", () => expect(highestTotal([])).toBe(0));
});

describe("groupData", () => {
  test("Group to nearest 10", () => {
    const input: Array<number[]> = [ [ 10, 1 ], [ 14, 2 ], [ 15, 5 ], [ 18, 3 ], [ 24, 8 ], [29.5, 8] ];
    const expected: Map<number, Order> = new Map<number, Order>([
      [ 10, { price: 10, size: 11, total: 11 } ],
      [ 20, { price: 20, size: 16, total: 27 } ]
    ]);
    expect(groupData(input, 10)).toEqual(expected)
  });
  test("Group to nearest 0.25", () => {
    const input: Array<number[]> = [ [ 0.25, 1 ], [ 0.27, 2 ], [ 0.45, 3 ], [ 0.5, 4 ], [ 0.65, 5 ], [0.8, 6] ];
    const expected: Map<number, Order> = new Map<number, Order>([
      [ 0.25, { price: 0.25, size: 6, total: 6 } ],
      [ 0.5, { price: 0.5, size: 9, total: 15 } ],
      [ 0.75, { price: 0.75, size: 6, total: 21 } ]
    ]);
    expect(groupData(input, 0.25)).toEqual(expected)
  });
  test("Empty input", () => {
    const input: Array<number[]> = [];
    const expected: Map<number, Order> = new Map<number, Order>();
    expect(groupData(input, 0.25)).toEqual(expected)
  });
});

describe("getSpread", () => {
  test("Valid spread", () => {
    const asks: Array<[number, number]> = [ [ 48365.5, 1 ], [ 48366, 1 ], [ 48367.5, 1 ] ];
    const bids: Array<[number, number]> = [ [ 48358.5, 1 ], [ 48355.5, 1 ], [ 48352, 1 ] ];
    expect(getSpread(asks, bids)).toBe("7.00 (0.01%)")
  });
  test("Empty spread", () => expect(getSpread([], [])).toBe("-- (--%)"));
});
