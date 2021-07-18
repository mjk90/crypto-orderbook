import { PayloadAction } from "@reduxjs/toolkit";
import { TestState } from "state/types";
import createGenericSlice from "state/createGenericSlice";

const initState: TestState = {
  data: {
    name: "Matt",
    message: "Hello"
  },
  loading: false,
  error: null
};

const testSlice = createGenericSlice({
  name: "test",
  initialState: initState,
  reducers: {
    randomName: (state: TestState): TestState => {
      return {
        ...state,
        data: {
          ...state.data,
          name: Math.random().toString(36).substr(2, 5)
        },
        loading: false,
        error: null
      }
    },
    setName: (state: TestState, action: PayloadAction<string>): TestState => {
      return {
        ...state,
        data: {
          ...state.data,
          name: action.payload
        },
        loading: false,
        error: null
      }
    }
  }
});

export const { randomName, setName } = testSlice.actions;

export default testSlice.reducer;