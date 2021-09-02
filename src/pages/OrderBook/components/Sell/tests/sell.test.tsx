import React from "react";
import { fireEvent, getByTestId, render } from "@testing-library/react";
import configureMockStore from 'redux-mock-store';
import { Provider } from "react-redux";
import { Sell } from "..";

const mockStore = configureMockStore();

const mockStoreInitialized = mockStore({
  test: {
    data: {
      name: 'Matt',
      message: 'Hello'
    },
    loading: false,
    error: null
  },
  orderBook: {
    data: {
      grouping: 0.5,
      feed: 'PI_XBTUSD'
    },
    loading: false,
    error: null
  }
});

describe("Sell component", () => {
  test("Renders table header", () => {
    const { getByText } = render(
      <Provider store={mockStoreInitialized}>
        <Sell asksList={[]} />
      </Provider>
    );
    expect(getByText(/Total/i)).toBeInTheDocument();
    expect(getByText(/Size/i)).toBeInTheDocument();
    expect(getByText(/Price/i)).toBeInTheDocument();
  });

  test("Renders loading spinner when no data", () => {
    const { getByTestId } = render(
      <Provider store={mockStoreInitialized}>
        <Sell asksList={[]} />
      </Provider>
    );
    expect(getByTestId("GroupedBids__Loading")).toBeTruthy();
  });

  test("Renders correctly when given data", () => {
    const expected = [ 
      { price: "107", size: "10", total: "10" },
      { price: "108", size: "1", total: "11" },
      { price: "110", size: "5", total: "16" }
    ];

    const { queryAllByTestId } = render(
      <Provider store={mockStoreInitialized}>
        <Sell asksList={[ [107, 10], [108, 1], [110, 5] ]} />
      </Provider>
    );

    const rows: HTMLElement[] = queryAllByTestId("OrderBook__Row");
    expect(rows).toHaveLength(3);

    for(let i = 0; i < rows.length; i++) {
      const row: HTMLElement = rows[i];
      expect(getByTestId(row, "OrderBook__Row__Total")).toHaveTextContent(expected[i].total);
      expect(getByTestId(row, "OrderBook__Row__Size")).toHaveTextContent(expected[i].size);
      expect(getByTestId(row, "OrderBook__Row__Price")).toHaveTextContent(expected[i].price);
    }
  });
});
