import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { BuyProps } from './types';
import { Order } from "hooks";

import "./style.scss"

const getPercentage = (value: number, total: number) => Math.round((value / total) * 100);

export const Buy: FC<BuyProps> = props => {
  const dispatch = useDispatch();
  const { bids } = props;
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  
  let total: number = 0;
  let highestTotal: number = [...bids.values()].reduce((prev, curr) => prev + curr, 0);
  console.log({highestTotal});

  return (
    <div className="OrderBook__Buy">
      <div className="OrderBook__Row">
        <div>Total</div>
        <div>Size</div>
        <div>Price</div>
      </div>
      {[...bids.entries()].map((bid: [number, number], index: number) => {
        const [price, size] = bid;
        total += size;
        const depth: number = getPercentage(total, highestTotal);
        return (
          <div className="OrderBook__Row" style={{ background: `linear-gradient(to left, #113534 ${depth}%, transparent ${depth}%)` }} key={index}>
            <div>{total}</div>
            <div>{size}</div>
            <div>{price}</div>
          </div>
        )
      })}
    </div>
  );
};
