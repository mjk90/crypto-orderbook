import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App component", () => {
  test("Renders title", () => {
    const { getByText } = render(<App />, { wrapper: MemoryRouter });
    expect(getByText(/Crypto Order Book/i)).toBeInTheDocument();
  });
  
  test("Renders orderbook component", () => {
    const { queryByTestId } = render(<App />, { wrapper: MemoryRouter });
    expect(queryByTestId("OrderBook")).toBeTruthy();
  });

  test("Navigation works", async () => {
    const { getByTestId, queryByTestId } = render(<App />, { wrapper: MemoryRouter });
    const navButton = getByTestId("Nav__Test");
    expect(navButton).toBeTruthy();
    
    fireEvent.click(navButton);
    expect(await queryByTestId("TestPage")).toBeTruthy();
    expect(queryByTestId("OrderBook")).toBeFalsy();
  });
});
