import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { BuyProps } from './types';

import "./style.scss"

export const Buy: FC<BuyProps> = props => {
  const dispatch = useDispatch();
  const { bids = [] } = props;
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);

  return (
    <div className="OrderBook__Buy">
      <div>Price</div>
      <div>Amount</div>
      <div>Total</div>
      {bids.map((bid: any, index: number) => <div key={index}>{bid}</div>)}
    </div>
  );
};
