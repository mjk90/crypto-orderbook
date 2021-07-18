import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { SellProps } from './types';

import "./style.scss"

export const Sell: FC<SellProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);

  return (
    <div className="OrderBook__Sell">
      Sell
    </div>
  );
};