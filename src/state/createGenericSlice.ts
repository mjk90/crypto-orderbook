import { createSlice, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit"
import { GenericState } from "./types";

const createGenericSlice = <Type, Reducers extends SliceCaseReducers<GenericState<Type>>> 
({
  name = '',
  initialState,
  reducers,
}: {
  name: string
  initialState: GenericState<Type>
  reducers: ValidateSliceCaseReducers<GenericState<Type>, Reducers>
}) => {
  return createSlice({
    name, 
    initialState, 
    reducers: {
      start: (state: GenericState<Type>) => {
        return {
          ...state,
          loading: true,
          error: null
        }
      },
      /**
       * If you want to write to values of the state that depend on the generic
       * (in this case: `state.data`, which is T), you might need to specify the
       * State type manually here, as it defaults to `Draft<GenericState<T>>`,
       * which can sometimes be problematic with yet-unresolved generics.
       * This is a general problem when working with immer's Draft type and generics.
       */
      success: (state: GenericState<Type>, action: PayloadAction<Type>) => {
        return {
          ...state,
          data: action.payload,
          loading: false,
          error: null
        }
      },
      ...reducers,
    },
  })
};

export default createGenericSlice;