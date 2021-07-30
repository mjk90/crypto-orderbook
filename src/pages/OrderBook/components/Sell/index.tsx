import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { SellProps } from './types';
import { Order } from "hooks";

import "./style.scss"

export const Sell: FC<SellProps> = props => {
  const dispatch = useDispatch();
  const { asks = [] } = props;
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);

  return (
    <div className="OrderBook__Sell">
      <div>Total</div>
      <div>Size</div>
      <div>Price</div>
      {[...asks.values()].map((ask: Order, index: number) => 
        <React.Fragment key={index}>
          <div>Temp</div>
          <div>{ask.size}</div>
          <div>{ask.price}</div>
        </React.Fragment>
      )}
    </div>
  );
};
