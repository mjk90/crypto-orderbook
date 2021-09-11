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
        data: {
          grouping: action.payload.grouping || state.data.grouping,
          feed: action.payload.feed || state.data.feed
        },
        loading: false,
        error: null
      }
    },
    setError: (state: OrderBookState, action: PayloadAction<string>) => { 
      return {
        ...state,
        error: action.payload
      }
    }
  }
});

export const { setOptions, setError } = orderBookSlice.actions;

export default orderBookSlice.reducer;
