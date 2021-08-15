import { PayloadAction } from "@reduxjs/toolkit";
import { OrderBookData, OrderBookState } from "state/types";
import createGenericSlice from "state/createGenericSlice";

const initState: OrderBookState = {
  data: {
    grouping: 0.5,
    feed: "PI_XBTUSD"
  },
  loading: true,
  error: null
};

const orderBookSlice = createGenericSlice({
  name: "orderBook",
  initialState: initState,
  reducers: {
    setOptions: (state: OrderBookState, action: PayloadAction<OrderBookData>): OrderBookState => {
      return {
        ...state,
        data: action.payload,
        loading: false,
        error: null
      }
    }
  }
});

export const { setOptions } = orderBookSlice.actions;

export default orderBookSlice.reducer;