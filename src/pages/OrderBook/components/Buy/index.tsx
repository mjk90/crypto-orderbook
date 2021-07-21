import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { BuyProps } from './types';
import { Order } from "hooks";

import "./style.scss"

export const Buy: FC<BuyProps> = props => {
  const dispatch = useDispatch();
  const { bids = [] } = props;
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);

  return (
    <div className="OrderBook__Buy">
      <div>Total</div>
      <div>Size</div>
      <div>Price</div>
      {bids.map((bid: Order, index: number) => 
        <React.Fragment key={index}>
          <div>Temp</div>
          <div>{bid.size}</div>
          <div>{bid.price}</div>
        </React.Fragment>
      )}
    </div>
  );
};
