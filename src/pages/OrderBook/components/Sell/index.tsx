import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { SellProps } from './types';
import { Order } from "hooks";

import "./style.scss"

const getPercentage = (value: number, total: number) => Math.round((value / total) * 100);

export const Sell: FC<SellProps> = props => {
  const dispatch = useDispatch();
  const { asks = [] } = props;
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  
  let total: number = 0;
  let highestTotal: number = [...asks.values()].reduce((prev, curr) => prev + curr, 0);
  console.log({highestTotal});
  
// 60,29,39
  return (
    <div className="OrderBook__Sell">
      <div className="OrderBook__Row">
        <div>Price</div>
        <div>Size</div>
        <div>Total</div>
      </div>
      {[...asks.entries()].map((bid: [number, number], index: number) => {
        const [price, size] = bid;
        total += size;
        const depth: number = getPercentage(total, highestTotal);
        return (
          <div className="OrderBook__Row" style={{ background: `linear-gradient(to right, #3d1e28 ${depth}%, transparent ${depth}%)` }} key={index}>
            <div>{price}</div>
            <div>{size}</div>
            <div>{total}</div>
          </div>
        )
      })}
    </div>
  );
};
