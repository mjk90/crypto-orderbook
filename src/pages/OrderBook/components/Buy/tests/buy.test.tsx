import React from "react";
import { fireEvent, getByTestId, render } from "@testing-library/react";
import configureMockStore from 'redux-mock-store';
import { Provider } from "react-redux";
import { Buy } from "..";

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

describe("Buy component", () => {
  test("Renders table header", () => {
    const { getByText } = render(
      <Provider store={mockStoreInitialized}>
        <Buy bidsList={[]} />
      </Provider>
    );
    expect(getByText(/Total/i)).toBeInTheDocument();
    expect(getByText(/Size/i)).toBeInTheDocument();
    expect(getByText(/Price/i)).toBeInTheDocument();
  });

  test("Renders loading spinner when no data", () => {
    const { getByTestId } = render(
      <Provider store={mockStoreInitialized}>
        <Buy bidsList={[]} />
      </Provider>
    );
    expect(getByTestId("GroupedBids__Loading")).toBeTruthy();
  });

  test("Renders correctly when given data", () => {
    const expected = [ 
      { price: "105", size: "1", total: "1" },
      { price: "102", size: "5", total: "6" },
      { price: "101", size: "2", total: "8" }
    ];

    const { queryAllByTestId } = render(
      <Provider store={mockStoreInitialized}>
        <Buy bidsList={[ [105, 1], [102, 5], [101, 2] ]} />
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
