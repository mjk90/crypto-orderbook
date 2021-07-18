import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { OrderBookPageProps } from "./types";
import { setOptions } from './reducer';

export const OrderBookPage: FC<OrderBookPageProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);

  return (
    <React.Fragment>
      {
        loading ? <LoadingSpinner /> :
        error ? <div>Error: {error}</div> :
        <div>
          <select value={grouping} onChange={(e: ChangeEvent<HTMLSelectElement>) => dispatch(setOptions({ grouping: parseFloat(e.target.value), feed }))}>
            <option>0.5</option>
            <option>1</option>
            <option>1.5</option>
          </select>
          {/* <button onClick={() => dispatch(setName("Matt"))}>Reset</button>
          <button onClick={() => dispatch(randomName())}>Random</button> */}
        </div>
      }
    </React.Fragment>
  );
};