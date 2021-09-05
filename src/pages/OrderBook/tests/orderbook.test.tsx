import React from "react";
import { render } from "@testing-library/react";
import configureMockStore from 'redux-mock-store';
import { Provider } from "react-redux";
import { OrderBookPage } from "..";

const mockStore = configureMockStore();

const mockStoreObject = {
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
};

describe("OrderBook component", () => {  
  test("Renders component title with feed", () => {
    const store = mockStore(mockStoreObject);
    const { getByText } = render(
      <Provider store={store}>
        <OrderBookPage />
      </Provider>
    );
    expect(getByText(/Order Book \((\n*)PI_XBTUSD(\n*)\)/i)).toBeInTheDocument();
  });

  test("Renders loading spinner when loading", () => {
    const store = mockStore({ mockStoreObject, orderBook: { ...mockStoreObject.orderBook, loading: true } });
    const { getByTestId } = render(
      <Provider store={store}>
        <OrderBookPage />
      </Provider>
    );
    expect(getByTestId("OrderBook__Loading")).toBeTruthy(); 
  });

  test("Renders error message", () => {
    const store = mockStore({ mockStoreObject, orderBook: { ...mockStoreObject.orderBook, error: "Test error" } });
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <OrderBookPage />
      </Provider>
    );
    expect(getByTestId("OrderBook__Error")).toBeTruthy(); 
    expect(getByText(/Error: Test error/i)).toBeInTheDocument();
  });

  test("Renders reconnecting message", () => {
    const store = mockStore(mockStoreObject);
    const { getByTestId } = render(
      <Provider store={store}>
        <OrderBookPage />
      </Provider>
    );
    expect(getByTestId("OrderBook_Reconnecting")).toBeTruthy(); 
  });

  test("Renders spread", () => {
    const store = mockStore(mockStoreObject);
    const { getAllByText } = render(
      <Provider store={store}>
        <OrderBookPage />
      </Provider>
    );
    expect(getAllByText(/Spread:(\n*)(\s*)-- \(--%\)/i)).toBeTruthy();
  });
});
