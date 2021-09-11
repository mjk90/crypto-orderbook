import reducer, { setOptions, setError } from '../reducer';
import { OrderBookData, OrderBookState } from "../../../state/types";

describe("OrderBook Reducer", () => {
  const initial: OrderBookState = {
    data: { 
      feed: "PI_XBTUSD", 
      grouping: 0.5 
    }, 
    loading: true,
    error: null
  };

  test("Returns initial state", () => expect(reducer(undefined, {})).toEqual(initial));

  test("setOptions valid input", () => {
    const expected: OrderBookState = {
      data: { 
        feed: "PI_ETHUSD", 
        grouping: 1
      },
      loading: false,
      error: null
    };
    expect(reducer(initial, setOptions({ grouping: 1, feed: "PI_ETHUSD" }))).toEqual(expected);
  });

  test("setOptions invalid options ignored", () => {
    const expected: OrderBookState = {
      ...initial,
      loading: false,
    };
    expect(reducer(initial, setOptions({ grouping: null, feed: undefined }))).toEqual(expected);
  });

  test("setError", () => {
    const expected: OrderBookState = {
      ...initial,
      error: "test_error"
    };
    expect(reducer(initial, setError("test_error"))).toEqual(expected);
  });
});
