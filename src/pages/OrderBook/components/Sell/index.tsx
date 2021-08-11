import React, { ChangeEvent, FC } from "react";
import { useSelector, useDispatch } from "react-redux";

import { RootState, OrderBookState } from "state/types"
import { LoadingSpinner } from "components/LoadingSpinner";
import { Button } from "components/Button";
import { Dropdown } from "components/Dropdown";
import { SellProps } from './types';
import { Order } from "hooks";

import "./style.scss"
import { groupData, highestTotal } from "helpers";

const getPercentage = (value: number, total: number) => Math.round((value / total) * 100);

export const Sell: FC<SellProps> = props => {
  const dispatch = useDispatch();
  const { data: { grouping, feed }, error, loading }: OrderBookState = useSelector((state: RootState) => state.orderBook);
  const { asks = [] } = props;
  const bidsList: Array<[number, number]> = [...asks.entries()];
  
  let total: number = 0;
  const highest: number = highestTotal(bidsList);
  const groupedBids: Map<number, Order> = groupData(bidsList, grouping);
  
  return (
    <div className="OrderBook__Sell">
      <div className="OrderBook__Row">
        <div>Price</div>
        <div>Size</div>
        <div>Total</div>
      </div>
      {[...groupedBids.entries()].map((ask: [number, Order], index: number) => {
        const [price, order] = ask;
        total += order.size;
        const depth: number = getPercentage(total, highest);
        return (
          <div className="OrderBook__Row" style={{ background: `linear-gradient(to right, #3d1e28 ${depth}%, transparent ${depth}%)` }} key={index}>
            <div>{price}</div>
            <div>{order.size}</div>
            <div>{total}</div>
          </div>
        )
      })}
    </div>
  );
};
